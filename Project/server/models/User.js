/**
 * User Model - MongoDB/Mongoose Implementation
 * Handles user authentication, profiles, and system access
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * User Schema Definition
 * Complete user management with authentication and authorization
 */
const userSchema = new mongoose.Schema({
  // Basic user information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // Contact information
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },

  // User role and permissions
  role: {
    type: String,
    enum: {
      values: ['admin', 'coordinator', 'responder', 'volunteer', 'citizen'],
      message: 'Role must be admin, coordinator, responder, volunteer, or citizen'
    },
    default: 'citizen'
  },

  permissions: [{
    type: String,
    enum: [
      'view_dashboard', 'manage_incidents', 'manage_alerts', 'manage_teams',
      'manage_resources', 'view_reports', 'manage_users', 'system_admin',
      'send_alerts', 'update_status', 'view_analytics'
    ]
  }],

  // Profile information
  profile: {
    avatar: {
      type: String, // URL to profile image
      default: ''
    },

    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },

    organization: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },

    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters']
    },

    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },

    skills: [{
      type: String,
      trim: true
    }],

    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateNumber: String
    }],

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },

  // Location and preferences
  location: {
    // Current/default location (optional)
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      formatted: String
    },

    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // User preferences
  preferences: {
    // Notification settings
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        incidents: { type: Boolean, default: true },
        alerts: { type: Boolean, default: true },
        assignments: { type: Boolean, default: true },
        updates: { type: Boolean, default: false }
      },

      sms: {
        enabled: { type: Boolean, default: false },
        incidents: { type: Boolean, default: false },
        alerts: { type: Boolean, default: false },
        emergencies: { type: Boolean, default: true }
      },

      push: {
        enabled: { type: Boolean, default: true },
        incidents: { type: Boolean, default: true },
        alerts: { type: Boolean, default: true },
        assignments: { type: Boolean, default: true }
      }
    },

    // Display preferences
    display: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },

      language: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'zh']
      },

      dateFormat: {
        type: String,
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        default: 'MM/DD/YYYY'
      },

      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h'
      },

      units: {
        temperature: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
        distance: { type: String, enum: ['km', 'miles'], default: 'km' },
        speed: { type: String, enum: ['kmh', 'mph'], default: 'kmh' }
      }
    },

    // Alert preferences
    alerts: {
      radius: { type: Number, default: 25, min: 1, max: 100 }, // km
      severityLevels: [{
        type: String,
        enum: ['info', 'minor', 'moderate', 'severe', 'extreme']
      }],
      categories: [{
        type: String,
        enum: ['weather', 'earthquake', 'flood', 'fire', 'health', 'security']
      }]
    }
  },

  // Authentication and security
  auth: {
    // Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Two-factor authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },

    twoFactorSecret: String,
    twoFactorBackupCodes: [String],

    // Login tracking
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,

    // Session management
    activeSessions: [{
      sessionId: String,
      deviceInfo: String,
      ipAddress: String,
      userAgent: String,
      createdAt: { type: Date, default: Date.now },
      lastActivity: { type: Date, default: Date.now }
    }]
  },

  // Account status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },

  // Activity tracking
  activity: {
    firstLogin: Date,
    lastActivity: {
      type: Date,
      default: Date.now
    },

    // Activity statistics
    stats: {
      incidentsReported: { type: Number, default: 0 },
      alertsSent: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 }, // average in minutes
      availability: { type: Number, default: 100 } // percentage
    }
  },

  // System metadata
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Soft delete
  deletedAt: Date,

  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'users'
});

/**
 * Indexes for optimal query performance
 */
// Note: email and username indexes are automatically created by 'unique: true' in schema
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'auth.lastLogin': -1 });
userSchema.index({ deletedAt: 1 }, { sparse: true });

// Compound indexes
userSchema.index({ role: 1, status: 1, 'auth.emailVerified': 1 });

/**
 * Virtual fields
 */
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.auth.lockUntil && this.auth.lockUntil > Date.now());
});

userSchema.virtual('isEmailVerified').get(function() {
  return this.auth.emailVerified;
});

/**
 * Pre-save middleware
 */
userSchema.pre('save', async function(next) {
  // Update timestamp
  this.updatedAt = new Date();

  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Set default permissions based on role
  if (this.isModified('role')) {
    this.permissions = this.getDefaultPermissions(this.role);
  }

  // Generate username if not provided
  if (!this.username && this.email) {
    this.username = this.email.split('@')[0].toLowerCase();
    
    // Ensure uniqueness
    const existingUser = await this.constructor.findOne({ username: this.username });
    if (existingUser) {
      this.username += Math.floor(Math.random() * 1000);
    }
  }

  // Handle empty coordinates to prevent MongoDB GeoJSON errors
  if (this.location && this.location.coordinates) {
    if (!this.location.coordinates.coordinates || this.location.coordinates.coordinates.length === 0) {
      // Remove the coordinates field entirely if empty
      this.location.coordinates = undefined;
    }
  }

  next();
});

