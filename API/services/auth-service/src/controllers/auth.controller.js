const { asyncHandler, ResponseHandler, validators, logger } = require('@getplot/shared');
const authService = require('../services/auth.service');
const notificationService = require('../services/notification.service');

class AuthController {
  /**
   * @route   POST /api/v1/auth/register
   * @desc    Register new user
   * @access  Public
   */
  register = asyncHandler(async (req, res) => {
    // Validate request
    const data = validators.validate(validators.schemas.register, req.body);

    // Register user
    const result = await authService.register(data);

    if (result.verificationToken) {
      notificationService
        .sendVerificationEmail(result.user.email, result.verificationToken)
        .catch((error) =>
          logger.error('Failed to send verification email', {
            email: result.user.email,
            error: error.message,
          })
        );
    }

    // Return response without verification token
    const { verificationToken, ...response } = result;

    return ResponseHandler.created(res, response, 'Registration successful. Please check your email to verify your account.');
  });

  /**
   * @route   POST /api/v1/auth/login
   * @desc    Login user
   * @access  Public
   */
  login = asyncHandler(async (req, res) => {
    // Validate request
    const data = validators.validate(validators.schemas.login, req.body);

    // Login user
    const result = await authService.login(data);

    return ResponseHandler.success(res, result, 'Login successful');
  });

  /**
   * @route   POST /api/v1/auth/social/login
   * @desc    Login or register via social provider
   * @access  Public
   */
  socialLogin = asyncHandler(async (req, res) => {
    const data = validators.validate(validators.schemas.socialLogin, req.body);

    const result = await authService.socialLogin(data);

    return ResponseHandler.success(res, result, 'Social login successful');
  });

  /**
   * @route   POST /api/v1/auth/refresh
   * @desc    Refresh access token
   * @access  Public
   */
  refresh = asyncHandler(async (req, res) => {
    // Validate request
    const data = validators.validate(validators.schemas.refresh, req.body);

    // Refresh token
    const result = await authService.refreshToken(data.refreshToken);

    return ResponseHandler.success(res, result, 'Token refreshed successfully');
  });

  /**
   * @route   POST /api/v1/auth/logout
   * @desc    Logout user
   * @access  Private
   */
  logout = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const refreshToken = req.body.refreshToken;

    // Logout user
    await authService.logout(userId, refreshToken);

    return ResponseHandler.success(res, null, 'Logged out successfully');
  });

  /**
   * @route   POST /api/v1/auth/forgot-password
   * @desc    Request password reset
   * @access  Public
   */
  forgotPassword = asyncHandler(async (req, res) => {
    // Validate request
    const data = validators.validate(validators.schemas.forgotPassword, req.body);

    // Request password reset
    const result = await authService.forgotPassword(data.email);

    if (result.resetToken) {
      notificationService
        .sendPasswordResetEmail(data.email, result.resetToken)
        .catch((error) =>
          logger.error('Failed to send password reset email', {
            email: data.email,
            error: error.message,
          })
        );
    }

    return ResponseHandler.success(res, null, 'If the email exists, a password reset link has been sent');
  });

  /**
   * @route   POST /api/v1/auth/reset-password
   * @desc    Reset password
   * @access  Public
   */
  resetPassword = asyncHandler(async (req, res) => {
    // Validate request
    const data = validators.validate(validators.schemas.resetPassword, req.body);

    // Reset password
    await authService.resetPassword(data.token, data.newPassword);

    return ResponseHandler.success(res, null, 'Password reset successful. Please login with your new password.');
  });

  /**
   * @route   GET /api/v1/auth/verify-email
   * @desc    Verify email address
   * @access  Public
   */
  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
      return ResponseHandler.error(res, { message: 'Verification token is required' }, 400);
    }

    // Verify email
    await authService.verifyEmail(token);

    return ResponseHandler.success(res, null, 'Email verified successfully');
  });

  /**
   * @route   GET /api/v1/auth/me
   * @desc    Get current user
   * @access  Private
   */
  me = asyncHandler(async (req, res) => {
    // User data is already in req.user from auth middleware
    return ResponseHandler.success(res, req.user, 'User retrieved successfully');
  });
}

module.exports = new AuthController();

