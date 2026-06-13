// Script to create the admin user in the database
// Run: node seedAdmin.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const existing = await User.findOne({ email: 'admin@bookadoc.com' });
    if (existing) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@bookadoc.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 0000000000',
    });

    console.log('✅ Admin user created:');
    console.log('   Email: admin@bookadoc.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
