/**
 * WeatherData Model - MongoDB/Mongoose Implementation
 * Stores weather information, forecasts, and AI predictions for disaster management
 */
import mongoose from 'mongoose';

/**
 * Weather Data Schema Definition
 * Comprehensive weather data storage including current conditions and forecasts
 */
const weatherDataSchema = new mongoose.Schema({
  // Location information
  location: {
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
    
    // Location details
    name: {
      type: String,
      required: true,
      index: true
    },
    
    country: {
      type: String,
      required: true,
      index: true
    },
    
    state: String,
    city: String,
    region: String,
    
    // Administrative area codes
    countryCode: String,
    timezone: String
  },

  // Current weather conditions
  current: {
    // Basic measurements
    temperature: {
      value: { type: Number, required: true }, // Celsius
      feelsLike: Number,
      min: Number, // Daily min (if available)
      max: Number  // Daily max (if available)
    },
    
    // Atmospheric conditions
    humidity: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    
    pressure: {
      value: Number, // hPa/mb
      seaLevel: Number,
      groundLevel: Number
    },
    
    // Wind information
    wind: {
      speed: { type: Number, required: true }, // km/h
      direction: Number, // degrees
      gust: Number // km/h
    },
    
    // Visibility and precipitation
    visibility: {
      type: Number, // kilometers
      default: 10
    },
    
    precipitation: {
      rain: {
        oneHour: Number, // mm
        threeHour: Number // mm
      },
      snow: {
        oneHour: Number, // mm
        threeHour: Number // mm
      },
      probability: Number // percentage
    },
    
    // Sky conditions
    cloudCover: {
      type: Number, // percentage
      min: 0,
      max: 100
    },
    
    // Weather description
    condition: {
      main: { type: String, required: true }, // Clear, Clouds, Rain, etc.
      description: { type: String, required: true }, // Detailed description
      icon: String // Weather icon code
    },
    
    // UV and solar data
    uvIndex: {
      type: Number,
      min: 0,
      max: 15
    },
    
    sunrise: Date,
    sunset: Date,
    
    // Data collection time
    observationTime: {
      type: Date,
      required: true,
      default: Date.now
    }
  },

  // Forecast data (next 5-7 days)
  forecast: [{
    date: {
      type: Date,
      required: true
    },
    
    temperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      morning: Number,
      day: Number,
      evening: Number,
      night: Number
    },
    
    condition: {
      main: String,
      description: String,
      icon: String
    },
    
    precipitation: {
      probability: Number, // percentage
      amount: Number, // mm
      type: {
        type: String,
        enum: ['rain', 'snow', 'sleet', 'none']
      }
    },
    
    wind: {
      speed: Number,
      direction: Number,
      gust: Number
    },
    
    humidity: Number,
    pressure: Number,
    cloudCover: Number,
    uvIndex: Number
  }],

  // Hourly forecast (next 48 hours)
  hourly: [{
    time: {
      type: Date,
      required: true
    },
    
    temperature: {
      type: Number,
      required: true
    },
    
    feelsLike: Number,
    humidity: Number,
    pressure: Number,
    
    wind: {
      speed: Number,
      direction: Number
    },
    
    precipitation: {
      probability: Number,
      amount: Number
    },
    
    condition: {
      main: String,
      description: String,
      icon: String
    },
    
    cloudCover: Number,
    visibility: Number
  }],

  // AI Weather Analysis and Predictions
  aiAnalysis: {
    // Risk assessments
    riskAssessment: {
      overall: {
        type: String,
        enum: ['very-low', 'low', 'moderate', 'high', 'extreme'],
        default: 'low'
      },
      
      // Specific disaster risks
      flood: {
        risk: {
          type: String,
          enum: ['very-low', 'low', 'moderate', 'high', 'extreme']
        },
        confidence: {
          type: Number,
          min: 0,
          max: 100
        },
        factors: [String] // Contributing factors
      },
      
      storm: {
        risk: String,
        confidence: Number,
        factors: [String]
      },
      
      heatwave: {
        risk: String,
        confidence: Number,
        factors: [String]
      },
      
      coldwave: {
        risk: String,
        confidence: Number,
        factors: [String]
      },
      
      drought: {
        risk: String,
        confidence: Number,
        factors: [String]
      },
      
      wildfire: {
        risk: String,
        confidence: Number,
        factors: [String]
      }
    },
    
    // Weather trends analysis
    trends: {
      temperature: {
        trend: {
          type: String,
          enum: ['rising', 'falling', 'stable']
        },
        rate: Number, // degrees per day
        duration: Number // days
      },
      
      precipitation: {
        trend: String,
        likelihood: Number, // percentage
        amount: Number // expected mm
      },
      
      pressure: {
        trend: String,
        rate: Number // hPa per hour
      }
    },
    
    // AI recommendations
    recommendations: [{
      type: {
        type: String,
        enum: ['preparation', 'warning', 'action', 'information']
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      message: String,
      timeframe: String, // e.g., "next 6 hours", "tomorrow"
      affectedGroups: [String] // e.g., ["outdoor workers", "elderly", "travelers"]
    }],
    
    // Model confidence and metadata
    confidence: {
      overall: {
        type: Number,
        min: 0,
        max: 100,
        default: 75
      },
      dataQuality: Number,
      modelVersion: String
    },
    
    // Analysis timestamp
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Data sources and metadata
  dataSources: [{
    provider: {
      type: String,
      required: true // e.g., "OpenWeatherMap", "WeatherAPI", "AccuWeather"
    },
    
    apiVersion: String,
    lastUpdated: Date,
    
    // Data quality indicators
    quality: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      issues: [String]
    },
    
    // Rate limiting and usage
    requestsUsed: {
      type: Number,
      default: 0
    },
    
    requestsLimit: Number
  }],

  // Weather alerts and warnings
  alerts: [{
    id: String,
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'extreme']
    },
    urgency: {
      type: String,
      enum: ['past', 'future', 'expected', 'immediate']
    },
    certainty: {
      type: String,
      enum: ['unknown', 'unlikely', 'possible', 'likely', 'observed']
    },
    areas: [String],
    start: Date,
    end: Date,
    source: String
  }],

  // Historical comparison
  historical: {
    averageTemperature: Number,
    averagePrecipitation: Number,
    normalHigh: Number,
    normalLow: Number,
    
    // Anomalies
    temperatureAnomaly: Number, // deviation from normal
    precipitationAnomaly: Number,
    
    // Records
    recordHigh: {
      value: Number,
      date: Date
    },
    recordLow: {
      value: Number,
      date: Date
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

  // Data validity and freshness
  expiresAt: {
    type: Date,
    required: true
  },

  // Request context
  requestedBy: String, // User or system that requested this data
  requestId: String, // Unique request identifier

  // Cache control
  cacheKey: {
    type: String
  },

  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'weatherdata'
});

