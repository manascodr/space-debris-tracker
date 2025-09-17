// server/routes/debris.js
const express = require('express');
const router = express.Router();
const { getDebris } = require('../controllers/debrisController');

router.get('/', getDebris);

module.exports = router;
