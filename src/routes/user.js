const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.patch('/nickname', verifyToken, userController.updateNickname);

module.exports = router;