/**
 * Indexes for optimal query performance
 */
// Geospatial index for location-based queries
weatherDataSchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes for common queries
weatherDataSchema.index({ 'location.name': 1, createdAt: -1 });
weatherDataSchema.index({ 'location.country': 1, 'location.city': 1, createdAt: -1 });
weatherDataSchema.index({ expiresAt: 1 }); // For automatic cleanup
weatherDataSchema.index({ cacheKey: 1 }, { unique: true, sparse: true });

// Risk assessment indexes
weatherDataSchema.index({ 'aiAnalysis.riskAssessment.overall': 1, createdAt: -1 });
weatherDataSchema.index({ 'aiAnalysis.riskAssessment.flood.risk': 1 });
weatherDataSchema.index({ 'aiAnalysis.riskAssessment.storm.risk': 1 });

/**
 * Pre-save middleware
 */
weatherDataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set expiration time if not set (default 6 hours for weather data)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
  }
  
  // Generate cache key if not present
  if (!this.cacheKey && this.location.coordinates.coordinates) {
    const [lng, lat] = this.location.coordinates.coordinates;
    this.cacheKey = `weather_${lat.toFixed(3)}_${lng.toFixed(3)}_${Date.now()}`;
  }
  
  next();
});

/**
 * Instance Methods
 */

// Check if weather data is still fresh
weatherDataSchema.methods.isFresh = function(maxAgeHours = 2) {
  const ageMs = Date.now() - this.current.observationTime.getTime();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return ageMs < maxAgeMs;
};

