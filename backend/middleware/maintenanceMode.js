const SystemSettings = require('../models/SystemSettings');

/**
 * Middleware to check if system is in maintenance mode
 * Blocks non-admin access when maintenance mode is enabled
 */
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    
    // If system is operational (isOperational = true), allow access
    if (settings.isOperational) {
      return next();
    }
    
    // System is in maintenance mode (isOperational = false)
    // Block access with maintenance message
    return res.status(503).json({
      success: false,
      message: settings.maintenanceMessage || 'System is under maintenance. Please try again later.',
      maintenanceMode: true,
      estimatedDowntime: 'Please check back in an hour'
    });
    
  } catch (error) {
    // If error checking maintenance mode, allow access (fail-safe)
    console.error('Error checking maintenance mode:', error);
    next();
  }
};

/**
 * Middleware specifically for login endpoints
 * Checks maintenance mode before allowing login (except for admins)
 */
const checkMaintenanceForLogin = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    
    // If system is operational, allow login
    if (settings.isOperational) {
      return next();
    }
    
    // In maintenance mode - block login
    return res.status(503).json({
      success: false,
      message: 'System is currently under maintenance. If you perform any tasks, they will be lost. Please try after an hour.',
      maintenanceMode: true,
      isOperational: false
    });
    
  } catch (error) {
    // If error, allow login (fail-safe)
    console.error('Error checking maintenance mode for login:', error);
    next();
  }
};

module.exports = {
  checkMaintenanceMode,
  checkMaintenanceForLogin
};
