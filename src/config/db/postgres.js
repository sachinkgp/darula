const { Pool } = require("pg");
const fs = require('fs');
const path = require('path');

// Parse connection string and create pool with explicit config
const getPoolConfig = () => {
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }

  // Try to parse the connection string
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.slice(1), // Remove leading '/'
      user: url.username,
      password: url.password || '',
      ssl: false
    };
  } catch (error) {
    // Fallback to connection string if URL parsing fails
    return {
      connectionString: connectionString
    };
  }
};

const pgPool = new Pool(getPoolConfig());

const initDatabase = async () => {
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pgPool.query(schema);
    console.log('✅ PostgreSQL schema initialized');
  } catch (error) {
    // Ignore "already exists" errors
    if (error.message.includes('already exists')) {
      console.log('✅ PostgreSQL schema already exists');
    } else {
      console.error('❌ Error initializing PostgreSQL schema:', error.message);
    }
  }
};

const connectPostgres = async () => {
  try {
    await pgPool.query("SELECT NOW()");
    console.log("✅ Postgres connected");
    // Initialize schema
    await initDatabase();
  } catch (err) {
    console.error("❌ Postgres connection failed:");
    console.error(err.message);
    console.error("URL:", process.env.POSTGRES_URL);
    // Don't exit - let the server continue (test runner can work without DB)
    throw err; // Re-throw so caller can handle
  }
};

module.exports = { pgPool, connectPostgres };
