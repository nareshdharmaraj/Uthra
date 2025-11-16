const mongoose = require('mongoose');
require('dotenv').config();

async function fixBuyerTypes() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/uthra';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Get the Buyer model directly from the schema
    const buyerSchema = require('./Database/BuyerSchema');
    const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema.schema);

    // Find all buyers
    const buyers = await Buyer.find({}).select('name mobile buyerType businessName companyName email');
    
    console.log(`📊 Found ${buyers.length} buyers in database:\n`);
    
    if (buyers.length === 0) {
      console.log('⚠️ No buyers found. Creating a test company buyer...\n');
      
      // Create a test company buyer
      const testCompanyBuyer = await Buyer.create({
        mobile: '9876543210',
        name: 'Test Company Admin',
        email: 'company@test.com',
        password: 'password123',
        role: 'buyer',
        buyerType: 'company',
        businessName: 'Test Company',
        companyName: 'Test Company Pvt Ltd',
        businessType: 'wholesaler',
        location: {
          address: 'Test Address',
          village: 'Test Village',
          district: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001'
        },
        registrationStage: 3,
        registrationCompleted: true,
        isVerified: true,
        isActive: true
      });
      
      console.log('✅ Created test company buyer:');
      console.log(`   Mobile: ${testCompanyBuyer.mobile}`);
      console.log(`   Password: password123`);
      console.log(`   Buyer Type: ${testCompanyBuyer.buyerType}`);
      console.log(`   Company Name: ${testCompanyBuyer.companyName}\n`);
    } else {
      buyers.forEach((buyer, index) => {
        console.log(`${index + 1}. ${buyer.name} (${buyer.mobile})`);
        console.log(`   Email: ${buyer.email || 'N/A'}`);
        console.log(`   Buyer Type: ${buyer.buyerType || '❌ NOT SET'}`);
        console.log(`   Business Name: ${buyer.businessName || 'N/A'}`);
        console.log(`   Company Name: ${buyer.companyName || 'N/A'}`);
        console.log('');
      });

      // Check for "Test Company" or similar names
      const companyBuyers = buyers.filter(b => 
        b.name && (
          b.name.toLowerCase().includes('company') || 
          b.businessName?.toLowerCase().includes('company') ||
          b.companyName?.toLowerCase().includes('company')
        )
      );

      if (companyBuyers.length > 0) {
        console.log('\n🔧 Found potential company buyers. Fixing buyerType...\n');
        
        for (const buyer of companyBuyers) {
          if (buyer.buyerType !== 'company') {
            buyer.buyerType = 'company';
            await buyer.save();
            console.log(`✅ Updated ${buyer.name} (${buyer.mobile}) to buyerType: 'company'`);
          } else {
            console.log(`✓ ${buyer.name} already has buyerType: 'company'`);
          }
        }
      }

      // Summary
      const individual = buyers.filter(b => b.buyerType === 'individual').length;
      const company = buyers.filter(b => b.buyerType === 'company').length;
      const notSet = buyers.filter(b => !b.buyerType).length;
      
      console.log('\n📊 Summary:');
      console.log(`   Individual Buyers: ${individual}`);
      console.log(`   Company Buyers: ${company}`);
      console.log(`   Not Set: ${notSet}`);

      if (notSet > 0) {
        console.log('\n⚠️ Found buyers without buyerType set. Setting them as "individual"...');
        for (const buyer of buyers) {
          if (!buyer.buyerType) {
            buyer.buyerType = 'individual';
            await buyer.save();
            console.log(`✅ Set ${buyer.name} (${buyer.mobile}) as 'individual'`);
          }
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBuyerTypes();
