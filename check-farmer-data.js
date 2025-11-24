require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database
const connectAndCheck = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check farmers collection directly
    const farmersCollection = mongoose.connection.db.collection('farmers');
    const farmer = await farmersCollection.findOne({ mobile: '1234098765' });
    
    console.log('\n🌾 Farmer data from DB:');
    console.log(JSON.stringify(farmer, null, 2));
    
    // Check if user is in different collection
    const usersCollection = mongoose.connection.db.collection('users');
    const user = await usersCollection.findOne({ mobile: '1234098765' });
    
    console.log('\n👤 User data from DB:');
    console.log(JSON.stringify(user, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

connectAndCheck();