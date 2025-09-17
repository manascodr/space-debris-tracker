// server/models/Satellite.js
const mongoose = require('mongoose');

const SatelliteSchema = new mongoose.Schema({
  id: String,
  name: String,
  lat: Number,
  lon: Number,
  alt: Number,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Satellite', SatelliteSchema);
