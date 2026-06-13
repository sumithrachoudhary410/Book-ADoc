const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  uploadDocument,
  getAllAppointments,
} = require('../controllers/appointmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, bookAppointment);
router.get('/patient', protect, getPatientAppointments);
router.get('/doctor', protect, getDoctorAppointments);
router.get('/all', protect, adminOnly, getAllAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);
router.post('/:id/upload', protect, upload.single('document'), uploadDocument);

module.exports = router;
