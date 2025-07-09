/**
 * UserLocation Model - MongoDB/Mongoose Implementation
 * Tracks user locations, location history, and location-based preferences
 */
import mongoose from 'mongoose';

/**
 * User Location Schema Definition
 * Stores user location data, preferences, and location tracking history
 */
const userLocationSchema = new mongoose.Schema({
  // User identification
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  sessionId: {
    type: String,
    index: true // For tracking anonymous users
  },
  
  // Current location
  currentLocation: {
    // Geographic coordinates (GeoJSON Point)
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    
    // Location accuracy and source
    accuracy: {
      type: Number, // meters
      min: 0
    },
    
    altitude: Number, // meters above sea level
    altitudeAccuracy: Number, // meters
    
    heading: Number, // degrees (0-360)
    speed: Number, // km/h
    
    // Location source information
    source: {
      type: String,
      enum: ['gps', 'network', 'passive', 'manual', 'ip', 'unknown'],
      default: 'unknown'
    },
    
    // Location metadata
    address: {
      formatted: String, // Full formatted address
      street: String,
      city: String,
      state: String,
      country: String,
      countryCode: String,
      postalCode: String,
      district: String,
      region: String
    },
    
    // Timezone information
    timezone: {
      name: String, // e.g., "America/New_York"
      offset: Number, // offset from UTC in minutes
      abbreviation: String // e.g., "EST"
    },
    
    // Update timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    // Data validity
    isValid: {
      type: Boolean,
      default: true
    }
  },

  // Location history (last 50 locations)
  locationHistory: [{
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    
    accuracy: Number,
    source: String,
    
    // Address information (abbreviated for history)
    address: {
      city: String,
      state: String,
      country: String
    },
    
    // Duration at location
    arrivalTime: {
      type: Date,
      required: true
    },
    
    departureTime: Date,
    
    // Activity type (if detectable)
    activity: {
      type: String,
      enum: ['stationary', 'walking', 'running', 'cycling', 'driving', 'transit', 'unknown'],
      default: 'unknown'
    },
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Saved/Favorite locations
  savedLocations: [{
    name: {
      type: String,
      required: true
    },
    
    type: {
      type: String,
      enum: ['home', 'work', 'school', 'favorite', 'emergency', 'other'],
      default: 'other'
    },
    
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    
    address: {
      formatted: String,
      city: String,
      state: String,
      country: String
    },
    
    // Emergency contact information for this location
    emergencyContacts: [{
      name: String,
      phone: String,
      relationship: String
    }],
    
    // Notes and preferences
    notes: String,
    
    // Alert preferences for this location
    alertPreferences: {
      enableAlerts: {
        type: Boolean,
        default: true
      },
      alertRadius: {
        type: Number, // kilometers
        default: 10
      },
      alertTypes: [{
        type: String,
        enum: ['weather', 'earthquake', 'flood', 'fire', 'emergency', 'traffic']
      }]
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    },
    
    lastVisited: Date
  }],

  // Location-based preferences
  preferences: {
    // Privacy settings
    privacy: {
      shareLocation: {
        type: Boolean,
        default: false
      },
      
      trackLocationHistory: {
        type: Boolean,
        default: true
      },
      
      allowEmergencyAccess: {
        type: Boolean,
        default: true
      },
      
      retentionDays: {
        type: Number,
        default: 30,
        min: 1,
        max: 365
      }
    },
    
    // Alert preferences
    alerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      
      radius: {
        type: Number, // kilometers
        default: 25,
        min: 1,
        max: 100
      },
      
      types: [{
        type: String,
        enum: ['weather', 'earthquake', 'flood', 'fire', 'tsunami', 'landslide', 'emergency']
      }],
      
      severity: [{
        type: String,
        enum: ['info', 'minor', 'moderate', 'severe', 'extreme']
      }],
      
      // Notification methods
      notificationMethods: [{
        type: String,
        enum: ['push', 'email', 'sms', 'in-app']
      }],
      
      // Quiet hours
      quietHours: {
        enabled: Boolean,
        start: String, // "22:00"
        end: String,   // "07:00"
        timezone: String
      }
    },
    
    // Weather preferences
    weather: {
      units: {
        temperature: {
          type: String,
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius'
        },
        
        windSpeed: {
          type: String,
          enum: ['kmh', 'mph', 'ms'],
          default: 'kmh'
        },
        
        pressure: {
          type: String,
          enum: ['hpa', 'mmhg', 'inhg'],
          default: 'hpa'
        },
        
        distance: {
          type: String,
          enum: ['km', 'miles'],
          default: 'km'
        }
      },
      
      autoUpdate: {
        type: Boolean,
        default: true
      },
      
      updateInterval: {
        type: Number, // minutes
        default: 30,
        min: 5,
        max: 180
      }
    },
    
    // Map preferences
    map: {
      defaultZoom: {
        type: Number,
        default: 13,
        min: 1,
        max: 20
      },
      
      mapStyle: {
        type: String,
        enum: ['standard', 'satellite', 'hybrid', 'terrain'],
        default: 'standard'
      },
      
      showTraffic: {
        type: Boolean,
        default: false
      },
      
      showWeatherLayer: {
        type: Boolean,
        default: true
      },
      
      showAlertAreas: {
        type: Boolean,
        default: true
      }
    }
  },

  // Emergency information
  emergencyInfo: {
    // Emergency contacts
    contacts: [{
      name: {
        type: String,
        required: true
      },
      
      phone: {
        type: String,
        required: true
      },
      
      email: String,
      
      relationship: {
        type: String,
        enum: ['family', 'friend', 'colleague', 'neighbor', 'other']
      },
      
      priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
      },
      
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    
    // Medical information
    medical: {
      bloodType: String,
      allergies: [String],
      medications: [String],
      conditions: [String],
      emergencyInstructions: String
    },
    
    // Insurance information
    insurance: {
      provider: String,
      policyNumber: String,
      groupNumber: String
    }
  },

  // Geofencing rules
  geofences: [{
    name: {
      type: String,
      required: true
    },
    
    type: {
      type: String,
      enum: ['enter', 'exit', 'dwell'],
      required: true
    },
    
    // Geofence geometry
    geometry: {
      type: {
        type: String,
        enum: ['Circle', 'Polygon'],
        required: true
      },
      
      // For Circle: [center_lng, center_lat, radius_in_meters]
      // For Polygon: [[[lng, lat], [lng, lat], ...]]
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    
    // Trigger conditions
    triggers: {
      enabled: {
        type: Boolean,
        default: true
      },
      
      actions: [{
        type: String,
        enum: ['alert', 'notification', 'webhook', 'email']
      }],
      
      message: String,
      webhookUrl: String
    },
    
    // Activity tracking
    lastTriggered: Date,
    triggerCount: {
      type: Number,
      default: 0
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Device information
  device: {
    // Device identifiers
    deviceId: String,
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'other']
    },
    
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'other']
    },
    
    // App/browser information
    userAgent: String,
    appVersion: String,
    
    // Capabilities
    gpsEnabled: Boolean,
    networkLocationEnabled: Boolean,
    
    // Last seen
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },

  // System metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Data retention
  expiresAt: {
    type: Date
  },

  // Status flags
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  // Version control
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'userlocations'
});

/**
 * Indexes for optimal query performance
 */
// Geospatial index for location-based queries
userLocationSchema.index({ 'currentLocation.coordinates': '2dsphere' });
userLocationSchema.index({ 'savedLocations.coordinates': '2dsphere' });

// Compound indexes for common queries
userLocationSchema.index({ userId: 1, isActive: 1 });
userLocationSchema.index({ sessionId: 1, isActive: 1 });
userLocationSchema.index({ userId: 1, 'currentLocation.lastUpdated': -1 });
userLocationSchema.index({ expiresAt: 1 }); // For automatic cleanup

// Location history queries
userLocationSchema.index({ userId: 1, 'locationHistory.timestamp': -1 });

/**
 * Pre-save middleware
 */
userLocationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Limit location history to last 50 entries
  if (this.locationHistory && this.locationHistory.length > 50) {
    this.locationHistory = this.locationHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }
  
  // Set expiration based on retention preferences
  if (this.preferences && this.preferences.privacy && this.preferences.privacy.retentionDays) {
    const retentionMs = this.preferences.privacy.retentionDays * 24 * 60 * 60 * 1000;
    this.expiresAt = new Date(Date.now() + retentionMs);
  }
  
  // Ensure only one primary emergency contact
  if (this.emergencyInfo && this.emergencyInfo.contacts) {
    let primaryCount = 0;
    this.emergencyInfo.contacts.forEach(contact => {
      if (contact.isPrimary) {
        if (primaryCount > 0) {
          contact.isPrimary = false;
        }
        primaryCount++;
      }
    });
  }
  
  next();
});

