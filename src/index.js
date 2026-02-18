require('dotenv').config();

const express = require('express');
const app = express();
const indexRouter = require('./api/router/index.router');
const cors = require('cors');
const path = require('path');
const { requestLoggerMiddleware } = require('./middleware/requestLogger.middleware');
const { errorLoggerMiddleware } = require('./middleware/errorLogger.middleware');

// ✅ Import DB connectors (Postgres = primary, Redis = cart & sessions)
const { connectPostgres } = require('./config/db/postgres');
const { connectRedis } = require('./config/db/redis');

// ✅ Initialize DB Connections (non-blocking for test runner)
(async () => {
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

// ✅ Logging: assign requestId and log every request/response
app.use(requestLoggerMiddleware);

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

// ✅ Error logging (full request details) then send response
app.use(errorLoggerMiddleware);
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
