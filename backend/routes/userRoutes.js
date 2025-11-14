const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update current user profile
router.put('/me', userController.updateProfile);

// Update password
router.put('/me/password', userController.updatePassword);

// Update PIN (farmers only)
router.put('/me/pin', authorize('farmer'), userController.updatePIN);

// Get user notifications
router.get('/me/notifications', userController.getNotifications);

// Mark notification as read
router.put('/notifications/:id/read', userController.markNotificationAsRead);

// Update notification preferences
router.put('/me/notification-preferences', userController.updateNotificationPreferences);

module.exports = router;
