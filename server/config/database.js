const { Pool } = require('pg');
const logger = require('./logger');

// Parse DATABASE_URL or use individual components
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'reporemix',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
};

// Create connection pool
const pool = new Pool({
  ...getDatabaseConfig(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
});

// Test connection
pool.on('connect', () => {
  logger.info('Database connection established');
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error', { text, error: error.message });
    throw error;
  }
};

// Helper function for transactions
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Database health check
const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW()');
    return {
      healthy: true,
      timestamp: result.rows[0].now,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
};

module.exports = {
  pool,
  query,
  transaction,
  healthCheck,
};
