const axios = require('axios');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const redis = require('../redis');

// JWT 발급 헬퍼 함수
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
  return { accessToken, refreshToken };
};

// 랜덤 닉네임 생성 헬퍼 함수
const generateNickname = () => {
  const adjectives = ['행복한', '신나는', '즐거운', '멋진', '귀여운'];
  const nouns = ['여행자', '탐험가', '모험가', '나그네', '여행꾼'];
  const random = Math.floor(Math.random() * 9000) + 1000;
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${random}`;
};

// 카카오 로그인
const kakaoLogin = async (req, res) => {
  const { code } = req.body; // 프론트에서 인가코드 전달

  if (!code) {
    return res.status(400).json({ message: '인가코드가 없습니다.' });
  }

  try {
    // 1. 인가코드로 카카오 액세스토큰 요청
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const kakaoAccessToken = tokenResponse.data.access_token;

    // 2. 카카오 액세스토큰으로 유저 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });

    const kakaoId = String(userResponse.data.id);
    const profileImageUrl = userResponse.data.kakao_account?.profile?.profile_image_url || null;

    // 3. DB에서 유저 조회 or 신규 생성
    let user = await prisma.user.findUnique({ where: { kakaoId } });

    if (!user) {
      // 닉네임 중복 방지 루프
      let nickname;
      let isDuplicate = true;
      while (isDuplicate) {
        nickname = generateNickname();
        const existing = await prisma.user.findUnique({ where: { nickname } });
        if (!existing) isDuplicate = false;
      }

      user = await prisma.user.create({
        data: { kakaoId, nickname, profileImageUrl },
      });
    }

    // 4. JWT 발급
    const { accessToken, refreshToken } = generateTokens(user.id);

    // 5. Redis에 refreshToken 저장 (key: refresh:유저id)
    await redis.set(`refresh:${user.id}`, refreshToken, { ex: 60 * 30 }); // 30분

    // 6. refreshToken 쿠키에 담기
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,   // JS에서 접근 불가
      secure: true,     // HTTPS만 허용
      sameSite: 'none', // 크로스 도메인 허용
      maxAge: 30 * 60 * 1000, // 30분
    });

    // 7. 응답
    return res.status(200).json({
      accessToken,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
    });

  } catch (err) {
    console.error('카카오 로그인 에러:', err.message);
    return res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
  }
};

// 로그아웃
const logout = async (req, res) => {
  const { userId } = req.user;

  try {
    // Redis에서 refreshToken 삭제
    await redis.del(`refresh:${userId}`);

    // 쿠키 삭제
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).json({ message: '로그아웃 되었습니다.' });
  } catch (err) {
    console.error('로그아웃 에러:', err.message);
    return res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
  }
};

// 토큰 재발급
const rotateToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  if (!refreshToken) {
    return res.status(401).json({ message: 'refreshToken이 없습니다.' });
  }

  try {
    // refreshToken 검증 (만료/위조 체크)
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Redis에 저장된 refreshToken과 비교
    const savedToken = await redis.get(`refresh:${userId}`);

    if (!savedToken || savedToken !== refreshToken) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(401).json({ message: '유효하지 않은 refreshToken입니다.' });
    }

    // 새 토큰 발급
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);

    await redis.set(`refresh:${userId}`, newRefreshToken, { ex: 60 * 30 });

    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });

  } catch (err) {
    // refreshToken 만료 또는 위조된 경우 (jwt.verify 실패)
    res.clearCookie('refreshToken', cookieOptions);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'refreshToken이 만료되었습니다. 다시 로그인해주세요.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 refreshToken입니다.' });
    }

    console.error('토큰 재발급 에러:', err.message);
    return res.status(500).json({ message: '토큰 재발급 중 오류가 발생했습니다.' });
  }
};

module.exports = { kakaoLogin, logout, rotateToken };