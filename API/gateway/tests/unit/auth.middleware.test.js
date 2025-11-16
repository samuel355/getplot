const { authenticate, authorize, optionalAuth } = require('../../src/middleware/auth');
const { JWTHelper, ResponseHandler } = require('@getplot/shared');

// Mock dependencies
jest.mock('@getplot/shared', () => ({
  JWTHelper: {
    verifyAccessToken: jest.fn(),
  },
  ResponseHandler: {
    unauthorized: jest.fn((res, message) => res.status(401).json({ success: false, error: { message } })),
    forbidden: jest.fn((res, message) => res.status(403).json({ success: false, error: { message } })),
  },
  logger: {
    error: jest.fn(),
  },
}));

describe('Gateway Auth Middleware - Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should reject request without authorization header', () => {
      authenticate(mockReq, mockRes, mockNext);

      expect(ResponseHandler.unauthorized).toHaveBeenCalledWith(mockRes, 'No token provided');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization format', () => {
      mockReq.headers.authorization = 'InvalidFormat token123';

      authenticate(mockReq, mockRes, mockNext);

      expect(ResponseHandler.unauthorized).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should authenticate request with valid token', () => {
      const decodedToken = { userId: 'user-123', email: 'test@example.com', role: 'user' };
      mockReq.headers.authorization = 'Bearer valid-token';
      JWTHelper.verifyAccessToken.mockReturnValue(decodedToken);

      authenticate(mockReq, mockRes, mockNext);

      expect(JWTHelper.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockReq.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      JWTHelper.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockReq, mockRes, mockNext);

      expect(ResponseHandler.unauthorized).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should reject request without authenticated user', () => {
      const middleware = authorize('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(ResponseHandler.unauthorized).toHaveBeenCalledWith(mockRes, 'User not authenticated');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with insufficient permissions', () => {
      mockReq.user = { userId: 'user-123', role: 'user' };
      const middleware = authorize('admin', 'sysadmin');
      middleware(mockReq, mockRes, mockNext);

      expect(ResponseHandler.forbidden).toHaveBeenCalledWith(mockRes, 'Insufficient permissions');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow request with correct role', () => {
      mockReq.user = { userId: 'user-123', role: 'admin' };
      const middleware = authorize('admin', 'sysadmin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ResponseHandler.forbidden).not.toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      mockReq.user = { userId: 'user-123', role: 'moderator' };
      const middleware = authorize('admin', 'moderator', 'sysadmin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without user if no token provided', () => {
      optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set user if valid token provided', () => {
      const decodedToken = { userId: 'user-123', email: 'test@example.com' };
      mockReq.headers.authorization = 'Bearer valid-token';
      JWTHelper.verifyAccessToken.mockReturnValue(decodedToken);

      optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue even if token is invalid', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      JWTHelper.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

