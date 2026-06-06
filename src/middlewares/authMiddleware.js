const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer 토큰" 형식

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 이후 컨트롤러에서 req.user로 유저 정보 접근
    next();
  } catch (err) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = { verifyToken };