// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const satellitesRouter = require('./routes/satellites');
const debrisRouter = require('./routes/debris');
const collisionRouter = require('./routes/collision');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB if MONGO_URI present
connectDB();

// routes
app.use('/api/satellites', satellitesRouter);
app.use('/api/debris', debrisRouter);
app.use('/api/collisions', collisionRouter);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
