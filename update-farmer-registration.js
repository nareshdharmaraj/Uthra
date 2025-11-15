const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_db';

async function updateFarmer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    const BaseUser = mongoose.model('BaseUser', new mongoose.Schema({}, { strict: false }), 'baseusers');
    
    // Update the farmer to have registrationCompleted = true
    const result = await BaseUser.updateOne(
      { role: 'farmer' },
      { $set: { registrationCompleted: true } }
    );

    console.log('✅ Update result:', result);

    // Verify
    const farmer = await BaseUser.findOne({ role: 'farmer' }).lean();
    console.log('\n📊 Updated farmer:');
    console.log('- Name:', farmer.name);
    console.log('- registrationCompleted:', farmer.registrationCompleted);

    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateFarmer();
