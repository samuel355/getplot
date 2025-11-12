const { Pool } = require('pg');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.pool = null;
  }

  /**
   * Initialize database connection pool
   */
  async connect(config = {}) {
    try {
      // Supabase requires SSL, check DATABASE_SSL or if URL contains supabase
      const dbUrl = process.env.DATABASE_URL || '';
      const requiresSSL = process.env.DATABASE_SSL === 'true' || dbUrl.includes('supabase');
      
      const poolConfig = {
        connectionString: process.env.DATABASE_URL,
        max: config.max || parseInt(process.env.DATABASE_POOL_MAX, 10) || 10,
        min: config.min || parseInt(process.env.DATABASE_POOL_MIN, 10) || 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
      };
      
      // Add SSL configuration for Supabase pooler
      if (requiresSSL) {
        poolConfig.ssl = {
          rejectUnauthorized: false
        };
      }

      this.pool = new Pool(poolConfig);

      // Test connection
      const client = await this.pool.connect();
      logger.info('Database connected successfully');
      client.release();

      // Handle pool errors
      this.pool.on('error', (err) => {
        logger.error('Unexpected database pool error:', err);
      });

      return this.pool;
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Execute a query
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Executed query', { text, duration, rows: res.rowCount });
      
      return res;
    } catch (error) {
      logger.error('Query error:', { text, error: error.message });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient() {
    return await this.pool.connect();
  }

  /**
   * Execute queries in a transaction
   */
  async transaction(callback) {
    const client = await this.getClient();
    
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
  }

  /**
   * Close database connection
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection closed');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return { status: 'healthy', message: 'Database connection is active' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Export singleton instance
module.exports = new Database();

