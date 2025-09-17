// client/src/components/GlobeView.js
import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { getSatellites, getDebris } from '../api/api';
import { kmDistance } from '../utils/collisionCheck';


import '../styles/GlobeView.scss';

export default function GlobeView({ threshold, setThreshold }) {
  const [showInfo, setShowInfo] = useState(false);
  const globeRef = useRef();
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(threshold);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sats, debris] = await Promise.all([getSatellites(), getDebris()]);
        // tag types
        const satPoints = sats.map(s => ({ ...s, type: 'sat' }));
        const debPoints = debris.map(d => ({ ...d, type: 'deb' }));
        setPoints([...satPoints, ...debPoints]);

        // Find close pairs and create lines
        const closeLines = [];
        for (const s of satPoints) {
          for (const d of debPoints) {
            const dist = kmDistance(s, d);
            if (dist <= threshold) {
              closeLines.push({
                start: { lat: s.lat, lng: s.lon, alt: (s.alt || 500) / 6371 },
                end: { lat: d.lat, lng: d.lon, alt: (d.alt || 500) / 6371 },
                distance: dist,
                satName: s.name,
                debrisName: d.name
              });
            }
          }
        }
        setLines(closeLines);
        // Move globe to first close pair if available
        if (closeLines.length > 0 && globeRef.current) {
          const first = closeLines[0];
          globeRef.current.pointOfView({ lat: first.start.lat, lng: first.start.lng, altitude: 1.5 }, 1200);
        }
      } catch (err) {
        console.error('Error loading data', err);
      }
      setLoading(false);
    }
    load();
  }, [threshold]);

  // Custom tooltip for line click
  function handleLineClick(line) {
    window.alert(`Satellite: ${line.satName}\nDebris: ${line.debrisName}\nDistance: ${line.distance.toFixed(2)} km`);
  }

  return (
    <div className="globe-area" style={{ position: 'relative' }}>
      {/* Info button top left */}
      <div style={{ position: 'absolute', top: 20, left: 30, zIndex: 3 }}>
        <div
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          style={{ display: 'inline-block', position: 'relative' }}
        >
          <button
            aria-label="How to read the globe"
            style={{ background: '#22325c', color: '#00bcd4', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '1.7rem', boxShadow: '0 2px 8px rgba(0,188,212,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ℹ️
          </button>
          {showInfo && (
            <div style={{ position: 'absolute', top: 50, left: 0, zIndex: 10, background: 'rgba(20,33,61,0.97)', borderRadius: '0.7rem', padding: '1.1rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', color: '#eaf6ff', fontSize: '1rem', minWidth: 260, maxWidth: 340 }}>
              <div style={{ fontWeight: 600, marginBottom: '0.7rem', fontSize: '1.1rem', color: '#00bcd4' }}>
                How to read the globe
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.98rem' }}>
                <li><span style={{ color: 'cyan', fontWeight: 600 }}>Cyan dots</span>: Satellites</li>
                <li><span style={{ color: 'red', fontWeight: 600 }}>Red dots</span>: Debris</li>
                <li><span style={{ color: '#00bcd4', fontWeight: 600 }}>Blue-Red lines</span>: Potential collision pairs</li>
                <li><span style={{ color: '#ffeb3b', fontWeight: 600 }}>Yellow ring</span>: Equator highlight (overlay)</li>
                <li><span style={{ color: '#ff9800', fontWeight: 600 }}>Orange ring</span>: High-density debris zone (overlay)</li>
                <li>Hover/click a dot: See name, type, position</li>
                <li>Hover/click a line: See satellite, debris, and distance</li>
                <li>Toggle overlay: Show/hide highlighted regions</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Controls top right */}
      <div style={{ position: 'absolute', top: 20, right: 30, zIndex: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
        <div>
          <label style={{ color: '#fff', fontWeight: 500 }}>Collision Threshold (km): </label>
          <input
            type="number"
            value={inputValue}
            min={1}
            max={100000}
            style={{ width: 80, marginLeft: 8, borderRadius: '0.5rem', border: 'none', background: '#22325c', color: '#eaf6ff', fontSize: '1rem', padding: '0.3rem 0.7rem' }}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = Number(inputValue);
                if (!isNaN(val) && val > 0) {
                  setThreshold(val);
                }
              }
            }}
          />
        </div>
        <button
          style={{ background: showOverlay ? '#00bcd4' : '#22325c', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
          onClick={() => setShowOverlay(v => !v)}
        >
          {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>
      {loading && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(10,22,40,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#14213d', color: '#eaf6ff', padding: '1.2rem 2rem', borderRadius: '1rem', fontSize: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
            Fetching data...
          </div>
        </div>
      )}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={points}
          pointLat="lat"
          pointLng="lon"
          pointColor={p => p.type === 'sat' ? 'cyan' : 'red'}
          pointAltitude={p => 0.15 + ((p.alt || 500) / 6371) * 1.5}
          pointRadius={p => p.type === 'sat' ? 0.018 : 0.013}
          pointResolution={24}
          pointLabel={p => `${p.type === 'sat' ? 'Satellite' : 'Debris'}: ${p.name}\nLat: ${p.lat?.toFixed(2)}\nLon: ${p.lon?.toFixed(2)}\nAlt: ${(p.alt||0).toFixed(1)} km`}
          pointGlowIntensity={0.5}
          pointMerge={false}
          onPointClick={p => {
            window.alert(`${p.type === 'sat' ? 'Satellite' : 'Debris'}: ${p.name}\nlat:${p.lat.toFixed(2)} lon:${p.lon.toFixed(2)} alt:${(p.alt||0).toFixed(1)} km`);
          }}
          arcsData={lines}
          arcStartLat={l => l.start.lat}
          arcStartLng={l => l.start.lng}
          arcEndLat={l => l.end.lat}
          arcEndLng={l => l.end.lng}
          arcColor={() => ['#00bcd4', '#ff6f61']}
          arcStroke={1.5}
          onArcClick={handleLineClick}
          arcLabel={l => `<div style='padding:6px 10px;'>
            <span style='color:#00bcd4;font-weight:600;'>Satellite:</span> <span style='color:cyan;font-weight:600;'>${l.satName}</span><br/>
            <span style='color:#ff6f61;font-weight:600;'>Debris:</span> <span style='color:red;font-weight:600;'>${l.debrisName}</span><br/>
            <span style='color:#b0c4de;font-weight:600;'>Distance:</span> <span style='color:#fff;font-weight:600;'>${l.distance.toFixed(2)} km</span>
          </div>`}
          // Overlay: show sample region or arcs if enabled
          ringsData={showOverlay ? [
            { lat: 0, lng: 0, altitude: 0.01, radius: 1.5, color: '#ffeb3b' }, // Equator highlight
            { lat: 45, lng: 90, altitude: 0.01, radius: 0.7, color: '#ff9800' } // Sample high-density zone
          ] : []}
          ringLat={r => r.lat}
          ringLng={r => r.lng}
          ringAltitude={r => r.altitude}
          ringColor={r => r.color}
          ringRadius={r => r.radius}
          ringResolution={60}
        />
      </div>
    </div>
  );
}
