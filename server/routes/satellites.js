// server/routes/satellites.js
const express = require('express');
const router = express.Router();
const { getSatellites } = require('../controllers/satellitesController');

router.get('/', getSatellites);

module.exports = router;
