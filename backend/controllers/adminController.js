const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'doctor') {
      // Find doctor profile
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        // Find and cancel active appointments, and notify patients
        const activeAppointments = await Appointment.find({
          doctorId: doctor._id,
          status: { $in: ['pending', 'approved'] }
        });

        for (const appt of activeAppointments) {
          appt.status = 'rejected';
          await appt.save();

          const patientUser = await User.findById(appt.patientId);
          if (patientUser) {
            patientUser.notifications.push({
              message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appt.date} at ${appt.time} has been cancelled because the doctor has been removed from the platform.`,
            });
            await patientUser.save();
          }
        }

        // Delete doctor profile
        await Doctor.findByIdAndDelete(doctor._id);
      }
    } else if (user.role === 'patient') {
      // Delete all appointments associated with this patient
      await Appointment.deleteMany({ patientId: user._id });
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();

    // If deactivated and user is a doctor, reject/deactivate their doctor profile status
    if (user.role === 'doctor' && !user.isActive) {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        doctor.status = 'rejected';
        await doctor.save();

        const activeAppointments = await Appointment.find({
          doctorId: doctor._id,
          status: { $in: ['pending', 'approved'] }
        });

        for (const appt of activeAppointments) {
          appt.status = 'rejected';
          await appt.save();

          const patientUser = await User.findById(appt.patientId);
          if (patientUser) {
            patientUser.notifications.push({
              message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appt.date} at ${appt.time} has been cancelled because the doctor's account has been deactivated.`,
            });
            await patientUser.save();
          }
        }
      }
    }

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors (all statuses)
// @route   GET /api/admin/doctors
// @access  Admin
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject doctor
// @route   PUT /api/admin/doctors/:id/status
// @access  Admin
const updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.status = status;
    await doctor.save();

    // If the doctor is rejected/removed, cancel active appointments and notify patients
    if (status !== 'approved') {
      const activeAppointments = await Appointment.find({
        doctorId: doctor._id,
        status: { $in: ['pending', 'approved'] }
      });

      for (const appt of activeAppointments) {
        appt.status = 'rejected';
        await appt.save();

        const patientUser = await User.findById(appt.patientId);
        if (patientUser) {
          patientUser.notifications.push({
            message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appt.date} at ${appt.time} has been cancelled because the doctor is no longer available on the platform.`,
          });
          await patientUser.save();
        }
      }
    }

    // Notify doctor user
    const doctorUser = await User.findById(doctor.userId);
    if (doctorUser) {
      doctorUser.notifications.push({
        message: `Your doctor application has been ${status}. ${
          status === 'approved'
            ? 'You can now receive appointments.'
            : 'Please contact support for more information.'
        }`,
      });
      await doctorUser.save();
    }

    res.json({ success: true, message: `Doctor application ${status} successfully`, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments({ status: 'approved' });
    const pendingDoctors = await Doctor.countDocuments({ status: 'pending' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const approvedAppointments = await Appointment.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, toggleUserStatus, getAllDoctors, updateDoctorStatus, getAdminStats };
