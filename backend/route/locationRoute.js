// routes/location.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// POST /api/location/update
router.post('/update', locationController.updateLocation);

// GET /api/location/user/:userId
router.get('/user/:userId', locationController.getLocationByUser);

// GET /api/location/group/:groupId/elderly
router.get('/group/:groupId/elderly', locationController.getElderlyLocationsByGroup);

module.exports = router;
