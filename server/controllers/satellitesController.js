// server/controllers/satellitesController.js
const fs = require("fs");
const path = require("path");
const Satellite = require("../models/Satellite");
const { fetchTleGroup } = require("../utils/tleParser");

const CELESTRAK_ACTIVE =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";

async function getSatellites(req, res) {
  try {
    // if DB connected and contains docs, return from DB
    if (process.env.MONGO_URI) {
      const count = await Satellite.estimatedDocumentCount().catch(() => 0);
      if (count > 0) {
        const docs = await Satellite.find().lean().limit(200);
        return res.json(docs);
      }
      // DB is empty, fetch and insert
      try {
        const list = await fetchTleGroup(CELESTRAK_ACTIVE, 20);
        // Insert into DB
        try {
          await Satellite.deleteMany({});
          await Satellite.insertMany(list);
        } catch (insertErr) {
          console.error("Satellite insertMany error:", insertErr.message);
        }
        return res.json(list);
      } catch (err) {
        // fallback to static JSON file
        const data = JSON.parse(
          fs.readFileSync(path.join(__dirname, "..", "data", "data.json"))
        );
        try {
          await Satellite.deleteMany({});
          await Satellite.insertMany(data.satellites);
        } catch (insertErr) {
          console.error("Satellite insertMany error:", insertErr.message);
        }
        return res.json(data.satellites);
      }
    } else {
      // No DB, just fetch and return
      try {
        const list = await fetchTleGroup(CELESTRAK_ACTIVE, 20);
        return res.json(list);
      } catch (err) {
        const data = JSON.parse(
          fs.readFileSync(path.join(__dirname, "..", "data", "data.json"))
        );
        return res.json(data.satellites);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
}

module.exports = { getSatellites };
