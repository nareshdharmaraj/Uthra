const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

// Public routes (no authentication required for browsing)
router.get('/', cropController.getAllCrops);
router.get('/:id', cropController.getCropById);
router.post('/search', cropController.searchCrops);
router.get('/category/:category', cropController.getCropsByCategory);

module.exports = router;
