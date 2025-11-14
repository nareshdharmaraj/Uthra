const mongoose = require('mongoose');

// Configure mongoose BEFORE connecting
mongoose.set('strictQuery', false);
console.log('✅ Mongoose configured in database.js');

const connectDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGO_URI);
    
    // Connect with proper options - bufferCommands will be enabled during connection
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      bufferCommands: true, // Enable buffering during connection, we'll disable after
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`✅ Database: ${mongoose.connection.name}`);
    console.log(`✅ Connection State: ${mongoose.connection.readyState}`); // 1 = connected

    // Verify connection is working by listing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Collections found: ${collections.length}`);
    
    // Now that connection is established, we can safely use commands immediately
    mongoose.set('bufferCommands', false);
    console.log('✅ Disabled buffering after connection established');

    // Set up event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`⚠️ MongoDB error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return mongoose.connection;

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
module.exports.mongoose = mongoose; // Export the mongoose instance
