require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/darula_test';
process.env.POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://postgres:devpass@localhost:5433/devdb_test';

