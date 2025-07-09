/**
 * Alert Model - MongoDB/Mongoose Implementation
 * Handles emergency alerts and notifications in the disaster management system
 */
import mongoose from 'mongoose';

/**
 * Alert Schema Definition
 * Defines the structure for emergency alerts in the database
 */
const alertSchema = new mongoose.Schema({
  // Alert identification
  alertId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  
  // Alert type and classification
  type: {
    type: String,
    required: true,
    enum: [
      'weather', 'earthquake', 'flood', 'fire', 'tsunami', 
      'landslide', 'volcanic', 'health', 'security', 'other'
    ],
    index: true
  },
  
  // Alert severity level
  severity: {
    type: String,
    required: true,
    enum: ['info', 'minor', 'moderate', 'severe', 'extreme'],
    default: 'info',
    index: true
  },
  
  // Alert urgency
  urgency: {
    type: String,
    required: true,
    enum: ['immediate', 'expected', 'future', 'past'],
    default: 'expected'
  },
  
  // Alert certainty
  certainty: {
    type: String,
    required: true,
    enum: ['observed', 'likely', 'possible', 'unlikely', 'unknown'],
    default: 'possible'
  },
  
  // Alert content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  instructions: {
    type: String,
    maxlength: 1000
  },
  
  // Geographic information
  affectedAreas: [{
    name: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Polygon', 'Point', 'Circle'],
        default: 'Point'
      },
      coordinates: {
        type: [[[Number]]], // GeoJSON format
        required: true
      }
    },
    population: {
      type: Number,
      min: 0
    }
  }],
  
  // Center point for quick queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  
  // Time information
  effectiveTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  expirationTime: {
    type: Date,
    required: true,
    index: true
  },
  
  // Alert status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'update', 'cancel', 'expired'],
    default: 'active',
    index: true
  },
  
  // Source information
  source: {
    organization: {
      type: String,
      required: true
    },
    contact: {
      name: String,
      email: String,
      phone: String
    },
    website: String
  },
  
  // Alert metadata
  category: {
    type: String,
    enum: ['geo', 'met', 'safety', 'security', 'rescue', 'fire', 'health', 'env', 'transport', 'infra', 'cbrne', 'other'],
    default: 'other'
  },
  
  // Priority scoring (calculated field)
  priorityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  
  // Related incidents
  relatedIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  
  // Response actions taken
  responseActions: [{
    action: {
      type: String,
      required: true
    },
    takenBy: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Notification tracking
  notifications: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    acknowledged: {
      type: Number,
      default: 0
    },
    channels: [{
      type: String,
      enum: ['sms', 'email', 'push', 'radio', 'tv', 'social', 'siren']
    }]
  },
  
  // System timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Created by user/system
  createdBy: {
    type: String,
    required: true
  },
  
  // Last updated by
  lastUpdatedBy: {
    type: String
  },
  
  // Version control for updates
  version: {
    type: Number,
    default: 1
  },
  
  // Previous versions reference
  previousVersions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }]
}, {
  // Schema options
  timestamps: true, // Automatically manage createdAt and updatedAt
  collection: 'alerts', // Explicit collection name
  
  // Add version key for optimistic concurrency control
  versionKey: '__v'
});

/**
 * Indexes for optimal query performance
 */
// Compound indexes for common queries
alertSchema.index({ status: 1, severity: 1, effectiveTime: -1 });
alertSchema.index({ type: 1, status: 1, createdAt: -1 });
alertSchema.index({ expirationTime: 1, status: 1 });
alertSchema.index({ location: '2dsphere' }); // Geospatial index
alertSchema.index({ priorityScore: -1, effectiveTime: -1 });

// Text index for search functionality
alertSchema.index({
  title: 'text',
  description: 'text',
  'affectedAreas.name': 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    'affectedAreas.name': 3
  },
  name: 'alert_text_index'
});

/**
 * Pre-save middleware
 * Automatically update timestamps and calculate priority score
 */
alertSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();
  
  // Calculate priority score based on severity, urgency, and certainty
  this.priorityScore = this.calculatePriorityScore();
  
  // Increment version if document is being updated
  if (!this.isNew) {
    this.version += 1;
  }
  
  next();
});

/**
 * Instance Methods
 */

// Calculate priority score for alert ranking
alertSchema.methods.calculatePriorityScore = function() {
  const severityWeight = {
    'info': 10,
    'minor': 25,
    'moderate': 50,
    'severe': 75,
    'extreme': 100
  };
  
  const urgencyWeight = {
    'immediate': 1.0,
    'expected': 0.8,
    'future': 0.6,
    'past': 0.2
  };
  
  const certaintyWeight = {
    'observed': 1.0,
    'likely': 0.8,
    'possible': 0.6,
    'unlikely': 0.3,
    'unknown': 0.1
  };
  
  const basePriority = severityWeight[this.severity] || 0;
  const urgencyMultiplier = urgencyWeight[this.urgency] || 0.5;
  const certaintyMultiplier = certaintyWeight[this.certainty] || 0.5;
  
  return Math.round(basePriority * urgencyMultiplier * certaintyMultiplier);
};

// Check if alert is currently active
alertSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.effectiveTime <= now && 
         this.expirationTime > now;
};

// Get formatted location string
alertSchema.methods.getLocationString = function() {
  if (this.affectedAreas && this.affectedAreas.length > 0) {
    return this.affectedAreas.map(area => area.name).join(', ');
  }
  return 'Location not specified';
};

// Add response action
alertSchema.methods.addResponseAction = function(action, takenBy, notes = '') {
  this.responseActions.push({
    action,
    takenBy,
    notes,
    timestamp: new Date()
  });
  return this.save();
};

/**
 * Static Methods
 */

// Find active alerts within radius of coordinates
alertSchema.statics.findNearby = function(longitude, latitude, radiusInKm = 50) {
  return this.find({
    status: 'active',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert to meters
      }
    },
    effectiveTime: { $lte: new Date() },
    expirationTime: { $gt: new Date() }
  }).sort({ priorityScore: -1, effectiveTime: -1 });
};

// Find alerts by severity
alertSchema.statics.findBySeverity = function(severity, limit = 50) {
  return this.find({
    severity,
    status: 'active',
    effectiveTime: { $lte: new Date() },
    expirationTime: { $gt: new Date() }
  })
  .sort({ priorityScore: -1, effectiveTime: -1 })
  .limit(limit);
};

// Search alerts by text
alertSchema.statics.searchAlerts = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: options.status || 'active'
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.severity) {
    query.severity = options.severity;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, priorityScore: -1 })
    .limit(options.limit || 20);
};

// Expire old alerts
alertSchema.statics.expireOldAlerts = function() {
  return this.updateMany(
    {
      status: 'active',
      expirationTime: { $lt: new Date() }
    },
    {
      $set: { status: 'expired', updatedAt: new Date() }
    }
  );
};

// Get alert statistics
alertSchema.statics.getStatistics = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      $lte: endDate || new Date()
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        byType: {
          $push: '$type'
        },
        bySeverity: {
          $push: '$severity'
        },
        avgPriorityScore: { $avg: '$priorityScore' }
      }
    }
  ]);
};

/**
 * Virtual fields
 */

// Virtual for time remaining until expiration
alertSchema.virtual('timeUntilExpiration').get(function() {
  if (this.expirationTime) {
    const now = new Date();
    const timeDiff = this.expirationTime.getTime() - now.getTime();
    return timeDiff > 0 ? timeDiff : 0;
  }
  return 0;
});

// Virtual for human-readable location
alertSchema.virtual('locationDisplay').get(function() {
  return this.getLocationString();
});

// Ensure virtual fields are serialized
alertSchema.set('toJSON', { virtuals: true });
alertSchema.set('toObject', { virtuals: true });

/**
 * Create and export the Alert model
 */
const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
