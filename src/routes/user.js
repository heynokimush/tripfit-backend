const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /user/nickname:
 *   patch:
 *     summary: 닉네임 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 변경할 닉네임 (10글자 이하)
 *     responses:
 *       200:
 *         description: 수정 성공
 *       400:
 *         description: 유효하지 않은 닉네임
 *       409:
 *         description: 중복 닉네임
 */
router.patch('/nickname', verifyToken, userController.updateNickname);

module.exports = router;