import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header, cookie, or query parameter
    let token = null;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check query parameter (for WebSocket connections)
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id)
      .select('+password') // Include password for session validation
      .populate('permissions');
      
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact administrator.',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Check if user is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.',
        code: 'ACCOUNT_LOCKED'
      });
    }
    
    // Check if email is verified (for certain actions)
    if (!user.auth.emailVerified && req.path !== '/verify-email' && !req.path.includes('/auth/')) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address to continue.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }
    
    // Update last activity
    user.activity.lastActivity = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.status === 'active') {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Authorization Middleware
 * Checks if user has required permissions
 */
export const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Check if user has any of the required permissions
    const hasPermission = permissions.some(permission => 
      req.user.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions,
        current: req.user.permissions
      });
    }
    
    next();
  };
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role.',
        code: 'INSUFFICIENT_ROLE',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Rate Limiting Middlewares
 */

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset rate limiting
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Input Validation Middlewares
 */

// Registration validation
export const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1-50 characters'),
    
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1-50 characters'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  body('role')
    .optional()
    .isIn(['admin', 'coordinator', 'responder', 'volunteer', 'citizen'])
    .withMessage('Invalid role specified')
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// Password reset request validation
export const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Password reset validation
export const validatePasswordReset = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1-50 characters'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1-50 characters'),
    
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
    
  body('profile.organization')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters')
];

/**
 * Validation Error Handler
 * Processes validation results and returns formatted errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * Security Headers Middleware
 * Adds additional security headers
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * JWT Utility Functions
 */

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'disaster-management-system',
      audience: 'disaster-management-users'
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'disaster-management-system',
      audience: 'disaster-management-users'
    }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Session Management
 */

// Validate user session
export const validateSession = async (req, res, next) => {
  if (!req.user) return next();
  
  try {
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
      const session = req.user.auth.activeSessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.lastActivity = new Date();
        await req.user.save({ validateBeforeSave: false });
      }
    }
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    next();
  }
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  requireRole,
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  handleValidationErrors,
  securityHeaders,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  validateSession
};
