const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const buyerController = require('../controllers/buyerController');
const companyBuyerController = require('../controllers/companyBuyerController');

// All routes require buyer authentication
router.use(protect);
router.use(authorize('buyer'));

// Company buyer routes
router.get('/company/dashboard', companyBuyerController.getCompanyDashboard);
router.get('/company/employees', companyBuyerController.getEmployees);
router.post('/company/employees', companyBuyerController.addEmployee);
router.put('/company/employees/:employeeId', companyBuyerController.updateEmployee);
router.delete('/company/employees/:employeeId', companyBuyerController.removeEmployee);
router.get('/company/stock', companyBuyerController.getCompanyStock);

// Browse crops
router.get('/crops', buyerController.browseCrops);
router.get('/crops/:id', buyerController.getCropDetails);
router.post('/crops/search', buyerController.searchCrops);

// Request management
router.post('/requests', buyerController.createRequest);
router.get('/requests', buyerController.getMyRequests);
router.get('/requests/:id', buyerController.getRequestDetails);
router.put('/requests/:id/accept', buyerController.acceptCounterOffer);
router.put('/requests/:id/cancel', buyerController.cancelRequest);

// Dashboard
router.get('/dashboard', buyerController.getDashboardStats);

// Ratings
router.post('/requests/:id/rate', buyerController.rateFarmer);

// Profile management
router.get('/profile', buyerController.getProfile);
router.put('/profile', buyerController.updateProfile);

// Wanted crops management
router.get('/wanted-crops', buyerController.getWantedCrops);
router.post('/wanted-crops', buyerController.addWantedCrop);
router.put('/wanted-crops/:cropId', buyerController.updateWantedCrop);
router.delete('/wanted-crops/:cropId', buyerController.deleteWantedCrop);

// Farmer search
router.post('/farmers/search', buyerController.searchFarmers);
router.get('/farmers/:id', buyerController.getFarmerDetails);

// Settings management
router.get('/settings', buyerController.getSettings);
router.put('/settings/notifications', buyerController.updateNotificationSettings);
router.put('/settings/password', buyerController.changePassword);
router.put('/settings/privacy', buyerController.updatePrivacySettings);
router.put('/settings/language', buyerController.updateLanguageSettings);
router.get('/settings/export-data', buyerController.exportData);
router.delete('/settings/delete-account', buyerController.deleteAccount);

module.exports = router;