// Get current weather summary
weatherDataSchema.methods.getCurrentSummary = function() {
  return {
    temperature: this.current.temperature.value,
    condition: this.current.condition.description,
    humidity: this.current.humidity,
    windSpeed: this.current.wind.speed,
    location: this.location.name
  };
};

// Get disaster risk summary
weatherDataSchema.methods.getDisasterRisks = function() {
  if (!this.aiAnalysis || !this.aiAnalysis.riskAssessment) {
    return {};
  }
  
  const risks = this.aiAnalysis.riskAssessment;
  return {
    overall: risks.overall,
    flood: risks.flood?.risk || 'unknown',
    storm: risks.storm?.risk || 'unknown',
    wildfire: risks.wildfire?.risk || 'unknown',
    heatwave: risks.heatwave?.risk || 'unknown'
  };
};

// Get weather alerts summary
weatherDataSchema.methods.getActiveAlerts = function() {
  const now = new Date();
  return this.alerts.filter(alert => 
    alert.start <= now && alert.end > now
  ).sort((a, b) => {
    const severityOrder = { extreme: 4, severe: 3, moderate: 2, minor: 1 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });
};

/**
 * Static Methods
 */

// Find weather data near coordinates
weatherDataSchema.statics.findNearby = function(longitude, latitude, radiusKm = 50, maxAgeHours = 3) {
  const maxAge = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000
      }
    },
    current: { $exists: true },
    'current.observationTime': { $gte: maxAge },
    expiresAt: { $gt: new Date() }
  }).sort({ 'current.observationTime': -1 });
};

// Find weather data by location name
weatherDataSchema.statics.findByLocation = function(locationName, maxAgeHours = 3) {
  const maxAge = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  
  return this.find({
    $or: [
      { 'location.name': new RegExp(locationName, 'i') },
      { 'location.city': new RegExp(locationName, 'i') }
    ],
    'current.observationTime': { $gte: maxAge },
    expiresAt: { $gt: new Date() }
  }).sort({ 'current.observationTime': -1 });
};

// Get weather statistics for a region
weatherDataSchema.statics.getRegionStats = function(bounds, timeRange = 24) {
  const startTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        'location.coordinates': {
          $geoWithin: {
            $geometry: bounds
          }
        },
        'current.observationTime': { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        avgTemperature: { $avg: '$current.temperature.value' },
        maxTemperature: { $max: '$current.temperature.value' },
        minTemperature: { $min: '$current.temperature.value' },
        avgHumidity: { $avg: '$current.humidity' },
        avgWindSpeed: { $avg: '$current.wind.speed' },
        totalPrecipitation: { $sum: '$current.precipitation.rain.oneHour' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Clean up expired weather data
weatherDataSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Get high-risk areas
weatherDataSchema.statics.getHighRiskAreas = function(riskType = 'overall', riskLevel = 'high') {
  const matchField = riskType === 'overall' 
    ? 'aiAnalysis.riskAssessment.overall'
    : `aiAnalysis.riskAssessment.${riskType}.risk`;
    
  return this.find({
    [matchField]: { $in: [riskLevel, 'extreme'] },
    expiresAt: { $gt: new Date() }
  }).sort({ 'aiAnalysis.confidence.overall': -1 });
};

/**
 * Virtual fields
 */

// Virtual for weather data age in hours
weatherDataSchema.virtual('dataAge').get(function() {
  if (this.current && this.current.observationTime) {
    const ageMs = Date.now() - this.current.observationTime.getTime();
    return Math.round(ageMs / (1000 * 60 * 60 * 100)) / 10; // Hours with 1 decimal
  }
  return null;
});

// Virtual for coordinates array (for easier access)
weatherDataSchema.virtual('coordinates').get(function() {
  return this.location.coordinates.coordinates;
});

// Virtual for latitude
weatherDataSchema.virtual('latitude').get(function() {
  return this.location.coordinates.coordinates[1];
});

// Virtual for longitude
weatherDataSchema.virtual('longitude').get(function() {
  return this.location.coordinates.coordinates[0];
});

// Ensure virtual fields are serialized
weatherDataSchema.set('toJSON', { virtuals: true });
weatherDataSchema.set('toObject', { virtuals: true });

/**
 * Create and export the WeatherData model
 */
const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

export default WeatherData;
