const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAllDoctors,
  updateDoctorStatus,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/status', updateDoctorStatus);

module.exports = router;
