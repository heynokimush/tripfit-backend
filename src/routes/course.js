const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, courseController.createCourse);

module.exports = router;