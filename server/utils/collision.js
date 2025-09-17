// server/utils/collision.js
const R = 6371; // earth radius km

function deg2rad(d) { return d * Math.PI / 180; }

function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function distanceKm(a, b) {
  const surface = haversineKm(a.lat, a.lon, b.lat, b.lon);
  const altDiff = Math.abs((a.alt || 0) - (b.alt || 0));
  return Math.sqrt(surface*surface + altDiff*altDiff);
}

function findCollisions(sats, debris, thresholdKm = 10) {
  const alerts = [];
  for (const s of sats) {
    for (const d of debris) {
      const dist = distanceKm(s, d);
      if (dist <= thresholdKm) {
        alerts.push({
          satId: s.id, satName: s.name,
          debrisId: d.id, debrisName: d.name,
          distanceKm: Number(dist.toFixed(3))
        });
      }
    }
  }
  return alerts;
}

module.exports = { findCollisions, distanceKm };
