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

function requestLoggerMiddleware(req, res, next) {
  const requestId = logger.generateRequestId();
  req.requestId = requestId;
  const start = Date.now();

  logger.request({
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    headers: redactHeaders(req.headers),
    query: req.query || {},
    params: req.params || {},
    body: req.body ?? null,
    ip: getClientIp(req),
    timestamp: new Date().toISOString()
  });

  const onFinish = () => {
    res.removeListener('finish', onFinish);
    res.removeListener('close', onFinish);
    const responseTime = Date.now() - start;
    let body = res._logBody;
    if (body === undefined && res._payload !== undefined) body = res._payload;
    logger.response({
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      responseBody: body,
      timestamp: new Date().toISOString()
    });
  };

  res.on('finish', onFinish);
  res.on('close', onFinish);

  const originalJson = res.json.bind(res);
  res.json = function (payload) {
    res._payload = payload;
    return originalJson(payload);
  };

  const originalSend = res.send.bind(res);
  res.send = function (body) {
    if (typeof body === 'string') {
      try {
        res._logBody = body.length > 2000 ? body.slice(0, 2000) + '...[truncated]' : body;
      } catch (_) {
        res._logBody = '[non-serializable]';
      }
    } else {
      res._logBody = body;
    }
    return originalSend(body);
  };

  next();
}

module.exports = { requestLoggerMiddleware };
