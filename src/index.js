require('dotenv').config();

const express = require('express');
const app = express();
const indexRouter = require('./api/router/index.router');
const cors = require('cors');
const path = require('path');

// ✅ Import DB connectors
const connectMongo = require('./config/db/mongo');
const { connectPostgres } = require('./config/db/postgres');
const { connectRedis } = require('./config/db/redis');
// const dockerManager = require('./utils/dockerManager');

// ✅ Initialize DB Connections (non-blocking for test runner)
(async () => {
  try {
    await connectMongo();
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed (test runner will still work):', error.message);
  }
  
  try {
    await connectPostgres();
  } catch (error) {
    console.warn('⚠️ PostgreSQL connection failed (test runner will still work):', error.message);
  }
  
  try {
    await connectRedis();
  } catch (error) {
    console.warn('⚠️ Redis connection failed (test runner will still work):', error.message);
  }
})();

// Export dockerManager for use in server.js
// app.dockerManager = dockerManager;

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/v1', indexRouter);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
