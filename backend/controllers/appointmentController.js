const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (patient)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (doctor.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Doctor is not available for appointments' });
    }

    // Check for duplicate booking
    const existing = await Appointment.findOne({ doctorId, date, time, status: { $ne: 'rejected' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      patientName: req.user.name,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      date,
      time,
      notes,
      doctorInfo: { specialization: doctor.specialization, fee: doctor.feesPerConsultation },
      patientInfo: { email: req.user.email, phone: req.user.phone },
    });

    // Notify doctor
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.notifications.push({
        message: `New appointment request from ${req.user.name} on ${date} at ${time}`,
      });
      await doctorUser.save();
    }

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/patient
// @access  Private (patient)
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private (doctor)
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const appointments = await Appointment.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (doctor/admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    // Notify patient
    const patient = await User.findById(appointment.patientId);
    if (patient) {
      patient.notifications.push({
        message: `Your appointment on ${appointment.date} at ${appointment.time} has been ${status}`,
      });
      await patient.save();
    }

    res.json({ success: true, message: `Appointment ${status} successfully`, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload document to appointment
// @route   POST /api/appointments/:id/upload
// @access  Private (patient)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.documents.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
    });
    await appointment.save();

    res.json({ success: true, message: 'Document uploaded successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments (admin)
// @route   GET /api/appointments/all
// @access  Private (admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit rating and feedback for completed appointment
// @route   POST /api/appointments/:id/rate
// @access  Private (patient)
const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this appointment' });
    }

    // Verify appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed appointments' });
    }

    // Save feedback to appointment
    appointment.rating = rating;
    appointment.feedback = feedback || '';
    appointment.isReviewed = true;
    await appointment.save();

    // Re-calculate doctor's rating and totalRatings
    const doctorAppointments = await Appointment.find({
      doctorId: appointment.doctorId,
      rating: { $ne: null }
    });

    const totalRatings = doctorAppointments.length;
    const sumRatings = doctorAppointments.reduce((sum, appt) => sum + appt.rating, 0);
    const averageRating = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0;

    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      rating: averageRating,
      totalRatings: totalRatings
    });

    res.json({ success: true, message: 'Feedback submitted successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  uploadDocument,
  getAllAppointments,
  submitFeedback,
};
