const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, tripController.getTrips);
router.get('/:uuid', verifyToken, tripController.getTripDetail);

router.post('/:tripId/spots', verifyToken, spotController.addSpot);
router.patch('/:tripId/spots/:spotId', verifyToken, spotController.updateSpot);
router.delete('/:tripId/spots/:spotId', verifyToken, spotController.deleteSpot);

module.exports = router;