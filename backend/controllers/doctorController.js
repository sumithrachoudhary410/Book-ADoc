const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let filter = { status: 'approved' };

    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply to become a doctor
// @route   POST /api/doctors/apply
// @access  Private (patient)
const applyAsDoctor = async (req, res) => {
  try {
    const existingApplication = await Doctor.findOne({ userId: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already submitted an application' });
    }

    const doctor = await Doctor.create({ ...req.body, userId: req.user._id });

    // Update user role to doctor
    await User.findByIdAndUpdate(req.user._id, { role: 'doctor' });

    // Notify admin
    await User.updateMany(
      { role: 'admin' },
      {
        $push: {
          notifications: {
            message: `New doctor application from ${req.body.firstName} ${req.body.lastName}`,
          },
        },
      }
    );

    res.status(201).json({ success: true, message: 'Application submitted successfully', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor profile for logged-in doctor
// @route   GET /api/doctors/profile/me
// @access  Private (doctor)
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile/me
// @access  Private (doctor)
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, message: 'Profile updated successfully', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all unique specializations
// @route   GET /api/doctors/specializations
// @access  Public
const getSpecializations = async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization', { status: 'approved' });
    res.json({ success: true, data: specializations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDoctors, getDoctorById, applyAsDoctor, getDoctorProfile, updateDoctorProfile, getSpecializations };
