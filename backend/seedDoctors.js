const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clean existing seed users/doctors
    await User.deleteMany({ email: { $in: ['cardiologist@hospital.com', 'pediatrician@hospital.com', 'patient@example.com'] } });
    await Doctor.deleteMany({ email: { $in: ['cardiologist@hospital.com', 'pediatrician@hospital.com'] } });

    // 1. Create Patient User
    await User.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 9999988888',
    });

    // 2. Create Cardiologist Doctor User
    const docUser1 = await User.create({
      name: 'Dr. Vinay Kumar',
      email: 'cardiologist@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543211',
    });

    // Create Doctor Profile (Pre-approved)
    await Doctor.create({
      userId: docUser1._id,
      firstName: 'Vinay',
      lastName: 'Kumar',
      email: 'cardiologist@hospital.com',
      phone: '+91 9876543211',
      address: '123 Heart Care Clinic, Bangalore',
      specialization: 'Cardiologist',
      experience: '12',
      feesPerConsultation: 800,
      timings: ['09:00 AM', '05:00 PM'],
      status: 'approved',
      rating: 4.8,
      totalRatings: 15,
    });

    // 2. Create Pediatrician Doctor User
    const docUser2 = await User.create({
      name: 'Dr. Anjali Sharma',
      email: 'pediatrician@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543212',
    });

    // Create Doctor Profile (Pre-approved)
    await Doctor.create({
      userId: docUser2._id,
      firstName: 'Anjali',
      lastName: 'Sharma',
      email: 'pediatrician@hospital.com',
      phone: '+91 9876543212',
      address: '456 Kid Care Center, Bangalore',
      specialization: 'Pediatrician',
      experience: '8',
      feesPerConsultation: 600,
      timings: ['10:00 AM', '04:00 PM'],
      status: 'approved',
      rating: 4.7,
      totalRatings: 12,
    });

    console.log('✅ Pre-approved Doctors & Test Patient Seeded Successfully!');
    console.log('   1. Patient Account: patient@example.com / patient123');
    console.log('   2. Dr. Vinay Kumar: cardiologist@hospital.com / doctor123');
    console.log('   3. Dr. Anjali Sharma: pediatrician@hospital.com / doctor123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding doctors:', err.message);
    process.exit(1);
  }
};

seedDoctors();
