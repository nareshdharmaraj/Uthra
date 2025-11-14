const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/verify', adminController.verifyUser);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/deactivate', adminController.deactivateUser);

// Crop management
router.get('/crops', adminController.getAllCrops);
router.get('/crops/:id', adminController.getCropDetails);
router.put('/crops/:id/verify', adminController.verifyCrop);
router.delete('/crops/:id', adminController.deleteCrop);

// Request management
router.get('/requests', adminController.getAllRequests);
router.get('/requests/:id', adminController.getRequestDetails);

// Analytics & Reports
router.get('/analytics/overview', adminController.getAnalyticsOverview);
router.get('/analytics/crops', adminController.getCropAnalytics);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/transactions', adminController.getTransactionAnalytics);

// Call logs
router.get('/call-logs', adminController.getCallLogs);
router.get('/call-logs/:id', adminController.getCallLogDetails);

// SMS logs
router.get('/sms-logs', adminController.getSMSLogs);

// Notifications
router.post('/notifications/broadcast', adminController.sendBroadcastNotification);

module.exports = router;
