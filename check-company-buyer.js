require('dotenv').config();
const mongoose = require('mongoose');

async function checkCompanyBuyer() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    const buyerSchema = require('./Database/BuyerSchema');
    const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema.schema);

    const companyBuyer = await Buyer.findOne({ mobile: '9876543212' });
    
    if (companyBuyer) {
      console.log('📊 Test Company Buyer Data:');
      console.log(JSON.stringify(companyBuyer, null, 2));
    } else {
      console.log('❌ Company buyer not found');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCompanyBuyer();
