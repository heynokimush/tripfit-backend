const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, tripController.getTrips);
router.get('/:tripId', verifyToken, tripController.getTripDetail);

module.exports = router;