/**
 * Instance Methods
 */

// Password comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Get default permissions based on role
userSchema.methods.getDefaultPermissions = function(role) {
  const rolePermissions = {
    admin: [
      'view_dashboard', 'manage_incidents', 'manage_alerts', 'manage_teams',
      'manage_resources', 'view_reports', 'manage_users', 'system_admin',
      'send_alerts', 'update_status', 'view_analytics'
    ],
    coordinator: [
      'view_dashboard', 'manage_incidents', 'manage_alerts', 'manage_teams',
      'manage_resources', 'view_reports', 'send_alerts', 'update_status', 'view_analytics'
    ],
    responder: [
      'view_dashboard', 'manage_incidents', 'update_status', 'view_reports'
    ],
    volunteer: [
      'view_dashboard', 'update_status'
    ],
    citizen: [
      'view_dashboard'
    ]
  };

  return rolePermissions[role] || rolePermissions.citizen;
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.auth.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.auth.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.auth.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.auth.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Record login attempt
userSchema.methods.recordLoginAttempt = function(success) {
  if (success) {
    this.auth.loginAttempts = 0;
    this.auth.lockUntil = undefined;
    this.auth.lastLogin = new Date();
    this.activity.lastActivity = new Date();
    
    if (!this.activity.firstLogin) {
      this.activity.firstLogin = new Date();
    }
  } else {
    this.auth.loginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.auth.loginAttempts >= 5) {
      this.auth.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }
  }
  
  return this.save();
};

// Update location
userSchema.methods.updateLocation = function(coordinates, address) {
  this.location.coordinates = {
    type: 'Point',
    coordinates: coordinates
  };
  
  if (address) {
    this.location.address = address;
  }
  
  return this.save();
};

// Add session
userSchema.methods.addSession = function(sessionId, deviceInfo, ipAddress, userAgent) {
  this.auth.activeSessions.push({
    sessionId,
    deviceInfo,
    ipAddress,
    userAgent,
    createdAt: new Date(),
    lastActivity: new Date()
  });
  
  // Keep only last 5 sessions
  if (this.auth.activeSessions.length > 5) {
    this.auth.activeSessions = this.auth.activeSessions.slice(-5);
  }
  
  return this.save();
};

/**
 * Static Methods
 */

// Find users by role and location
userSchema.statics.findByRoleAndLocation = function(role, coordinates, radiusKm = 50) {
  return this.find({
    role: role,
    status: 'active',
    'auth.emailVerified': true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusKm * 1000
      }
    }
  });
};

// Find available responders
userSchema.statics.findAvailableResponders = function(coordinates, radiusKm = 25) {
  return this.find({
    role: { $in: ['responder', 'coordinator'] },
    status: 'active',
    'auth.emailVerified': true,
    'activity.lastActivity': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Active in last 24h
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusKm * 1000
      }
    }
  }).sort({ 'activity.stats.responseTime': 1 }); // Sort by fastest response time
};

// Search users
userSchema.statics.searchUsers = function(searchTerm, options = {}) {
  const query = {
    $or: [
      { firstName: new RegExp(searchTerm, 'i') },
      { lastName: new RegExp(searchTerm, 'i') },
      { email: new RegExp(searchTerm, 'i') },
      { username: new RegExp(searchTerm, 'i') },
      { 'profile.organization': new RegExp(searchTerm, 'i') }
    ],
    status: options.status || 'active'
  };

  if (options.role) {
    query.role = options.role;
  }

  return this.find(query)
    .select('-password -auth.passwordResetToken -auth.emailVerificationToken')
    .sort({ 'activity.lastActivity': -1 })
    .limit(options.limit || 20);
};

// Get user statistics
userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$auth.emailVerified', true] }, 1, 0] }
        },
        usersByRole: {
          $push: '$role'
        }
      }
    }
  ]);
};

// Clean up expired tokens and sessions
userSchema.statics.cleanupExpiredData = function() {
  const now = new Date();
  
  return this.updateMany({}, {
    $unset: {
      'auth.passwordResetToken': '',
      'auth.passwordResetExpires': '',
      'auth.emailVerificationToken': '',
      'auth.emailVerificationExpires': ''
    },
    $pull: {
      'auth.activeSessions': {
        lastActivity: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } // 30 days old
      }
    }
  }, {
    multi: true
  });
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.auth.passwordResetToken;
    delete ret.auth.emailVerificationToken;
    delete ret.auth.twoFactorSecret;
    return ret;
  }
});

userSchema.set('toObject', { virtuals: true });

/**
 * Create and export the User model
 */
const User = mongoose.model('User', userSchema);

export default User;
