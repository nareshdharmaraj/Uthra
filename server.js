const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: './.env' });

// Import database connection FIRST (this will configure mongoose)
const connectDatabase = require('./backend/config/database');

// Initialize express app
const app = express();

// Setup middleware - can be done before connection
function setupMiddleware() {
  app.use(helmet()); // Security headers
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(compression()); // Compress responses
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

  // Request logger - log ALL incoming requests
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`, req.body);
    next();
  });

  // Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Static files
  app.use('/uploads', express.static(path.join(__dirname, 'backend/public/uploads')));
}

// Setup routes - ONLY after database is connected
function setupRoutes() {
  // Clear require cache for models to force re-evaluation after connection
  delete require.cache[require.resolve('./Database/BaseUserSchema')];
  delete require.cache[require.resolve('./Database/CropSchema')];
  delete require.cache[require.resolve('./Database/RequestSchema')];
  delete require.cache[require.resolve('./Database/NotificationSchema')];
  delete require.cache[require.resolve('./Database/CallLogSchema')];
  delete require.cache[require.resolve('./Database/SMSLogSchema')];
  
  // Import routes (this will also import controllers and models)
  const authRoutes = require('./backend/routes/authRoutes');
  const userRoutes = require('./backend/routes/userRoutes');
  const farmerRoutes = require('./backend/routes/farmerRoutes');
  const buyerRoutes = require('./backend/routes/buyerRoutes');
  const adminRoutes = require('./backend/routes/adminRoutes');
  const cropRoutes = require('./backend/routes/cropRoutes');
  const requestRoutes = require('./backend/routes/requestRoutes');
  const ivrRoutes = require('./backend/routes/ivrRoutes');
  const smsRoutes = require('./backend/routes/smsRoutes');
  const notificationRoutes = require('./backend/routes/notificationRoutes');
  const companyRoutes = require('./backend/routes/companyRoutes');
  const errorHandler = require('./backend/middleware/errorHandler');

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/buyers', buyerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/crops', cropRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/ivr', ivrRoutes);
  app.use('/api/sms', smsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/companies', companyRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Uthra API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to Uthra API',
      version: '1.0.0',
      description: 'Light of Communication between Farmers and Buyers'
    });
  });

  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // Error handling middleware
  app.use(errorHandler);
}

// Start server function
const startServer = async () => {
  try {
    // Setup middleware first (doesn't need DB)
    setupMiddleware();
    console.log('✅ Middleware configured');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connection ready and verified!');
    
    // Now setup routes (requires DB connection)
    setupRoutes();
    console.log('✅ Routes configured');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║        🌾 Uthra Server 🌾            ║
  ║                                       ║
  ║   Light of Communication between      ║
  ║      Farmers and Buyers               ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  
  Server running in ${process.env.NODE_ENV} mode
  Port: ${PORT}
  Database: Ready ✅
  API: http://localhost:${PORT}
  
  `);
    });

    // Handle unhandled promise rejections - just log, don't exit
    process.on('unhandledRejection', (err) => {
      console.error(`⚠️ Unhandled Rejection: ${err.message}`);
      console.error(err.stack);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
