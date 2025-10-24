const { database, redis, logger, BcryptHelper, JWTHelper, errors } = require('@getplot/shared');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const { AuthenticationError, ConflictError, NotFoundError } = errors;

class AuthService {
  /**
   * Register new user
   */
  async register({ email, password, firstName, lastName, phone, country, residentialAddress }) {
    try {
      // Check if user already exists
      const existingUser = await database.query(
        'SELECT id FROM auth.users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictError('Email already registered');
      }

      // Hash password
      const passwordHash = await BcryptHelper.hash(password);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Start transaction
      const result = await database.transaction(async (client) => {
        // Create user in auth schema
        const userResult = await client.query(
          `INSERT INTO auth.users (
            email, password_hash, email_verification_token, email_verification_expires
          ) VALUES ($1, $2, $3, $4) RETURNING id, email, email_verified, created_at`,
          [email.toLowerCase(), passwordHash, verificationToken, verificationExpires]
        );

        const user = userResult.rows[0];

        // Create user profile
        await client.query(
          `INSERT INTO users.profiles (
            user_id, first_name, last_name, phone, country, residential_address, role
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user.id, firstName, lastName, phone, country, residentialAddress || null, 'customer']
        );

        // Create user preferences
        await client.query(
          `INSERT INTO users.preferences (user_id) VALUES ($1)`,
          [user.id]
        );

        return user;
      });

      // Generate tokens
      const tokens = JWTHelper.generateTokenPair({
        sub: result.id,
        email: result.email,
        role: 'customer',
      });

      // Store refresh token
      await this._storeRefreshToken(result.id, tokens.refreshToken);

      logger.info('User registered successfully', { userId: result.id, email: result.email });

      return {
        user: {
          id: result.id,
          email: result.email,
          emailVerified: result.email_verified,
          firstName,
          lastName,
          role: 'customer',
        },
        tokens,
        verificationToken, // To be sent via email
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    try {
      // Get user with profile
      const result = await database.query(
        `SELECT 
          u.id, u.email, u.password_hash, u.email_verified, u.is_active,
          p.first_name, p.last_name, p.role
        FROM auth.users u
        LEFT JOIN users.profiles p ON u.id = p.user_id
        WHERE u.email = $1`,
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid email or password');
      }

      const user = result.rows[0];

      // Check if account is active
      if (!user.is_active) {
        throw new AuthenticationError('Account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await BcryptHelper.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokens = JWTHelper.generateTokenPair({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      await this._storeRefreshToken(user.id, tokens.refreshToken);

      // Update last login
      await database.query(
        'UPDATE auth.users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Log activity
      await this._logActivity(user.id, 'login', 'auth', user.id);

      logger.info('User logged in', { userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = JWTHelper.verifyRefreshToken(refreshToken);

      // Check if token exists in database
      const result = await database.query(
        `SELECT rt.user_id, u.email, p.role
        FROM auth.refresh_tokens rt
        JOIN auth.users u ON rt.user_id = u.id
        JOIN users.profiles p ON u.id = p.user_id
        WHERE rt.token = $1 AND rt.expires_at > CURRENT_TIMESTAMP`,
        [refreshToken]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      const { user_id, email, role } = result.rows[0];

      // Generate new token pair
      const tokens = JWTHelper.generateTokenPair({
        sub: user_id,
        email,
        role,
      });

      // Delete old refresh token
      await database.query('DELETE FROM auth.refresh_tokens WHERE token = $1', [refreshToken]);

      // Store new refresh token
      await this._storeRefreshToken(user_id, tokens.refreshToken);

      logger.info('Token refreshed', { userId: user_id });

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId, refreshToken) {
    try {
      // Delete refresh token
      if (refreshToken) {
        await database.query(
          'DELETE FROM auth.refresh_tokens WHERE user_id = $1 AND token = $2',
          [userId, refreshToken]
        );
      } else {
        // Delete all refresh tokens for user
        await database.query('DELETE FROM auth.refresh_tokens WHERE user_id = $1', [userId]);
      }

      // Log activity
      await this._logActivity(userId, 'logout', 'auth', userId);

      logger.info('User logged out', { userId });

      return { success: true };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const result = await database.query('SELECT id FROM auth.users WHERE email = $1', [
        email.toLowerCase(),
      ]);

      if (result.rows.length === 0) {
        // Don't reveal if email exists
        return { success: true };
      }

      const userId = result.rows[0].id;

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await database.query(
        'UPDATE auth.users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, userId]
      );

      logger.info('Password reset requested', { userId, email });

      return {
        success: true,
        resetToken, // To be sent via email
      };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      const result = await database.query(
        'SELECT id FROM auth.users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP',
        [token]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      const userId = result.rows[0].id;

      // Hash new password
      const passwordHash = await BcryptHelper.hash(newPassword);

      // Update password and clear reset token
      await database.query(
        'UPDATE auth.users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [passwordHash, userId]
      );

      // Invalidate all refresh tokens
      await database.query('DELETE FROM auth.refresh_tokens WHERE user_id = $1', [userId]);

      // Log activity
      await this._logActivity(userId, 'password_reset', 'auth', userId);

      logger.info('Password reset successful', { userId });

      return { success: true };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      const result = await database.query(
        'SELECT id FROM auth.users WHERE email_verification_token = $1 AND email_verification_expires > CURRENT_TIMESTAMP',
        [token]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      const userId = result.rows[0].id;

      // Update user as verified
      await database.query(
        'UPDATE auth.users SET email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1',
        [userId]
      );

      // Log activity
      await this._logActivity(userId, 'email_verified', 'auth', userId);

      logger.info('Email verified', { userId });

      return { success: true };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Private: Store refresh token
   */
  async _storeRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await database.query(
      'INSERT INTO auth.refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }

  /**
   * Private: Log user activity
   */
  async _logActivity(userId, action, resourceType, resourceId) {
    try {
      await database.query(
        'INSERT INTO users.activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
        [userId, action, resourceType, resourceId]
      );
    } catch (error) {
      logger.error('Activity log error:', error);
      // Don't throw - activity logging shouldn't break the flow
    }
  }
}

module.exports = new AuthService();

