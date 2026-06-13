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
    const targetEmails = [
      'cardiologist@hospital.com',
      'pediatrician@hospital.com',
      'dermatologist@hospital.com',
      'neurologist@hospital.com',
      'orthopedist@hospital.com',
      'patient@example.com'
    ];
    await User.deleteMany({ email: { $in: targetEmails } });
    await Doctor.deleteMany({ email: { $in: targetEmails } });

    // 1. Create Patient User
    await User.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 9999988888',
    });

    // 2. Create Cardiologist
    const docUser1 = await User.create({
      name: 'Dr. Vinay Kumar',
      email: 'cardiologist@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543211',
    });
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

    // 3. Create Pediatrician
    const docUser2 = await User.create({
      name: 'Dr. Anjali Sharma',
      email: 'pediatrician@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543212',
    });
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

    // 4. Create Dermatologist
    const docUser3 = await User.create({
      name: 'Dr. Sameer Sen',
      email: 'dermatologist@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543213',
    });
    await Doctor.create({
      userId: docUser3._id,
      firstName: 'Sameer',
      lastName: 'Sen',
      email: 'dermatologist@hospital.com',
      phone: '+91 9876543213',
      address: '789 Skin & Hair Clinic, Mumbai',
      specialization: 'Dermatologist',
      experience: '10',
      feesPerConsultation: 700,
      timings: ['11:00 AM', '06:00 PM'],
      status: 'approved',
      rating: 4.9,
      totalRatings: 20,
    });

    // 5. Create Neurologist
    const docUser4 = await User.create({
      name: 'Dr. Priya Nair',
      email: 'neurologist@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543214',
    });
    await Doctor.create({
      userId: docUser4._id,
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'neurologist@hospital.com',
      phone: '+91 9876543214',
      address: '101 Brain Science Hospital, Chennai',
      specialization: 'Neurologist',
      experience: '15',
      feesPerConsultation: 1000,
      timings: ['09:30 AM', '04:30 PM'],
      status: 'approved',
      rating: 4.6,
      totalRatings: 18,
    });

    // 6. Create Orthopedist
    const docUser5 = await User.create({
      name: 'Dr. Rajesh Patel',
      email: 'orthopedist@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9876543215',
    });
    await Doctor.create({
      userId: docUser5._id,
      firstName: 'Rajesh',
      lastName: 'Patel',
      email: 'orthopedist@hospital.com',
      phone: '+91 9876543215',
      address: '202 Bone & Joint Center, Ahmedabad',
      specialization: 'Orthopedist',
      experience: '9',
      feesPerConsultation: 500,
      timings: ['02:00 PM', '07:00 PM'],
      status: 'approved',
      rating: 4.5,
      totalRatings: 10,
    });

    console.log('✅ Pre-approved Doctors & Test Patient Seeded Successfully!');
    console.log('   1. Patient Account: patient@example.com / patient123');
    console.log('   2. Dr. Vinay Kumar (Cardiologist): cardiologist@hospital.com / doctor123');
    console.log('   3. Dr. Anjali Sharma (Pediatrician): pediatrician@hospital.com / doctor123');
    console.log('   4. Dr. Sameer Sen (Dermatologist): dermatologist@hospital.com / doctor123');
    console.log('   5. Dr. Priya Nair (Neurologist): neurologist@hospital.com / doctor123');
    console.log('   6. Dr. Rajesh Patel (Orthopedist): orthopedist@hospital.com / doctor123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding doctors:', err.message);
    process.exit(1);
  }
};

seedDoctors();
