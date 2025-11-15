const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const farmerController = require('../controllers/farmerController');

// All routes require farmer authentication
router.use(protect);
router.use(authorize('farmer'));

// Crop management
router.post('/crops', farmerController.addCrop);
router.get('/crops', farmerController.getMyCrops);
router.get('/crops/:id', farmerController.getCropDetails);
router.put('/crops/:id', farmerController.updateCrop);
router.delete('/crops/:id', farmerController.deleteCrop);

// Request management
router.get('/requests', farmerController.getMyRequests);
router.get('/requests/:id', farmerController.getRequestDetails);
router.put('/requests/:id/accept', farmerController.acceptRequest);
router.put('/requests/:id/reject', farmerController.rejectRequest);
router.put('/requests/:id/counter', farmerController.counterOffer);

// Dashboard stats
router.get('/dashboard', farmerController.getDashboardStats);

// IVR call logs
router.get('/call-logs', farmerController.getCallLogs);

// Profile management
router.get('/profile', farmerController.getProfile);
router.put('/profile', farmerController.updateProfile);

module.exports = router;
