const { pgPool } = require('../../config/db/postgres');

const UserModel = {
  // Create a new user
  create: async (userData) => {
    const { email, passwordHash, firstName, lastName, phone } = userData;
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, phone, created_at
    `;
    const result = await pgPool.query(query, [email, passwordHash, firstName, lastName, phone]);
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pgPool.query(query, [email]);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const query = 'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = UserModel;

