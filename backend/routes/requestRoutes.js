const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const requestController = require('../controllers/requestController');

// All routes require authentication
router.use(protect);

router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);

module.exports = router;
