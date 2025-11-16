const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('./errors');

class JWTHelper {
  /**
   * Generate access token
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '30m',
      issuer: process.env.JWT_ISSUER || 'getoneplot-api',
      audience: process.env.JWT_AUDIENCE || 'getplot-client',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      issuer: process.env.JWT_ISSUER || 'getoneplot-api',
      audience: process.env.JWT_AUDIENCE || 'getoneplot-client',
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER || 'getoneplot-api',
        audience: process.env.JWT_AUDIENCE || 'getoneplot-client',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Access token expired');
      }
      throw new AuthenticationError('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: process.env.JWT_ISSUER || 'getoneplot-api',
        audience: process.env.JWT_AUDIENCE || 'getoneplot-client',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Refresh token expired');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification
   */
  static decode(token) {
    return jwt.decode(token);
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: 1800, // 30 minutes in seconds
    };
  }
}

module.exports = JWTHelper;

