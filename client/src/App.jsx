// client/src/App.js

import React, { useState } from "react";
import GlobeView from "./components/GlobeView";
import Sidebar from "./components/Sidebar";
import "./styles/App.scss";

function App() {
  const [threshold, setThreshold] = useState(10);
  return (
    <div className="app">
      <header className="app-header">
        <h1>Team CodeX — Space Debris Tracker</h1>
      </header>
      <div className="app-body">
        <div className="globe-area">
          <GlobeView threshold={threshold} setThreshold={setThreshold} />
        </div>
        <aside className="sidebar-area">
          <Sidebar threshold={threshold} />
        </aside>
      </div>
      <footer className="app-footer">
        <small>
          Demo: live TLE via CelesTrak • collision threshold default 10 km
        </small>
      </footer>
    </div>
  );
}

export default App;
