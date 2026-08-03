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

/**
 * @swagger
 * /invite/join/{uuid}:
 *   post:
 *     summary: 여행 초대 링크 참여
 *     tags: [Invite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: 참여할 여행 UUID
 *     responses:
 *       200:
 *         description: 여행 참여 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tripId:
 *                   type: string
 *       404:
 *         description: 여행 정보를 찾을 수 없음
 *       409:
 *         description: 이미 참여한 여행
 */

// 초대 링크 참여
router.post('/join/:uuid', verifyToken, inviteController.joinInvite);

module.exports = router;