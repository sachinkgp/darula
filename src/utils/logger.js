const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOG_DIR = path.join(process.cwd(), 'logs');
const ARCHIVED_DIR = path.join(LOG_DIR, 'archived');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ROTATE_LOCK = { app: false, error: false, requests: false };

function ensureDirs() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  if (!fs.existsSync(ARCHIVED_DIR)) fs.mkdirSync(ARCHIVED_DIR, { recursive: true });
}

function timestamp() {
  return new Date().toISOString();
}

function archivedName(prefix) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const str = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  return `${prefix}-${str}.log`;
}

function getStreamKey(base) {
  return path.join(LOG_DIR, base);
}

const streams = {
  app: null,
  error: null,
  requests: null
};

function rotate(base) {
  const filePath = getStreamKey(base);
  if (!fs.existsSync(filePath)) return;
  const stat = fs.statSync(filePath);
  if (stat.size < MAX_FILE_SIZE) return;

  const prefix = base.replace('.log', '');
  const dest = path.join(ARCHIVED_DIR, archivedName(prefix));
  try {
    if (streams[prefix]) {
      streams[prefix].end();
      streams[prefix] = null;
    }
    fs.renameSync(filePath, dest);
  } catch (e) {
    // ignore rename errors (e.g. file open elsewhere)
  }
}

function getStream(base) {
  const key = base.replace('.log', '');
  if (streams[key]) return streams[key];
  ensureDirs();
  const filePath = getStreamKey(base);
  streams[key] = fs.createWriteStream(filePath, { flags: 'a' });
  return streams[key];
}

function writeToFile(base, line) {
  const filePath = getStreamKey(base);
  ensureDirs();
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size >= MAX_FILE_SIZE) rotate(base);
    }
  } catch (_) {}
  const stream = getStream(base);
  stream.write(line + '\n');
}

function getCallerInfo() {
  try {
    const err = new Error();
    const stack = err.stack || '';
    const lines = stack.split('\n');
    // lines[0] = Error, [1] = getCallerInfo, [2] = caller (e.g. at Object.error ...)
    const line = lines[3] || lines[2] || '';
    const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/) || line.match(/at\s+(.+):(\d+):(\d+)/);
    if (match) {
      return {
        file: match[2] || match[1],
        function: match[1] ? match[1].trim() : undefined,
        line: match[3] ? parseInt(match[3], 10) : undefined
      };
    }
  } catch (_) {}
  return {};
}

const BASE_KEYS = ['timestamp', 'level', 'requestId', 'method', 'url', 'statusCode', 'responseTime', 'message', 'errorStack', 'file', 'function'];

function formatEntry(level, payload) {
  const base = {
    timestamp: timestamp(),
    level,
    requestId: payload.requestId || null,
    method: payload.method || null,
    url: payload.url || null,
    statusCode: payload.statusCode ?? null,
    responseTime: payload.responseTime ?? null,
    message: payload.message ?? '',
    errorStack: payload.errorStack || null,
    file: payload.file || null,
    function: payload.function || null
  };
  const extra = {};
  for (const [k, v] of Object.entries(payload)) {
    if (BASE_KEYS.includes(k)) continue;
    if (k === 'error' && v && typeof v === 'object') {
      extra.error = { name: v.name, message: v.message };
      continue;
    }
    extra[k] = v;
  }
  try {
    return JSON.stringify({ ...base, ...extra });
  } catch (e) {
    return JSON.stringify({ ...base, message: String(payload.message), _serializeError: true });
  }
}

function logToConsole(level, payload) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && process.env.LOG_CONSOLE !== 'true') return;
  const msg = payload.message || '';
  const reqId = payload.requestId ? `[${payload.requestId}] ` : '';
  if (level === 'error') {
    console.error(`${reqId}[${level}]`, msg, payload.errorStack || '');
  } else {
    console.log(`${reqId}[${level}]`, msg, payload.responseTime != null ? ` ${payload.responseTime}ms` : '');
  }
}

function generateRequestId() {
  return crypto.randomUUID();
}

const logger = {
  generateRequestId,

  info(message, meta = {}) {
    const payload = { ...meta, message };
    const line = formatEntry('info', payload);
    writeToFile('app.log', line);
    logToConsole('info', payload);
  },

  error(message, meta = {}) {
    const caller = getCallerInfo();
    const payload = {
      ...meta,
      ...caller,
      message: message || (meta.error && meta.error.message),
      errorStack: (meta.error && meta.error.stack) || meta.errorStack || null
    };
    const line = formatEntry('error', payload);
    writeToFile('app.log', line);
    writeToFile('error.log', line);
    logToConsole('error', payload);
  },

  request(meta) {
    const payload = { ...meta, level: 'request' };
    const line = formatEntry('request', payload);
    writeToFile('app.log', line);
    writeToFile('requests.log', line);
    logToConsole('info', { ...payload, message: `REQUEST ${payload.method} ${payload.url}` });
  },

  response(meta) {
    const payload = { ...meta, level: 'response' };
    const line = formatEntry('response', payload);
    writeToFile('app.log', line);
    writeToFile('requests.log', line);
    logToConsole('info', { ...payload, message: `RESPONSE ${meta.statusCode} ${meta.responseTime}ms` });
  },

  /**
   * Log before/after an operation (e.g. DB, API, auth).
   * Usage: logger.operation('db', 'getProductById', { requestId }, async () => { ... })
   */
  async operation(type, name, context, fn) {
    const requestId = context && context.requestId;
    logger.info(`${type} start: ${name}`, { requestId, operation: type, operationName: name });
    const start = Date.now();
    try {
      const result = await fn();
      logger.info(`${type} success: ${name}`, {
        requestId,
        operation: type,
        operationName: name,
        durationMs: Date.now() - start,
        success: true
      });
      return result;
    } catch (err) {
      logger.error(`${type} failure: ${name}`, {
        requestId,
        operation: type,
        operationName: name,
        durationMs: Date.now() - start,
        success: false,
        error: err
      });
      throw err;
    }
  }
};

module.exports = logger;
