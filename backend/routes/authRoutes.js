const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getNotifications, markNotificationsRead } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.post('/notifications/mark-read', protect, markNotificationsRead);

module.exports = router;
