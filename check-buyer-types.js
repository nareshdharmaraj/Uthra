const mongoose = require('mongoose');
require('dotenv').config();

const dbConfig = require('./backend/config/database');
const Buyer = require('./backend/models/BuyerModel');

async function checkBuyerTypes() {
  try {
    console.log('🔍 Checking buyer types in database...\n');

    const buyers = await Buyer.find({}).select('name mobile buyerType businessName companyName');
    
    console.log(`Found ${buyers.length} buyers:\n`);
    
    buyers.forEach((buyer, index) => {
      console.log(`${index + 1}. ${buyer.name} (${buyer.mobile})`);
      console.log(`   Buyer Type: ${buyer.buyerType || 'NOT SET'}`);
      console.log(`   Business Name: ${buyer.businessName || 'N/A'}`);
      console.log(`   Company Name: ${buyer.companyName || 'N/A'}`);
      console.log('');
    });

    if (buyers.length === 0) {
      console.log('⚠️ No buyers found in database');
    } else {
      const individual = buyers.filter(b => b.buyerType === 'individual').length;
      const company = buyers.filter(b => b.buyerType === 'company').length;
      const notSet = buyers.filter(b => !b.buyerType).length;
      
      console.log('📊 Summary:');
      console.log(`   Individual: ${individual}`);
      console.log(`   Company: ${company}`);
      console.log(`   Not Set: ${notSet}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBuyerTypes();
