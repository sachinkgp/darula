const jwt = require('jsonwebtoken');

const generateTestToken = (userId = 1, email = 'test@example.com') => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '7d' }
  );
};

const createTestUser = async (UserModel, userData = {}) => {
  const defaultData = {
    email: `test${Date.now()}@example.com`,
    passwordHash: '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  };

  return await UserModel.create({ ...defaultData, ...userData });
};

module.exports = {
  generateTestToken,
  createTestUser
};

