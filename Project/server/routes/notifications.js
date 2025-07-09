import express from 'express';
import twilio from 'twilio';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient;
try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
} catch (error) {
  console.warn('Twilio not configured:', error.message);
}

// In-memory storage for demo (use database in production)
const subscribers = new Map();
const userLocations = new Map();

// Subscribe user for notifications
router.post('/subscribe', authenticate, [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, preferences } = req.body;
    const userId = req.user.id;

    // Store subscription
    subscribers.set(phoneNumber, {
      userId,
      phoneNumber,
      preferences,
      subscribedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Successfully subscribed for notifications'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      error: 'Failed to subscribe for notifications'
    });
  }
});

// Unsubscribe user
router.post('/unsubscribe', authenticate, [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    
    subscribers.delete(phoneNumber);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from notifications'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe'
    });
  }
});

// Update user preferences
router.put('/update-preferences', authenticate, [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, preferences } = req.body;
    
    const existing = subscribers.get(phoneNumber);
    if (!existing) {
      return res.status(404).json({
        error: 'Subscription not found'
      });
    }

    // Update preferences
    subscribers.set(phoneNumber, {
      ...existing,
      preferences,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Failed to update preferences'
    });
  }
});

// Get users in affected area
router.post('/users-in-area', authenticate, [
  body('location').isObject().withMessage('Location must be an object'),
  body('radius').isNumeric().withMessage('Radius must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, radius } = req.body;
    
    // Get all subscribers and filter by location
    const usersInArea = [];
    
    for (const [phoneNumber, subscription] of subscribers) {
      const userLocation = userLocations.get(subscription.userId);
      
      if (userLocation && isWithinRadius(userLocation, location, radius)) {
        usersInArea.push({
          phoneNumber,
          preferences: subscription.preferences,
          userId: subscription.userId
        });
      }
    }

    res.json(usersInArea);
  } catch (error) {
    console.error('Get users in area error:', error);
    res.status(500).json({
      error: 'Failed to get users in area'
    });
  }
});

// Send SMS notification
router.post('/send-sms', authenticate, [
  body('to').isMobilePhone().withMessage('Valid phone number required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!twilioClient) {
      return res.status(503).json({
        error: 'SMS service not configured'
      });
    }

    const { to, message } = req.body;

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    res.json({
      success: true,
      messageId: result.sid,
      status: result.status
    });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({
      error: 'Failed to send SMS',
      details: error.message
    });
  }
});

// Send WhatsApp notification
router.post('/send-whatsapp', authenticate, [
  body('to').isMobilePhone().withMessage('Valid phone number required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!twilioClient) {
      return res.status(503).json({
        error: 'WhatsApp service not configured'
      });
    }

    const { to, message } = req.body;

    // Format phone number for WhatsApp
    const whatsappTo = `whatsapp:${to}`;
    const whatsappFrom = `whatsapp:${twilioPhoneNumber}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo
    });

    res.json({
      success: true,
      messageId: result.sid,
      status: result.status
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({
      error: 'Failed to send WhatsApp message',
      details: error.message
    });
  }
});

// Update user location (for area-based alerts)
router.post('/update-location', authenticate, [
  body('location').isObject().withMessage('Location must be an object'),
  body('location.lat').isFloat().withMessage('Valid latitude required'),
  body('location.lng').isFloat().withMessage('Valid longitude required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location } = req.body;
    const userId = req.user.id;

    userLocations.set(userId, {
      ...location,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Failed to update location'
    });
  }
});

// Send bulk alert to area
router.post('/send-area-alert', authenticate, [
  body('alertData').isObject().withMessage('Alert data must be an object'),
  body('alertData.location').isObject().withMessage('Location must be an object'),
  body('alertData.radius').isNumeric().withMessage('Radius must be a number'),
  body('alertData.message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { alertData } = req.body;
    const { location, radius, message, confidence = 100 } = alertData;

    // Only send if confidence is above threshold (85%)
    if (confidence < 85) {
      return res.json({
        success: true,
        message: 'Alert confidence below threshold, not sent',
        sentCount: 0
      });
    }

    // Get users in affected area
    const usersInArea = [];
    for (const [phoneNumber, subscription] of subscribers) {
      const userLocation = userLocations.get(subscription.userId);
      
      if (userLocation && isWithinRadius(userLocation, location, radius)) {
        usersInArea.push({
          phoneNumber,
          preferences: subscription.preferences
        });
      }
    }

    // Send notifications
    const results = {
      sms: { sent: 0, failed: 0 },
      whatsapp: { sent: 0, failed: 0 }
    };

    for (const user of usersInArea) {
      if (user.preferences.sms) {
        try {
          await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: user.phoneNumber
          });
          results.sms.sent++;
        } catch (error) {
          console.error('SMS failed for', user.phoneNumber, error);
          results.sms.failed++;
        }
      }

      if (user.preferences.whatsapp) {
        try {
          await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${user.phoneNumber}`
          });
          results.whatsapp.sent++;
        } catch (error) {
          console.error('WhatsApp failed for', user.phoneNumber, error);
          results.whatsapp.failed++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Area alert sent',
      results,
      totalUsers: usersInArea.length
    });
  } catch (error) {
    console.error('Send area alert error:', error);
    res.status(500).json({
      error: 'Failed to send area alert'
    });
  }
});

// Helper function to calculate distance and check if within radius
function isWithinRadius(userLocation, centerLocation, radius) {
  const distance = calculateDistance(
    userLocation.lat, userLocation.lng,
    centerLocation.lat, centerLocation.lng
  );
  return distance * 1000 <= radius; // Convert km to meters
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

export default router;
