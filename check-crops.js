const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_db';

async function checkCrops() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    const Crop = mongoose.model('Crop', new mongoose.Schema({}, { strict: false }), 'crops');
    
    // Check total crops
    const totalCrops = await Crop.countDocuments();
    console.log('\n📊 Total crops in database:', totalCrops);

    // Check active crops
    const activeCrops = await Crop.countDocuments({ status: 'active' });
    console.log('📊 Active crops:', activeCrops);

    // Check crops matching buyer query
    const buyerQuery = {
      status: 'active',
      isVisible: true,
      availableTo: { $gte: new Date() }
    };
    const visibleCrops = await Crop.countDocuments(buyerQuery);
    console.log('📊 Visible crops (buyer query):', visibleCrops);

    // Get a sample crop if any exist
    if (totalCrops > 0) {
      console.log('\n🌾 Sample crop:');
      const sampleCrop = await Crop.findOne().lean();
      console.log('- Name:', sampleCrop.name);
      console.log('- Status:', sampleCrop.status);
      console.log('- isVisible:', sampleCrop.isVisible);
      console.log('- availableTo:', sampleCrop.availableTo);
      console.log('- Farmer ID:', sampleCrop.farmer);
      
      // Try to populate farmer
      const BaseUser = mongoose.model('BaseUser', new mongoose.Schema({}, { strict: false }), 'baseusers');
      const farmer = await BaseUser.findById(sampleCrop.farmer).lean();
      console.log('- Farmer found:', farmer ? `${farmer.name} (${farmer.mobile})` : 'NOT FOUND');
    } else {
      console.log('\n⚠️  No crops found in database!');
      console.log('You need to add crops first. Login as a farmer and add some crops.');
    }

    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCrops();
