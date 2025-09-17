// client/src/utils/collisionCheck.js
export function kmDistance(a, b) {
  // approximate haversine + alt diff
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const hav = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  const surface = 2 * R * Math.asin(Math.sqrt(hav));
  const altDiff = Math.abs((a.alt||0) - (b.alt||0));
  return Math.sqrt(surface*surface + altDiff*altDiff);
}

export function findLocalCollisions(sats, debris, thresholdKm=10) {
  const alerts = [];
  for (const s of sats) {
    for (const d of debris) {
      if (kmDistance(s,d) <= thresholdKm) {
        alerts.push({ sat: s, debris: d, distanceKm: Number(kmDistance(s,d).toFixed(3)) });
      }
    }
  }
  return alerts;
}
