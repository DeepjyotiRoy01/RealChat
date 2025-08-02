import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      phoneNumber: '7005461841',
      isAdmin: true 
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Deep (Admin)',
      phoneNumber: '7005461841',
      username: 'admin',
      isAdmin: true,
      isVerified: true,
      avatar: '👨‍💼',
      status: 'online',
      isOnline: true,
      lastSeen: new Date()
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Admin credentials:');
    console.log('Name: Deep');
    console.log('Phone: 7005461841');

  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the setup
setupAdmin(); 