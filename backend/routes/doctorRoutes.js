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
const upload = require('../middleware/uploadMiddleware');

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/profile/me', protect, getDoctorProfile);
router.put('/profile/me', protect, updateDoctorProfile);
router.post('/apply', protect, upload.single('certificate'), applyAsDoctor);
router.get('/:id', getDoctorById);

module.exports = router;
