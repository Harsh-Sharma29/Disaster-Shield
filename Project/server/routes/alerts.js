/**
 * Alert Routes
 * Handles alert management, creation, and distribution
 */
import express from 'express';
import Alert from '../models/Alert.js';
import { authenticate, authorize } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * @route   GET /api/alerts
 * @desc    Get all alerts
 * @access  Public (filtered based on user permissions)
 */
router.get('/', async (req, res) => {
  try {
    const { 
      status = 'active',
      severity,
      type,
      limit = 50,
      page = 1,
      latitude,
      longitude,
      radius = 50
    } = req.query;

    let query = { status };

    // Filter by severity
    if (severity) {
      query.severity = severity;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Location-based filtering
    if (latitude && longitude) {
      const alerts = await Alert.findNearby(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(radius)
      );
      return res.json({
        success: true,
        data: alerts,
        total: alerts.length,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    }

    // Get alerts with pagination
    const skip = (page - 1) * limit;
    const alerts = await Alert.find(query)
      .sort({ priorityScore: -1, effectiveTime: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedIncidents');

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/alerts/:id
 * @desc    Get alert by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('relatedIncidents');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/alerts
 * @desc    Create new alert
 * @access  Private (coordinators and above)
 */
router.post('/', 
  authenticate, 
  authorize('send_alerts'),
  async (req, res) => {
    try {
      const {
        type,
        severity,
        urgency,
        certainty,
        title,
        description,
        instructions,
        affectedAreas,
        location,
        effectiveTime,
        expirationTime,
        category
      } = req.body;

      // Validate required fields
      if (!type || !severity || !title || !description || !location) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: type, severity, title, description, location'
        });
      }

      // Create new alert
      const alert = new Alert({
        type,
        severity,
        urgency: urgency || 'expected',
        certainty: certainty || 'possible',
        title,
        description,
        instructions,
        affectedAreas: affectedAreas || [],
        location,
        effectiveTime: effectiveTime || new Date(),
        expirationTime: expirationTime || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
        category: category || 'other',
        source: {
          organization: req.user.profile?.organization || 'Unknown Organization',
          contact: {
            name: req.user.fullName,
            email: req.user.email,
            phone: req.user.phone
          }
        },
        createdBy: req.user.username || req.user.email
      });

      await alert.save();

      // Send notifications to affected users
      try {
        const notificationResults = await notificationService.sendAlertNotifications(alert);
        console.log('Notification results:', notificationResults);
      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
        // Don't fail the alert creation if notifications fail
      }

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert
      });
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/alerts/:id
 * @desc    Update alert
 * @access  Private (coordinators and above)
 */
router.put('/:id',
  authenticate,
  authorize('manage_alerts'),
  async (req, res) => {
    try {
      const alert = await Alert.findById(req.params.id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Update alert fields
      const allowedUpdates = [
        'title', 'description', 'instructions', 'severity',
        'urgency', 'certainty', 'expirationTime', 'status'
      ];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          alert[field] = req.body[field];
        }
      });

      alert.lastUpdatedBy = req.user.username || req.user.email;
      await alert.save();

      res.json({
        success: true,
        message: 'Alert updated successfully',
        data: alert
      });
    } catch (error) {
      console.error('Update alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update alert',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Cancel/delete alert
 * @access  Private (coordinators and above)
 */
router.delete('/:id',
  authenticate,
  authorize('manage_alerts'),
  async (req, res) => {
    try {
      const alert = await Alert.findById(req.params.id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Update status to cancelled instead of deleting
      alert.status = 'cancel';
      alert.lastUpdatedBy = req.user.username || req.user.email;
      await alert.save();

      res.json({
        success: true,
        message: 'Alert cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel alert',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/alerts/:id/acknowledge
 * @desc    Acknowledge alert
 * @access  Private
 */
router.post('/:id/acknowledge',
  authenticate,
  async (req, res) => {
    try {
      const alert = await Alert.findById(req.params.id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Add acknowledgment
      alert.notifications.acknowledged += 1;
      await alert.save();

      res.json({
        success: true,
        message: 'Alert acknowledged'
      });
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/alerts/search
 * @desc    Search alerts
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type, severity, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const alerts = await Alert.searchAlerts(q, {
      type,
      severity,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Search alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search alerts',
      error: error.message
    });
  }
);

/**
 * @route   POST /api/alerts/test-notification
 * @desc    Test notification system
 * @access  Private (admin only)
 */
router.post('/test-notification',
  authenticate,
  authorize('system_admin'),
  async (req, res) => {
    try {
      const testResults = await notificationService.testNotification();
      
      res.json({
        success: true,
        message: 'Notification system test completed',
        data: testResults
      });
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test notification system',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/alerts/:id/send-targeted
 * @desc    Send targeted notification for existing alert
 * @access  Private (coordinators and above)
 */
router.post('/:id/send-targeted',
  authenticate,
  authorize('send_alerts'),
  async (req, res) => {
    try {
      const { userIds, roles } = req.body;
      
      const alert = await Alert.findById(req.params.id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      let results;
      
      if (userIds && userIds.length > 0) {
        // Send to specific users
        results = await notificationService.sendTargetedNotification(userIds, alert);
      } else if (roles && roles.length > 0) {
        // Send to users with specific roles
        results = { sms: { sent: 0, failed: 0, errors: [] }, email: { sent: 0, failed: 0, errors: [] } };
        
        for (const role of roles) {
          const roleResults = await notificationService.sendRoleBasedNotification(role, alert);
          results.sms.sent += roleResults.sms.sent;
          results.sms.failed += roleResults.sms.failed;
          results.sms.errors.push(...roleResults.sms.errors);
          results.email.sent += roleResults.email.sent;
          results.email.failed += roleResults.email.failed;
          results.email.errors.push(...roleResults.email.errors);
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either userIds or roles must be provided'
        });
      }

      res.json({
        success: true,
        message: 'Targeted notifications sent',
        data: results
      });
    } catch (error) {
      console.error('Send targeted notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send targeted notifications',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/alerts/:id/resend-notifications
 * @desc    Resend notifications for an existing alert
 * @access  Private (coordinators and above)
 */
router.post('/:id/resend-notifications',
  authenticate,
  authorize('send_alerts'),
  async (req, res) => {
    try {
      const { options } = req.body;
      
      const alert = await Alert.findById(req.params.id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      const results = await notificationService.sendAlertNotifications(alert, options || {});
      
      res.json({
        success: true,
        message: 'Notifications resent successfully',
        data: results
      });
    } catch (error) {
      console.error('Resend notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend notifications',
        error: error.message
      });
    }
  }
);

export { router as alertRoutes };
export default router;
