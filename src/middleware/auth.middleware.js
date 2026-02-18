const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const requestId = req.requestId || null;
  logger.info('Authentication step start', { requestId, operation: 'auth', operationName: 'authenticateToken' });

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    logger.info('Authentication failed: no header', { requestId, operation: 'auth', operationName: 'authenticateToken', success: false });
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    logger.info('Authentication failed: invalid header format', { requestId, operation: 'auth', operationName: 'authenticateToken', success: false });
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    logger.info('Authentication failed: no token', { requestId, operation: 'auth', operationName: 'authenticateToken', success: false });
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      logger.info('Authentication failed: invalid or expired token', { requestId, operation: 'auth', operationName: 'authenticateToken', success: false });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    logger.info('Authentication success', { requestId, operation: 'auth', operationName: 'authenticateToken', success: true, userId: user.userId });
    next();
  });
};

module.exports = { authenticateToken };

