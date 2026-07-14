const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /course:
 *   post:
 *     summary: AI 코스 생성
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 동반 유형 (CHILD, ELDERLY, DISABLED, PET)
 *               regionCodes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     regionName:
 *                       type: string
 *                     areaCode:
 *                       type: string
 *                     sigunguCode:
 *                       type: string
 *               date:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                   endDate:
 *                     type: string
 *     responses:
 *       201:
 *         description: 코스 생성 성공
 *       503:
 *         description: AI 서버 연결 실패
 */
router.post('/', verifyToken, courseController.createCourse);

module.exports = router;