/**
 * Instance Methods
 */

// Add new location to history
userLocationSchema.methods.addToHistory = function(coordinates, accuracy, source = 'unknown', address = {}) {
  const newEntry = {
    coordinates: {
      type: 'Point',
      coordinates: coordinates
    },
    accuracy,
    source,
    address: {
      city: address.city,
      state: address.state,
      country: address.country
    },
    arrivalTime: new Date(),
    timestamp: new Date()
  };
  
  // Set departure time for previous location
  if (this.locationHistory.length > 0) {
    const lastEntry = this.locationHistory[this.locationHistory.length - 1];
    if (!lastEntry.departureTime) {
      lastEntry.departureTime = new Date();
    }
  }
  
  this.locationHistory.push(newEntry);
  return this.save();
};

// Update current location
userLocationSchema.methods.updateCurrentLocation = function(coordinates, accuracy, source = 'gps', address = {}) {
  this.currentLocation = {
    coordinates: {
      type: 'Point',
      coordinates: coordinates
    },
    accuracy,
    source,
    address: address,
    lastUpdated: new Date(),
    isValid: true
  };
  
  // Add to history if significantly different from last location
  if (this.shouldAddToHistory(coordinates)) {
    this.addToHistory(coordinates, accuracy, source, address);
  }
  
  return this.save();
};

