const { database, redis, logger, errors } = require('@getplot/shared');

const { NotFoundError } = errors;

class UsersService {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      // Try cache first
      const cacheKey = `user:profile:${userId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        logger.debug('Profile cache hit', { userId });
        return JSON.parse(cached);
      }

      const result = await database.query(
        `SELECT 
          u.id, u.email, u.email_verified, u.is_active, u.created_at,
          p.first_name, p.last_name, p.phone, p.country, p.residential_address, p.role, p.avatar_url
        FROM auth.users u
        LEFT JOIN users.profiles p ON u.id = p.user_id
        WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('User');
      }

      const profile = this._formatProfile(result.rows[0]);

      // Cache for 15 minutes
      await redis.setex(cacheKey, 900, JSON.stringify(profile));

      logger.info('Profile retrieved', { userId });

      return profile;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      const { firstName, lastName, phone, residentialAddress } = updates;

      const result = await database.query(
        `UPDATE users.profiles 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             residential_address = COALESCE($4, residential_address),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING *`,
        [firstName, lastName, phone, residentialAddress, userId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Profile');
      }

      // Invalidate cache
      await redis.del(`user:profile:${userId}`);

      logger.info('Profile updated', { userId });

      return this._formatProfile(result.rows[0]);
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    try {
      const result = await database.query(
        'SELECT * FROM users.preferences WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        // Create default preferences
        const newPrefs = await database.query(
          'INSERT INTO users.preferences (user_id) VALUES ($1) RETURNING *',
          [userId]
        );
        return this._formatPreferences(newPrefs.rows[0]);
      }

      return this._formatPreferences(result.rows[0]);
    } catch (error) {
      logger.error('Get preferences error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, updates) {
    try {
      const { notificationsEmail, notificationsSms, language, currency } = updates;

      const result = await database.query(
        `UPDATE users.preferences 
         SET notifications_email = COALESCE($1, notifications_email),
             notifications_sms = COALESCE($2, notifications_sms),
             language = COALESCE($3, language),
             currency = COALESCE($4, currency),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING *`,
        [notificationsEmail, notificationsSms, language, currency, userId]
      );

      return this._formatPreferences(result.rows[0]);
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Get saved properties
   */
  async getSavedProperties(userId, { page = 1, limit = 20 }) {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await database.query(
        'SELECT COUNT(*) FROM users.saved_properties WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Get saved properties
      const result = await database.query(
        `SELECT property_id, created_at 
         FROM users.saved_properties 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return {
        properties: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('Get saved properties error:', error);
      throw error;
    }
  }

  /**
   * Save property
   */
  async saveProperty(userId, propertyId) {
    try {
      await database.query(
        'INSERT INTO users.saved_properties (user_id, property_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, propertyId]
      );

      logger.info('Property saved', { userId, propertyId });

      return { success: true };
    } catch (error) {
      logger.error('Save property error:', error);
      throw error;
    }
  }

  /**
   * Unsave property
   */
  async unsaveProperty(userId, propertyId) {
    try {
      await database.query(
        'DELETE FROM users.saved_properties WHERE user_id = $1 AND property_id = $2',
        [userId, propertyId]
      );

      logger.info('Property unsaved', { userId, propertyId });

      return { success: true };
    } catch (error) {
      logger.error('Unsave property error:', error);
      throw error;
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(userId, { page = 1, limit = 20 }) {
    try {
      const offset = (page - 1) * limit;

      const countResult = await database.query(
        'SELECT COUNT(*) FROM users.activity_logs WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await database.query(
        `SELECT * FROM users.activity_logs 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return {
        logs: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('Get activity logs error:', error);
      throw error;
    }
  }

  /**
   * Private: Format profile
   */
  _formatProfile(row) {
    return {
      id: row.id,
      email: row.email,
      emailVerified: row.email_verified,
      isActive: row.is_active,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      country: row.country,
      residentialAddress: row.residential_address,
      role: row.role,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
    };
  }

  /**
   * Private: Format preferences
   */
  _formatPreferences(row) {
    return {
      notificationsEmail: row.notifications_email,
      notificationsSms: row.notifications_sms,
      language: row.language,
      currency: row.currency,
    };
  }
}

module.exports = new UsersService();

