require('./setup');
const request = require('supertest');
const app = require('../index');
const UserModel = require('../api/model/user.model');
const { pgPool } = require('../config/db/postgres');
const bcrypt = require('bcrypt');

describe('Authentication API Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Clean up test users
    await pgPool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
  });

  afterAll(async () => {
    // Clean up test users
    await pgPool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
  });

  describe('POST /api/v1/auth/signup', () => {
    test('should signup a new user successfully', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('firstName', userData.firstName);
      expect(response.body.user).toHaveProperty('lastName', userData.lastName);
      expect(response.body.token).toBeDefined();
      
      testUser = response.body.user;
      authToken = response.body.token;
    });

    test('should fail signup with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          password: 'TestPassword123!',
          firstName: 'John'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should fail signup with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: `test${Date.now()}@example.com`,
          firstName: 'John'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should fail signup with duplicate email', async () => {
      const email = `test${Date.now()}@example.com`;
      
      // Create first user
      await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email,
          password: 'TestPassword123!'
        })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email,
          password: 'TestPassword123!'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User with this email already exists');
    });

    test('should signup with minimal required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'TestPassword123!'
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let loginEmail;
    let loginPassword;

    beforeAll(async () => {
      // Create a user for login tests
      loginEmail = `test${Date.now()}@example.com`;
      loginPassword = 'TestPassword123!';
      
      const hashedPassword = await bcrypt.hash(loginPassword, 10);
      await UserModel.create({
        email: loginEmail,
        passwordHash: hashedPassword,
        firstName: 'Login',
        lastName: 'Test'
      });
    });

    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginEmail);
      expect(response.body.token).toBeDefined();
    });

    test('should fail login with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    test('should fail login with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    test('should fail login with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'TestPassword123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should fail login with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginEmail
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let profileToken;
    let profileUser;

    beforeAll(async () => {
      // Create user and get token
      const email = `test${Date.now()}@example.com`;
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      profileUser = await UserModel.create({
        email,
        passwordHash: hashedPassword,
        firstName: 'Profile',
        lastName: 'Test'
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
      
      profileToken = loginResponse.body.token;
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${profileToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', profileUser.email);
      expect(response.body.user).toHaveProperty('firstName', profileUser.first_name);
      expect(response.body.user).toHaveProperty('lastName', profileUser.last_name);
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    test('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });
});

