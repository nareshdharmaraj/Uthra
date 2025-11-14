const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// All routes require buyer role
router.use(authorize('buyer'));

// Company profile routes
router.post('/', companyController.createCompany);
router.get('/profile', companyController.getCompanyProfile);
router.put('/profile', companyController.updateCompanyProfile);

// Employee management routes
router.post('/employees/invite', companyController.inviteEmployee);
router.post('/employees/accept-invitation', companyController.acceptInvitation);
router.get('/employees', companyController.getEmployees);
router.put('/employees/:employeeId', companyController.updateEmployee);
router.delete('/employees/:employeeId', companyController.removeEmployee);

// Leave company
router.post('/leave', companyController.leaveCompany);

module.exports = router;
