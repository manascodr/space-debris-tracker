// client/src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { getCollisions } from '../api/api';
import '../styles/Sidebar.scss';

export default function Sidebar({ threshold }) {
  const [alerts, setAlerts] = useState([]);

  async function loadAlerts() {
    try {
      const res = await getCollisions(threshold);
      setAlerts(res);
    } catch (err) {
      console.error(err);
      setAlerts([]);
    }
  }

  useEffect(() => {
    loadAlerts();
    const t = setInterval(loadAlerts, 8000); // poll every 8s
    return () => clearInterval(t);
  }, [threshold]);

  return (
    <div className="sidebar">
      <h2>Alerts</h2>
      {alerts.length > 0 && (
        <div className="collision-alert-banner">
          <span role="img" aria-label="collision" style={{ fontSize: '1.5rem', marginRight: '0.7rem' }}>⚠️</span>
          <span style={{ fontWeight: 600, color: '#ff9800' }}>
            {alerts.length} potential collision{alerts.length > 1 ? 's' : ''} detected!
          </span>
        </div>
      )}
      <div className="alerts-list">
        {alerts.length === 0 ? <div className="no-alert">No alerts</div> : null}
        {alerts
          .slice()
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .map((a, i) => (
            <div key={i} className="alert-card">
              <div className="alert-title">{a.satName}</div>
              <div className="alert-sub">{a.debrisName}</div>
              <div className="alert-dist">{a.distanceKm} km</div>
            </div>
          ))}
      </div>
    </div>
  );
}
