// client/src/api/api.js
import axios from 'axios';

const API_ROOT = 'http://localhost:5000';

export const getSatellites = () => axios.get(`${API_ROOT}/api/satellites`).then(r => r.data);
export const getDebris = () => axios.get(`${API_ROOT}/api/debris`).then(r => r.data);
export const getCollisions = (thresholdKm=10) => axios.get(`${API_ROOT}/api/collisions/check?thresholdKm=${thresholdKm}`).then(r => r.data);
