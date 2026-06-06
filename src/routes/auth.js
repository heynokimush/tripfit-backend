const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// 카카오 로그인
router.post('/', authController.kakaoLogin);

// 로그아웃
router.post('/logout', verifyToken, authController.logout);

// 토큰 재발급
router.post('/rotateToken', authController.rotateToken);

module.exports = router;