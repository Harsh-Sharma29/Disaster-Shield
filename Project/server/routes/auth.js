/**
 * Authentication Routes
 * Handles user registration, login, logout, password reset, and account management
 */
import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import {
  authenticate,
  authLimiter,
  passwordResetLimiter,
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  handleValidationErrors,
  generateToken,
  generateRefreshToken
} from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  authLimiter,
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, username, password, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: existingUser.email === email 
            ? 'User with this email already exists' 
            : 'Username is already taken',
          code: 'USER_EXISTS'
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        username,
        password,
        phone,
        role: role || 'citizen', // Default to citizen role
        status: 'active' // Auto-activate for now, can be changed to 'pending' for email verification
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // TODO: Send verification email
      // await sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
            emailVerified: user.auth.emailVerified
          },
          token,
          expiresIn: '7d'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(409).json({
          success: false,
          message: `${field} is already taken`,
          code: 'DUPLICATE_FIELD'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts',
          code: 'ACCOUNT_LOCKED',
          lockUntil: user.auth.lockUntil
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Record failed login attempt
        await user.recordLoginAttempt(false);
        
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if user account is active
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active. Please contact administrator.',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Record successful login
      await user.recordLoginAttempt(true);

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Set cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      };

      if (rememberMe) {
        cookieOptions.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      } else {
        cookieOptions.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
      }

      res.cookie('token', token, cookieOptions);
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Add session
      const sessionId = crypto.randomBytes(16).toString('hex');
      await user.addSession(
        sessionId,
        req.headers['user-agent'] || 'Unknown',
        req.ip,
        req.headers['user-agent']
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
            emailVerified: user.auth.emailVerified,
            permissions: user.permissions,
            lastLogin: user.auth.lastLogin
          },
          token,
          refreshToken,
          sessionId,
          expiresIn: rememberMe ? '30d' : '1d'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId) {
      // Remove session from user
      req.user.auth.activeSessions = req.user.auth.activeSessions.filter(
        session => session.sessionId !== sessionId
      );
      await req.user.save({ validateBeforeSave: false });
    }

    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, async (req, res) => {
  try {
    // Clear all sessions
    req.user.auth.activeSessions = [];
    await req.user.save({ validateBeforeSave: false });

    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.fullName,
          email: req.user.email,
          username: req.user.username,
          phone: req.user.phone,
          role: req.user.role,
          status: req.user.status,
          emailVerified: req.user.auth.emailVerified,
          permissions: req.user.permissions,
          profile: req.user.profile,
          location: req.user.location,
          preferences: req.user.preferences,
          activity: req.user.activity,
          createdAt: req.user.createdAt,
          lastLogin: req.user.auth.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      code: 'PROFILE_ERROR'
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const allowedFields = [
        'firstName', 'lastName', 'phone', 'profile.bio', 
        'profile.organization', 'profile.department', 'profile.position'
      ];

      const updates = {};
      
      // Only allow updating specific fields
      allowedFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (req.body[parent] && req.body[parent][child] !== undefined) {
            if (!updates[parent]) updates[parent] = {};
            updates[parent][child] = req.body[parent][child];
          }
        } else if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            phone: user.phone,
            profile: user.profile
          }
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  passwordResetLimiter,
  validatePasswordResetRequest,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // TODO: Send password reset email
      // await sendPasswordResetEmail(user.email, resetToken);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  authLimiter,
  validatePasswordReset,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        'auth.passwordResetToken': hashedToken,
        'auth.passwordResetExpires': { $gt: Date.now() }
      }).select('+password');

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token',
          code: 'INVALID_RESET_TOKEN'
        });
      }

      // Set new password
      user.password = password;
      user.auth.passwordResetToken = undefined;
      user.auth.passwordResetExpires = undefined;
      user.auth.loginAttempts = 0;
      user.auth.lockUntil = undefined;

      await user.save();

      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        code: 'PASSWORD_RESET_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.post('/change-password',
  authenticate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
          code: 'MISSING_PASSWORDS'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
          code: 'WEAK_PASSWORD'
        });
      }

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Set new password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        code: 'PASSWORD_CHANGE_ERROR'
      });
    }
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      'auth.emailVerificationToken': hashedToken,
      'auth.emailVerificationExpires': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        code: 'INVALID_VERIFICATION_TOKEN'
      });
    }

    // Mark email as verified
    user.auth.emailVerified = true;
    user.auth.emailVerificationToken = undefined;
    user.auth.emailVerificationExpires = undefined;
    user.status = 'active'; // Activate account

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      code: 'EMAIL_VERIFICATION_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    if (req.user.auth.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        code: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Generate new verification token
    const verificationToken = req.user.generateEmailVerificationToken();
    await req.user.save({ validateBeforeSave: false });

    // TODO: Send verification email
    // await sendVerificationEmail(req.user.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      code: 'VERIFICATION_SEND_ERROR'
    });
  }
});

/**
 * @route   GET /api/auth/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = req.user.auth.activeSessions.map(session => ({
      sessionId: session.sessionId,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      isCurrent: req.headers['x-session-id'] === session.sessionId
    }));

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      code: 'SESSIONS_ERROR'
    });
  }
});

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Terminate specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    req.user.auth.activeSessions = req.user.auth.activeSessions.filter(
      session => session.sessionId !== sessionId
    );

    await req.user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });

  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to terminate session',
      code: 'SESSION_TERMINATE_ERROR'
    });
  }
});

export default router;
