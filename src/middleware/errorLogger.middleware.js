const logger = require('../utils/logger');

const REDACT_HEADERS = ['authorization', 'cookie'];

function redactHeaders(headers) {
  if (!headers || typeof headers !== 'object') return headers;
  const out = { ...headers };
  for (const key of REDACT_HEADERS) {
    if (out[key]) out[key] = '[REDACTED]';
  }
  return out;
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    null
  );
}

function errorLoggerMiddleware(err, req, res, next) {
  const requestId = (req && req.requestId) || null;
  const requestDetails = req
    ? {
        method: req.method,
        url: req.originalUrl || req.url,
        headers: redactHeaders(req.headers),
        query: req.query || {},
        params: req.params || {},
        body: req.body ?? null,
        ip: getClientIp(req)
      }
    : {};

  logger.error(err.message || 'Unhandled error', {
    requestId,
    timestamp: new Date().toISOString(),
    ...requestDetails,
    error: err,
    errorStack: err.stack
  });

  next(err);
}

module.exports = { errorLoggerMiddleware };
