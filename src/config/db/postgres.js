const { Pool } = require("pg");
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

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
  logger.info('Database init start', { operation: 'db', operationName: 'initSchema' });
  const start = Date.now();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pgPool.query(schema);
    logger.info('Database schema initialized', { operation: 'db', operationName: 'initSchema', success: true, durationMs: Date.now() - start });
    console.log('✅ PostgreSQL schema initialized');
  } catch (error) {
    if (error.message.includes('already exists')) {
      logger.info('PostgreSQL schema already exists', { operation: 'db', operationName: 'initSchema', success: true, durationMs: Date.now() - start });
      console.log('✅ PostgreSQL schema already exists');
    } else {
      logger.error('Error initializing PostgreSQL schema', { operation: 'db', operationName: 'initSchema', success: false, durationMs: Date.now() - start, error });
      console.error('❌ Error initializing PostgreSQL schema:', error.message);
    }
  }
  logger.info('Database slug migration check start', { operation: 'db', operationName: 'slugMigration' });
  try {
    await pgPool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
          ALTER TABLE products ADD COLUMN slug VARCHAR(255);
          UPDATE products SET slug = 'product-' || id WHERE slug IS NULL;
          ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
          CREATE UNIQUE INDEX idx_products_slug ON products(slug);
        END IF;
      END $$
    `);
    logger.info('Database slug migration completed', { operation: 'db', operationName: 'slugMigration', success: true });
  } catch (e) {
    logger.info('Database slug migration skip or done', { operation: 'db', operationName: 'slugMigration', success: true });
  }
};

const connectPostgres = async () => {
  logger.info('Postgres connection attempt', { operation: 'db', operationName: 'connect' });
  const start = Date.now();
  try {
    await pgPool.query("SELECT NOW()");
    logger.info('Postgres connected', { operation: 'db', operationName: 'connect', success: true, durationMs: Date.now() - start });
    console.log("✅ Postgres connected");
    await initDatabase();
  } catch (err) {
    logger.error('Postgres connection failed', { operation: 'db', operationName: 'connect', success: false, durationMs: Date.now() - start, error: err });
    console.error("❌ Postgres connection failed:");
    console.error(err.message);
    console.error("URL:", process.env.POSTGRES_URL);
    throw err;
  }
};

module.exports = { pgPool, connectPostgres };
