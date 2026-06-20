const prisma = require('../prisma');

const updateNickname = async (req, res) => {
  const { userId } = req.user;
  const { nickname } = req.body;

  // 닉네임 값 검증
  if (!nickname || nickname.trim().length === 0) {
    return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  }

  if (nickname.length > 10) {
    return res.status(400).json({ message: '닉네임은 10글자 이하로 입력해주세요.' });
  }

  try {
    // 닉네임 중복 체크 (본인 제외)
    const existing = await prisma.user.findUnique({ where: { nickname } });

    if (existing && existing.id !== userId) {
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
    }

    // 닉네임 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { nickname },
    });

    return res.status(200).json({
      nickname: updatedUser.nickname,
    });

  } catch (err) {
    console.error('닉네임 수정 에러:', err.message);
    return res.status(500).json({ message: '닉네임 수정 중 오류가 발생했습니다.' });
  }
};

module.exports = { updateNickname };