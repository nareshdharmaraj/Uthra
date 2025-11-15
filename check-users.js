const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_db';

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    const BaseUser = mongoose.model('BaseUser', new mongoose.Schema({}, { strict: false }), 'baseusers');
    const Buyer = mongoose.model('Buyer', new mongoose.Schema({}, { strict: false }), 'buyers');
    
    // Check all users in baseusers collection
    const totalUsers = await BaseUser.countDocuments();
    console.log('\n📊 Total baseusers:', totalUsers);

    // Get farmers with full details
    const farmers = await BaseUser.find({ role: 'farmer' }).lean();
    console.log('\n👨‍🌾 Farmers in baseusers:');
    farmers.forEach(f => {
      console.log(`\n- ${f.name} (${f.mobile}) [${f.role}] ID: ${f._id}`);
      console.log(`  isActive: ${f.isActive}`);
      console.log(`  registrationCompleted: ${f.registrationCompleted}`);
      console.log(`  location:`, f.location);
    });

    // Get buyers from baseusers
    const baseBuyers = await BaseUser.find({ role: 'buyer' }).select('name mobile role').lean();
    console.log('\n🛒 Buyers in baseusers:');
    if (baseBuyers.length > 0) {
      baseBuyers.forEach(b => console.log(`- ${b.name} (${b.mobile}) [${b.role}] ID: ${b._id}`));
    } else {
      console.log('⚠️  No buyers found in baseusers!');
    }

    // Check buyers collection
    const totalBuyers = await Buyer.countDocuments();
    console.log('\n📊 Total buyers in buyers collection:', totalBuyers);
    
    if (totalBuyers > 0) {
      const buyersList = await Buyer.find().select('name mobile role').lean();
      buyersList.forEach(b => console.log(`- ${b.name} (${b.mobile}) [${b.role}] ID: ${b._id}`));
    }

    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
