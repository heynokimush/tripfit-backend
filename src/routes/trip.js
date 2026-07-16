const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const spotController = require('../controllers/spotController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /trip:
 *   get:
 *     summary: 여행 리스트 조회
 *     tags: [Trip]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trips:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       region:
 *                         type: array
 *                         items:
 *                           type: string
 *                       startDate:
 *                         type: string
 *                       endDate:
 *                         type: string
 *                       nights:
 *                         type: number
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get('/', verifyToken, tripController.getTrips);

/**
 * @swagger
 * /trip/{uuid}:
 *   get:
 *     summary: 여행 상세 조회
 *     tags: [Trip]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: 여행 UUID
 *     responses:
 *       200:
 *         description: 조회 성공
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 여행 정보 없음
 */
router.get('/:uuid', verifyToken, tripController.getTripDetail);


/**
 * @swagger
 * /trip/{uuid}/spots:
 *   post:
 *     summary: 일정 추가
 *     tags: [Spot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               mapx:
 *                 type: string
 *               mapy:
 *                 type: string
 *     responses:
 *       201:
 *         description: 추가 성공
 */
router.post('/:uuid/spots', verifyToken, spotController.addSpot);

/**
 * @swagger
 * /trip/{uuid}/spots/{spotId}:
 *   patch:
 *     summary: 일정 수정
 *     tags: [Spot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: spotId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               mapx:
 *                 type: string
 *               mapy:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 장소 없음
 */
router.patch('/:uuid/spots/:spotId', verifyToken, spotController.updateSpot);

/**
 * @swagger
 * /trip/{uuid}/spots/{spotId}:
 *   delete:
 *     summary: 일정 삭제
 *     tags: [Spot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: spotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 장소 없음
 */
router.delete('/:uuid/spots/:spotId', verifyToken, spotController.deleteSpot);

module.exports = router;