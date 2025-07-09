import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Phone, 
  MessageSquare, 
  Settings, 
  MapPin, 
  AlertTriangle,
  Check,
  X,
  Send,
  Volume2,
  VolumeX,
  Smartphone,
  MessageCircle
} from 'lucide-react';
import NotificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const NotificationManager = () => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferences, setPreferences] = useState({
    sms: true,
    whatsapp: true,
    browserNotifications: true,
    riskLevels: ['high', 'critical'],
    radius: 5000,
    soundEnabled: true
  });
  const [testingNotification, setTestingNotification] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Check current notification permission
    checkNotificationPermission();
    getCurrentLocation();
    
    // Load saved preferences
    const savedPhone = localStorage.getItem('notificationPhone');
    const savedPrefs = localStorage.getItem('notificationPreferences');
    
    if (savedPhone) {
      setPhoneNumber(savedPhone);
      setIsSubscribed(true);
    }
    
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await NotificationService.requestNotificationPermission();
      setIsEnabled(permission);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  };

  const handleSubscribe = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      const success = await NotificationService.subscribeUser(phoneNumber, {
        ...preferences,
        location: currentLocation
      });
      
      if (success) {
        setIsSubscribed(true);
        localStorage.setItem('notificationPhone', phoneNumber);
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        toast.success('Successfully subscribed for emergency notifications!');
      }
    } catch (error) {
      toast.error('Failed to subscribe for notifications');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const success = await NotificationService.unsubscribeUser(phoneNumber);
      if (success) {
        setIsSubscribed(false);
        localStorage.removeItem('notificationPhone');
        localStorage.removeItem('notificationPreferences');
        toast.success('Unsubscribed from notifications');
      }
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      const success = await NotificationService.updateUserPreferences(phoneNumber, preferences);
      if (success) {
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      }
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handleTestNotification = async (type) => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number first');
      return;
    }

    setTestingNotification(true);
    try {
      await NotificationService.testNotification(phoneNumber, type);
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setTestingNotification(false);
    }
  };

  const handleRiskLevelChange = (level) => {
    const newLevels = preferences.riskLevels.includes(level)
      ? preferences.riskLevels.filter(l => l !== level)
      : [...preferences.riskLevels, level];
    
    setPreferences(prev => ({ ...prev, riskLevels: newLevels }));
  };

  const sendTestBrowserNotification = () => {
    NotificationService.sendPushNotification(
      '🚨 Test Emergency Alert',
      'This is a test notification to verify your browser notification settings.',
      { test: true }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Emergency Notifications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure SMS, WhatsApp, and browser alerts
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isSubscribed 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {isSubscribed ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Setup */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            Phone Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isSubscribed}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSubscribe}
                disabled={isSubscribed || !phoneNumber}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Subscribe
              </button>
              
              <button
                onClick={handleUnsubscribe}
                disabled={!isSubscribed}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Unsubscribe
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            Notification Types
          </h3>
          
          <div className="space-y-4">
            {/* SMS Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">SMS Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.sms}
                  onChange={(e) => setPreferences(prev => ({ ...prev, sms: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* WhatsApp Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">WhatsApp</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.whatsapp}
                  onChange={(e) => setPreferences(prev => ({ ...prev, whatsapp: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Browser Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Browser Alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.browserNotifications && isEnabled}
                  onChange={(e) => {
                    if (e.target.checked) {
                      checkNotificationPermission();
                    }
                    setPreferences(prev => ({ ...prev, browserNotifications: e.target.checked }));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          Alert Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Alert Risk Levels
            </label>
            <div className="space-y-2">
              {[
                { level: 'low', color: 'green', label: 'Low Risk' },
                { level: 'medium', color: 'yellow', label: 'Medium Risk' },
                { level: 'high', color: 'orange', label: 'High Risk' },
                { level: 'critical', color: 'red', label: 'Critical Risk' }
              ].map(({ level, color, label }) => (
                <label key={level} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.riskLevels.includes(level)}
                    onChange={() => handleRiskLevelChange(level)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Alert Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Alert Radius: {(preferences.radius / 1000).toFixed(1)} km
            </label>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={preferences.radius}
              onChange={(e) => setPreferences(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        {/* Update Preferences Button */}
        <div className="mt-6">
          <button
            onClick={handleUpdatePreferences}
            disabled={!isSubscribed}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Update Preferences
          </button>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2 text-purple-600" />
          Test Notifications
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleTestNotification('sms')}
            disabled={testingNotification || !isSubscribed || !preferences.sms}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Test SMS
          </button>
          
          <button
            onClick={() => handleTestNotification('whatsapp')}
            disabled={testingNotification || !isSubscribed || !preferences.whatsapp}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Test WhatsApp
          </button>
          
          <button
            onClick={sendTestBrowserNotification}
            disabled={!isEnabled || !preferences.browserNotifications}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Bell className="w-4 h-4 mr-2" />
            Test Browser
          </button>
        </div>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-red-600" />
            Current Location
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
            <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
            <p className="mt-2 text-xs">This location is used for area-based emergency alerts.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationManager;
