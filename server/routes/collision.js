// server/routes/collision.js
const express = require('express');
const router = express.Router();
const { checkCollisions } = require('../controllers/collisionController');

router.get('/check', checkCollisions);

module.exports = router;
