const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_db';

async function fixCropFarmer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    const Crop = mongoose.model('Crop', new mongoose.Schema({}, { strict: false }), 'crops');
    
    // Get all crops
    const crops = await Crop.find().lean();
    console.log('\n📊 Total crops:', crops.length);

    // Correct farmer ID from farmers collection
    const correctFarmerID = '691817a674a430dff36914b3';
    
    // Update all crops
    const result = await Crop.updateMany(
      {},
      { $set: { farmer: correctFarmerID } }
    );

    console.log('✅ Update result:', result);

    // Verify
    const updatedCrops = await Crop.find().lean();
    console.log('\n📊 Updated crops:');
    updatedCrops.forEach(crop => {
      console.log(`- ${crop.name}: farmer ID = ${crop.farmer}`);
    });

    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCropFarmer();
