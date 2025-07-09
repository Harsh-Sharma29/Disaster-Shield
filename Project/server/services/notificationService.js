/**
 * Notification Service
 * Handles sending SMS alerts via Twilio and email notifications
 */
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Alert from '../models/Alert.js';
import UserLocation from '../models/UserLocation.js';

class NotificationService {
  constructor() {
    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.warn('Twilio credentials not configured. SMS notifications will be disabled.');
    }

    // Initialize email transporter
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.warn('Email credentials not configured. Email notifications will be disabled.');
    }
  }

  /**
   * Send alert notifications to affected users
   * @param {Object} alert - Alert object from database
   * @param {Object} options - Additional options
   */
  async sendAlertNotifications(alert, options = {}) {
    try {
      const results = {
        sms: { sent: 0, failed: 0, errors: [] },
        email: { sent: 0, failed: 0, errors: [] }
      };

      // Get users to notify based on alert location and severity
      const usersToNotify = await this.getUsersToNotify(alert, options);

      console.log(`Sending alert "${alert.title}" to ${usersToNotify.length} users`);

      // Send notifications to each user
      for (const user of usersToNotify) {
        try {
          // Send SMS if user has SMS enabled and phone number
          if (this.shouldSendSMS(user, alert)) {
            const smsResult = await this.sendSMS(user, alert);
            if (smsResult.success) {
              results.sms.sent++;
            } else {
              results.sms.failed++;
              results.sms.errors.push({
                user: user.username,
                error: smsResult.error
              });
            }
          }

          // Send email if user has email enabled
          if (this.shouldSendEmail(user, alert)) {
            const emailResult = await this.sendEmail(user, alert);
            if (emailResult.success) {
              results.email.sent++;
            } else {
              results.email.failed++;
              results.email.errors.push({
                user: user.username,
                error: emailResult.error
              });
            }
          }
        } catch (error) {
          console.error(`Error sending notifications to user ${user.username}:`, error);
        }
      }

      // Update alert notification counts
      await this.updateAlertNotificationCounts(alert._id, results);

      return results;
    } catch (error) {
      console.error('Error sending alert notifications:', error);
      throw error;
    }
  }

  /**
   * Get users to notify based on alert parameters
   * @param {Object} alert - Alert object
   * @param {Object} options - Additional filtering options
   */
  async getUsersToNotify(alert, options = {}) {
    try {
      let query = {
        status: 'active',
        'auth.emailVerified': true
      };

      // Filter by roles if specified
      if (options.roles && options.roles.length > 0) {
        query.role = { $in: options.roles };
      }

      // Location-based filtering
      if (alert.location && alert.location.coordinates) {
        const [longitude, latitude] = alert.location.coordinates;
        const radius = options.radius || this.getAlertRadius(alert.severity);

        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }

      // Get users matching the criteria
      let users = await User.find(query);

      // If no users found with location, get users by role in affected areas
      if (users.length === 0 && alert.affectedAreas && alert.affectedAreas.length > 0) {
        const areaNames = alert.affectedAreas.map(area => area.name);
        users = await User.find({
          ...query,
          $or: [
            { 'location.address.city': { $in: areaNames } },
            { 'location.address.state': { $in: areaNames } },
            { 'profile.organization': { $in: areaNames } }
          ]
        });
      }

      // For high-severity alerts, also include all coordinators and responders
      if (alert.severity === 'severe' || alert.severity === 'extreme') {
        const emergencyPersonnel = await User.find({
          role: { $in: ['coordinator', 'responder', 'admin'] },
          status: 'active',
          'auth.emailVerified': true
        });
        
        // Merge with existing users, avoiding duplicates
        const existingIds = new Set(users.map(u => u._id.toString()));
        const newUsers = emergencyPersonnel.filter(u => !existingIds.has(u._id.toString()));
        users = [...users, ...newUsers];
      }

      return users;
    } catch (error) {
      console.error('Error getting users to notify:', error);
      return [];
    }
  }

  /**
   * Check if SMS should be sent to user
   * @param {Object} user - User object
   * @param {Object} alert - Alert object
   */
  shouldSendSMS(user, alert) {
    if (!this.twilioClient || !user.phone) return false;

    const smsPrefs = user.preferences.notifications.sms;
    
    // SMS disabled entirely
    if (!smsPrefs.enabled) return false;

    // Check if SMS is enabled for this type of alert
    if (alert.severity === 'extreme' || alert.severity === 'severe') {
      return smsPrefs.emergencies; // Emergency alerts
    }

    return smsPrefs.alerts; // Regular alerts
  }

  /**
   * Check if email should be sent to user
   * @param {Object} user - User object
   * @param {Object} alert - Alert object
   */
  shouldSendEmail(user, alert) {
    if (!this.emailTransporter) return false;

    const emailPrefs = user.preferences.notifications.email;
    
    // Email disabled entirely
    if (!emailPrefs.enabled) return false;

    return emailPrefs.alerts; // Send for all alerts if enabled
  }

  /**
   * Send SMS notification
   * @param {Object} user - User object
   * @param {Object} alert - Alert object
   */
  async sendSMS(user, alert) {
    try {
      if (!this.twilioClient) {
        return { success: false, error: 'Twilio not configured' };
      }

      const message = this.formatSMSMessage(alert);
      
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: user.phone
      });

      console.log(`SMS sent to ${user.phone}: ${result.sid}`);
      
      return { 
        success: true, 
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error(`Failed to send SMS to ${user.phone}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send email notification
   * @param {Object} user - User object
   * @param {Object} alert - Alert object
   */
  async sendEmail(user, alert) {
    try {
      if (!this.emailTransporter) {
        return { success: false, error: 'Email not configured' };
      }

      const { subject, html, text } = this.formatEmailMessage(alert, user);
      
      const result = await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: subject,
        text: text,
        html: html
      });

      console.log(`Email sent to ${user.email}: ${result.messageId}`);
      
      return { 
        success: true, 
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to send email'
      };
    }
  }

  /**
   * Format SMS message for alert
   * @param {Object} alert - Alert object
   */
  formatSMSMessage(alert) {
    const urgencyText = alert.urgency === 'immediate' ? 'URGENT' : '';
    const severityText = alert.severity.toUpperCase();
    const locationText = alert.getLocationString();
    
    let message = `${urgencyText} ${severityText} ALERT: ${alert.title}`;
    
    if (locationText !== 'Location not specified') {
      message += `\nLocation: ${locationText}`;
    }
    
    message += `\n${alert.description}`;
    
    if (alert.instructions) {
      message += `\nInstructions: ${alert.instructions}`;
    }
    
    message += `\nTime: ${alert.effectiveTime.toLocaleString()}`;
    
    // Keep SMS under 160 characters for single message
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }
    
    return message;
  }

  /**
   * Format email message for alert
   * @param {Object} alert - Alert object
   * @param {Object} user - User object
   */
  formatEmailMessage(alert, user) {
    const subject = `${alert.severity.toUpperCase()} Alert: ${alert.title}`;
    
    const text = `
Dear ${user.firstName},

${alert.severity.toUpperCase()} ALERT: ${alert.title}

Description: ${alert.description}

${alert.instructions ? `Instructions: ${alert.instructions}` : ''}

Location: ${alert.getLocationString()}
Effective Time: ${alert.effectiveTime.toLocaleString()}
Expiration: ${alert.expirationTime.toLocaleString()}
Severity: ${alert.severity.toUpperCase()}
Type: ${alert.type}

Source: ${alert.source.organization}
${alert.source.contact ? `Contact: ${alert.source.contact.name} (${alert.source.contact.email})` : ''}

Please take appropriate action as necessary.

DisasterShield Alert System
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert-header { background-color: ${this.getAlertColor(alert.severity)}; color: white; padding: 15px; border-radius: 5px; }
        .alert-content { padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px; }
        .alert-info { margin: 10px 0; }
        .instructions { background-color: #f0f8ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="alert-header">
        <h2>${alert.severity.toUpperCase()} ALERT</h2>
        <h3>${alert.title}</h3>
    </div>
    
    <div class="alert-content">
        <p><strong>Dear ${user.firstName},</strong></p>
        
        <div class="alert-info">
            <p><strong>Description:</strong> ${alert.description}</p>
        </div>
        
        ${alert.instructions ? `
        <div class="instructions">
            <strong>Instructions:</strong> ${alert.instructions}
        </div>
        ` : ''}
        
        <div class="alert-info">
            <p><strong>Location:</strong> ${alert.getLocationString()}</p>
            <p><strong>Effective Time:</strong> ${alert.effectiveTime.toLocaleString()}</p>
            <p><strong>Expiration:</strong> ${alert.expirationTime.toLocaleString()}</p>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Type:</strong> ${alert.type}</p>
        </div>
        
        <div class="alert-info">
            <p><strong>Source:</strong> ${alert.source.organization}</p>
            ${alert.source.contact ? `<p><strong>Contact:</strong> ${alert.source.contact.name} (${alert.source.contact.email})</p>` : ''}
        </div>
        
        <p><strong>Please take appropriate action as necessary.</strong></p>
    </div>
    
    <div class="footer">
        <p>DisasterShield Alert System</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  /**
   * Get alert color based on severity
   * @param {String} severity - Alert severity
   */
  getAlertColor(severity) {
    const colors = {
      'info': '#007bff',
      'minor': '#28a745',
      'moderate': '#ffc107',
      'severe': '#fd7e14',
      'extreme': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  }

  /**
   * Get notification radius based on alert severity
   * @param {String} severity - Alert severity
   */
  getAlertRadius(severity) {
    const radius = {
      'info': 10,      // 10 km
      'minor': 20,     // 20 km
      'moderate': 50,  // 50 km
      'severe': 100,   // 100 km
      'extreme': 200   // 200 km
    };
    return radius[severity] || 50;
  }

  /**
   * Update alert notification counts
   * @param {String} alertId - Alert ID
   * @param {Object} results - Notification results
   */
  async updateAlertNotificationCounts(alertId, results) {
    try {
      const totalSent = results.sms.sent + results.email.sent;
      const totalDelivered = results.sms.sent + results.email.sent; // Assume delivered if sent

      await Alert.findByIdAndUpdate(alertId, {
        $inc: {
          'notifications.sent': totalSent,
          'notifications.delivered': totalDelivered
        },
        $addToSet: {
          'notifications.channels': {
            $each: [
              ...(results.sms.sent > 0 ? ['sms'] : []),
              ...(results.email.sent > 0 ? ['email'] : [])
            ]
          }
        }
      });
    } catch (error) {
      console.error('Error updating alert notification counts:', error);
    }
  }

  /**
   * Send targeted notification to specific users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} alert - Alert object
   */
  async sendTargetedNotification(userIds, alert) {
    try {
      const users = await User.find({
        _id: { $in: userIds },
        status: 'active'
      });

      const results = {
        sms: { sent: 0, failed: 0, errors: [] },
        email: { sent: 0, failed: 0, errors: [] }
      };

      for (const user of users) {
        // Send SMS if user has SMS enabled and phone number
        if (this.shouldSendSMS(user, alert)) {
          const smsResult = await this.sendSMS(user, alert);
          if (smsResult.success) {
            results.sms.sent++;
          } else {
            results.sms.failed++;
            results.sms.errors.push({
              user: user.username,
              error: smsResult.error
            });
          }
        }

        // Send email if user has email enabled
        if (this.shouldSendEmail(user, alert)) {
          const emailResult = await this.sendEmail(user, alert);
          if (emailResult.success) {
            results.email.sent++;
          } else {
            results.email.failed++;
            results.email.errors.push({
              user: user.username,
              error: emailResult.error
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending targeted notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification to all users with specific role
   * @param {String} role - User role
   * @param {Object} alert - Alert object
   */
  async sendRoleBasedNotification(role, alert) {
    try {
      const users = await User.find({
        role: role,
        status: 'active',
        'auth.emailVerified': true
      });

      return await this.sendTargetedNotification(users.map(u => u._id), alert);
    } catch (error) {
      console.error('Error sending role-based notifications:', error);
      throw error;
    }
  }

  /**
   * Test notification system
   */
  async testNotification() {
    try {
      const results = {
        sms: { available: !!this.twilioClient },
        email: { available: !!this.emailTransporter }
      };

      if (this.twilioClient) {
        try {
          // Test Twilio connection
          await this.twilioClient.api.accounts.get();
          results.sms.status = 'connected';
        } catch (error) {
          results.sms.status = 'error';
          results.sms.error = error.message;
        }
      }

      if (this.emailTransporter) {
        try {
          // Test email connection
          await this.emailTransporter.verify();
          results.email.status = 'connected';
        } catch (error) {
          results.email.status = 'error';
          results.email.error = error.message;
        }
      }

      return results;
    } catch (error) {
      console.error('Error testing notification system:', error);
      return { error: error.message };
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
