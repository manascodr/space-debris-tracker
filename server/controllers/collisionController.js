// server/controllers/collisionController.js
const { findCollisions } = require('../utils/collision');
const axios = require('axios');

async function checkCollisions(req, res) {
  try {
    const thresholdKm = Number(req.query.thresholdKm) || 10;
    // fetch from local endpoints (fast)
    const [satRes, debRes] = await Promise.all([
      axios.get(`${req.protocol}://${req.get('host')}/api/satellites`),
      axios.get(`${req.protocol}://${req.get('host')}/api/debris`)
    ]);
    const sats = satRes.data;
    const debris = debRes.data;
    const alerts = findCollisions(sats, debris, thresholdKm);
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = { checkCollisions };