// Check if location should be added to history
userLocationSchema.methods.shouldAddToHistory = function(newCoordinates) {
  if (!this.locationHistory || this.locationHistory.length === 0) {
    return true;
  }
  
  const lastLocation = this.locationHistory[this.locationHistory.length - 1];
  const lastCoords = lastLocation.coordinates.coordinates;
  
  // Calculate distance using Haversine formula
  const distance = this.calculateDistance(
    lastCoords[1], lastCoords[0],
    newCoordinates[1], newCoordinates[0]
  );
  
  // Add to history if moved more than 100 meters
  return distance > 0.1;
};

// Calculate distance between two points (Haversine formula)
userLocationSchema.methods.calculateDistance = function(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = this.toRadians(lat2 - lat1);
  const dLng = this.toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Convert degrees to radians
userLocationSchema.methods.toRadians = function(degrees) {
  return degrees * (Math.PI/180);
};

// Add saved location
userLocationSchema.methods.addSavedLocation = function(name, type, coordinates, address = {}) {
  const savedLocation = {
    name,
    type,
    coordinates: {
      type: 'Point',
      coordinates: coordinates
    },
    address,
    createdAt: new Date()
  };
  
  this.savedLocations.push(savedLocation);
  return this.save();
};

// Get current coordinates
userLocationSchema.methods.getCurrentCoordinates = function() {
  if (this.currentLocation && this.currentLocation.coordinates) {
    return this.currentLocation.coordinates.coordinates;
  }
  return null;
};

// Check if user is near a saved location
userLocationSchema.methods.isNearSavedLocation = function(radiusKm = 1) {
  const currentCoords = this.getCurrentCoordinates();
  if (!currentCoords) return null;
  
  for (const saved of this.savedLocations) {
    const distance = this.calculateDistance(
      currentCoords[1], currentCoords[0],
      saved.coordinates.coordinates[1], saved.coordinates.coordinates[0]
    );
    
    if (distance <= radiusKm) {
      return {
        location: saved,
        distance: distance
      };
    }
  }
  
  return null;
};

/**
 * Static Methods
 */

// Find users near coordinates
userLocationSchema.statics.findUsersNearby = function(longitude, latitude, radiusKm = 10, maxAgeHours = 2) {
  const maxAge = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  
  return this.find({
    isActive: true,
    'currentLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000
      }
    },
    'currentLocation.lastUpdated': { $gte: maxAge },
    'preferences.privacy.shareLocation': true
  });
};

// Find users in emergency area
userLocationSchema.statics.findUsersInEmergencyArea = function(geometry) {
  return this.find({
    isActive: true,
    'currentLocation.coordinates': {
      $geoWithin: {
        $geometry: geometry
      }
    },
    'preferences.privacy.allowEmergencyAccess': true,
    'currentLocation.lastUpdated': { 
      $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) // Last 6 hours
    }
  });
};

// Clean up expired user locations
userLocationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { 
        isActive: false,
        updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days
      }
    ]
  });
};

// Get location statistics
userLocationSchema.statics.getLocationStats = function(timeRange = 24) {
  const startTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        isActive: true,
        'currentLocation.lastUpdated': { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [
              { $gte: ['$currentLocation.lastUpdated', new Date(Date.now() - 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        },
        locationSources: { $push: '$currentLocation.source' },
        averageAccuracy: { $avg: '$currentLocation.accuracy' }
      }
    }
  ]);
};

/**
 * Virtual fields
 */

// Virtual for current latitude
userLocationSchema.virtual('latitude').get(function() {
  return this.currentLocation?.coordinates?.coordinates[1];
});

// Virtual for current longitude
userLocationSchema.virtual('longitude').get(function() {
  return this.currentLocation?.coordinates?.coordinates[0];
});

// Virtual for location age
userLocationSchema.virtual('locationAge').get(function() {
  if (this.currentLocation?.lastUpdated) {
    const ageMs = Date.now() - this.currentLocation.lastUpdated.getTime();
    return Math.round(ageMs / (1000 * 60)); // Age in minutes
  }
  return null;
});

// Ensure virtual fields are serialized
userLocationSchema.set('toJSON', { virtuals: true });
userLocationSchema.set('toObject', { virtuals: true });

/**
 * Create and export the UserLocation model
 */
const UserLocation = mongoose.model('UserLocation', userLocationSchema);

export default UserLocation;
