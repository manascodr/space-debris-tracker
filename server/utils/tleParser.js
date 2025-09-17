// server/utils/tleParser.js
const axios = require('axios');
const satellite = require('satellite.js');

// parse raw TLE text into array of { name, line1, line2 }
function parseTleText(tleText) {
  const lines = tleText.trim().split('\n').map(l => l.replace(/\r/g,''));
  const items = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i].trim();
    const line1 = lines[i + 1].trim();
    const line2 = lines[i + 2].trim();
    items.push({ name, line1, line2 });
  }
  return items;
}

function tleToLatLonAlt(line1, line2, when = new Date()) {
  try {
    const satrec = satellite.twoline2satrec(line1, line2);
    const p = satellite.propagate(satrec, when);
    if (!p.position) return null;
    const gmst = satellite.gstime(when);
    const geo = satellite.eciToGeodetic(p.position, gmst);
    const lat = satellite.degreesLat(geo.latitude);
    const lon = satellite.degreesLong(geo.longitude);
    const alt = geo.height; // kilometers
    return { lat, lon, alt };
  } catch (err) {
    return null;
  }
}

async function fetchTleGroup(url, limit = 50) {
  const res = await axios.get(url);
  const parsed = parseTleText(res.data);
  const list = [];
  for (let i = 0; i < Math.min(parsed.length, limit); i++) {
    const item = parsed[i];
    const pos = tleToLatLonAlt(item.line1, item.line2, new Date());
    if (!pos) continue;
    // extract ID from line1: columns 3-7 (NORAD ID)
    const match = item.line1.match(/^1\s+(\d+)/);
    const id = match ? match[1] : `id-${i}`;
    list.push({ id, name: item.name, ...pos });
  }
  return list;
}

module.exports = { fetchTleGroup, tleToLatLonAlt };
