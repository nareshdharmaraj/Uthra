const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_db';

async function checkFarmers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    const Farmer = mongoose.model('Farmer', new mongoose.Schema({}, { strict: false }), 'farmers');
    
    // Check farmers collection
    const totalFarmers = await Farmer.countDocuments();
    console.log('\n📊 Total farmers in farmers collection:', totalFarmers);
    
    if (totalFarmers > 0) {
      const farmersList = await Farmer.find().lean();
      console.log('\n👨‍🌾 Farmers:');
      farmersList.forEach(f => {
        console.log(`\n- ${f.name} (${f.mobile})`);
        console.log('  ID:', f._id);
        console.log('  Role:', f.role);
        console.log('  Location:', f.location);
        console.log('  Registration Completed:', f.registrationCompleted);
        console.log('  Is Active:', f.isActive);
        if (f.farmerDetails) {
          console.log('  Farming Type:', f.farmerDetails.farmingType);
          console.log('  Total Land:', f.farmerDetails.totalLandArea);
        }
      });
    } else {
      console.log('⚠️  No farmers found in farmers collection!');
    }

    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkFarmers();
