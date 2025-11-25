const { database, redis, logger, BcryptHelper, JWTHelper, errors } = require('@getplot/shared');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const { AuthenticationError, ConflictError, NotFoundError, ValidationError } = errors;

class AuthService {
  /**
   * Register new user
   */
  async register({ email, password, firstName, lastName, phone, country, residentialAddress }) {
    try {
      // Check if user already exists
      const existingUser = await database.query(
        'SELECT id FROM app_auth.users WHERE email = $1',
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
          `INSERT INTO app_auth.users (
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
          [user.id, firstName, lastName, phone, country, residentialAddress || null, 'default_member']
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
        role: 'default_member',
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
          role: 'default_member',
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
        FROM app_auth.users u
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
        'UPDATE app_auth.users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
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
      if (error instanceof AuthenticationError) {
        const httpError = new Error(error.message);
        httpError.statusCode = 401; // Unauthorized
        throw httpError;
      }
      throw error;
    }
  }

  /**
   * Social login (OAuth)
   */
  async socialLogin({ provider, idToken, accessToken }) {
    try {
      const providerProfile = await this._verifyOAuthProvider(provider, { idToken, accessToken });

      const email = providerProfile.email?.toLowerCase();
      if (!email) {
        throw new AuthenticationError('Social provider did not return an email address');
      }

      const existing = await database.query(
        `SELECT 
          u.id, u.email, u.email_verified,
          p.first_name, p.last_name, p.role
        FROM app_auth.users u
        LEFT JOIN users.profiles p ON u.id = p.user_id
        WHERE u.email = $1`,
        [email]
      );

      let userRecord;
      if (existing.rows.length === 0) {
        userRecord = await this._createUserFromSocialProfile(providerProfile);
      } else {
        userRecord = existing.rows[0];
        await this._syncProfileFromSocial(userRecord.id, providerProfile);
      }

      await this._upsertOAuthProvider(userRecord.id, provider, providerProfile.providerUserId, accessToken || null);

      const role = userRecord.role || 'default_member';

      const tokens = JWTHelper.generateTokenPair({
        sub: userRecord.id,
        email: userRecord.email,
        role,
      });

      await this._storeRefreshToken(userRecord.id, tokens.refreshToken);
      await this._logActivity(userRecord.id, 'social_login', provider, userRecord.id);

      return {
        user: {
          id: userRecord.id,
          email: userRecord.email,
          emailVerified: true,
          firstName: userRecord.first_name || providerProfile.firstName,
          lastName: userRecord.last_name || providerProfile.lastName,
          role,
        },
        tokens,
        providerProfile,
      };
    } catch (error) {
      logger.error('Social login error:', error);
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
        FROM app_auth.refresh_tokens rt
        JOIN app_auth.users u ON rt.user_id = u.id
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
      await database.query('DELETE FROM app_auth.refresh_tokens WHERE token = $1', [refreshToken]);

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
          'DELETE FROM app_auth.refresh_tokens WHERE user_id = $1 AND token = $2',
          [userId, refreshToken]
        );
      } else {
        // Delete all refresh tokens for user
        await database.query('DELETE FROM app_auth.refresh_tokens WHERE user_id = $1', [userId]);
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
      const result = await database.query('SELECT id FROM app_auth.users WHERE email = $1', [
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
        'UPDATE app_auth.users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
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
        'SELECT id FROM app_auth.users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP',
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
        'UPDATE app_auth.users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [passwordHash, userId]
      );

      // Invalidate all refresh tokens
      await database.query('DELETE FROM app_auth.refresh_tokens WHERE user_id = $1', [userId]);

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
        'SELECT id FROM app_auth.users WHERE email_verification_token = $1 AND email_verification_expires > CURRENT_TIMESTAMP',
        [token]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      const userId = result.rows[0].id;

      // Update user as verified
      await database.query(
        'UPDATE app_auth.users SET email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1',
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

  async _verifyOAuthProvider(provider, tokens) {
    switch (provider) {
      case 'google':
        return this._verifyGoogleToken(tokens.idToken);
      default:
        throw new ValidationError(`Unsupported social provider: ${provider}`);
    }
  }

  async _verifyGoogleToken(idToken) {
    if (!idToken) {
      throw new ValidationError('Google ID token is required');
    }

    try {
      const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: idToken },
      });

      if (config.oauth?.google?.clientId && data.aud !== config.oauth.google.clientId) {
        throw new AuthenticationError('Google token audience mismatch');
      }

      if (!data.email) {
        throw new AuthenticationError('Google profile does not include an email address');
      }

      return {
        provider: 'google',
        providerUserId: data.sub,
        email: data.email,
        emailVerified: data.email_verified === 'true',
        firstName: data.given_name || data.name?.split(' ')[0] || null,
        lastName: data.family_name || data.name?.split(' ').slice(1).join(' ') || null,
        avatar: data.picture || null,
      };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Google token verification failed', error);
      throw new AuthenticationError('Failed to verify Google token');
    }
  }

  async _createUserFromSocialProfile(profile) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await BcryptHelper.hash(randomPassword);

    const user = await database.transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO app_auth.users (
          email, password_hash, email_verified, email_verification_token, email_verification_expires
        ) VALUES ($1, $2, $3, NULL, NULL)
        RETURNING id, email, email_verified`,
        [profile.email.toLowerCase(), passwordHash, profile.emailVerified !== false]
      );

      const createdUser = userResult.rows[0];

      await client.query(
        `INSERT INTO users.profiles (
          user_id, first_name, last_name, role, avatar_url
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE
        SET first_name = COALESCE(EXCLUDED.first_name, users.profiles.first_name),
            last_name = COALESCE(EXCLUDED.last_name, users.profiles.last_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.profiles.avatar_url),
            updated_at = CURRENT_TIMESTAMP`,
        [createdUser.id, profile.firstName, profile.lastName, 'default_member', profile.avatar]
      );

      await client.query(
        'INSERT INTO users.preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [createdUser.id]
      );

      return {
        ...createdUser,
        first_name: profile.firstName,
        last_name: profile.lastName,
        role: 'default_member',
      };
    });

    logger.info('User created via social login', { userId: user.id, provider: profile.provider });
    return user;
  }

  async _syncProfileFromSocial(userId, profile) {
    if (!profile.firstName && !profile.lastName && !profile.avatar) {
      return;
    }

    await database.query(
      `UPDATE users.profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4`,
      [profile.firstName, profile.lastName, profile.avatar, userId]
    );
  }

  async _upsertOAuthProvider(userId, provider, providerUserId, accessToken = null, refreshToken = null) {
    await database.query(
      `INSERT INTO app_auth.oauth_providers (user_id, provider, provider_user_id, access_token, refresh_token)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (provider, provider_user_id)
       DO UPDATE SET 
         user_id = EXCLUDED.user_id,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, provider, providerUserId, accessToken, refreshToken]
    );
  }

  /**
   * Private: Store refresh token
   */
  async _storeRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await database.query(
      'INSERT INTO app_auth.refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
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

