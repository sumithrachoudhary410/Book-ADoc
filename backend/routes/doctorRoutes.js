const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  applyAsDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getSpecializations,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/profile/me', protect, getDoctorProfile);
router.put('/profile/me', protect, updateDoctorProfile);
router.post('/apply', protect, applyAsDoctor);
router.get('/:id', getDoctorById);

module.exports = router;
