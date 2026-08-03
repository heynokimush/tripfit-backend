const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /invite/trip/{uuid}:
 *   post:
 *     summary: 여행 초대 링크 생성
 *     tags: [Invite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: 초대할 여행 UUID
 *     responses:
 *       201:
 *         description: 초대 링크 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inviteUrl:
 *                   type: string
 *                   example: https://tripfit-web.vercel.app/invite/example-token
 *       403:
 *         description: 여행 접근 권한 없음
 *       404:
 *         description: 여행 정보 없음
 */

// 초대 링크 생성
router.post('/trip/:uuid', verifyToken, inviteController.createInvite);

module.exports = router;