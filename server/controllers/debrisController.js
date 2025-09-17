// server/controllers/debrisController.js
const fs = require('fs');
const path = require('path');
const Debris = require('../models/Debris');
const { fetchTleGroup } = require('../utils/tleParser');

const CELESTRAK_COSMOS1408 = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-1408-debris&FORMAT=tle';

async function getDebris(req, res) {
  try {
    if (process.env.MONGO_URI) {
      const count = await Debris.estimatedDocumentCount().catch(()=>0);
      if (count > 0) {
        const docs = await Debris.find().lean().limit(200);
        return res.json(docs);
      }
      // DB is empty, fetch and insert
      try {
        const list = await fetchTleGroup(CELESTRAK_COSMOS1408, 40);
        try {
          await Debris.deleteMany({});
          await Debris.insertMany(list);
        } catch (insertErr) {
          console.error('Debris insertMany error:', insertErr.message);
        }
        return res.json(list);
      } catch (err) {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.json')));
        try {
          await Debris.deleteMany({});
          await Debris.insertMany(data.debris);
        } catch (insertErr) {
          console.error('Debris insertMany error:', insertErr.message);
        }
        return res.json(data.debris);
      }
    } else {
      // No DB, just fetch and return
      try {
        const list = await fetchTleGroup(CELESTRAK_COSMOS1408, 40);
        return res.json(list);
      } catch (err) {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'data.json')));
        return res.json(data.debris);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}

module.exports = { getDebris };
