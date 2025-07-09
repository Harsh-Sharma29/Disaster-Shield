import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle,
  MapPin,
  Save,
  X,
  Plus,
  Calendar,
  Clock,
  Users,
  Gauge
} from 'lucide-react';
import { responsiveClasses, cn, useBreakpoint } from '../utils/responsive';
import notificationService from '../services/notificationService';
import locationService from '../services/locationService';
import toast from 'react-hot-toast';

const CreateAlertModal = ({ isOpen, onClose, onAlertCreated }) => {
  const [alertData, setAlertData] = useState({
    title: '',
    description: '',
    type: 'wildfire',
    severity: 'moderate',
    location: '',
    coordinates: null,
    radius: 5000,
    confidence: 85,
    expectedDuration: '2-4 hours',
    affectedPopulation: '',
    instructions: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const breakpoint = useBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const alertTypes = [
    { value: 'wildfire', label: 'Wildfire', color: 'orange' },
    { value: 'flood', label: 'Flood', color: 'blue' },
    { value: 'earthquake', label: 'Earthquake', color: 'red' },
    { value: 'storm', label: 'Storm', color: 'purple' },
    { value: 'hurricane', label: 'Hurricane', color: 'red' },
    { value: 'tornado', label: 'Tornado', color: 'gray' },
    { value: 'landslide', label: 'Landslide', color: 'brown' },
    { value: 'tsunami', label: 'Tsunami', color: 'blue' },
    { value: 'infrastructure', label: 'Infrastructure', color: 'yellow' },
    { value: 'hazmat', label: 'Hazardous Materials', color: 'green' },
    { value: 'other', label: 'Other Emergency', color: 'gray' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'green', description: 'Monitor situation' },
    { value: 'moderate', label: 'Moderate', color: 'yellow', description: 'Prepare for action' },
    { value: 'high', label: 'High', color: 'orange', description: 'Take immediate action' },
    { value: 'critical', label: 'Critical', color: 'red', description: 'Emergency response required' }
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setAlertData({
        title: '',
        description: '',
        type: 'wildfire',
        severity: 'moderate',
        location: '',
        coordinates: null,
        radius: 5000,
        confidence: 85,
        expectedDuration: '2-4 hours',
        affectedPopulation: '',
        instructions: ''
      });
      setUseCurrentLocation(false);
    }
  }, [isOpen]);

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await locationService.getCurrentPosition();
      const locationInfo = await locationService.reverseGeocode(position.lat, position.lng);
      
      setAlertData(prev => ({
        ...prev,
        coordinates: { lat: position.lat, lng: position.lng },
        location: locationInfo.displayName || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
      }));
      
      setUseCurrentLocation(true);
      toast.success('Current location obtained');
    } catch (error) {
      console.error('Failed to get location:', error);
      toast.error('Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSearch = async (locationQuery) => {
    if (!locationQuery.trim()) return;
    
    try {
      const result = await locationService.geocodeAddress(locationQuery);
      setAlertData(prev => ({
        ...prev,
        coordinates: { lat: result.lat, lng: result.lng },
        location: result.displayName
      }));
      toast.success('Location found');
    } catch (error) {
      console.error('Location search failed:', error);
      toast.error('Location not found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!alertData.title || !alertData.description || !alertData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Create the alert
      const newAlert = {
        id: Date.now().toString(),
        ...alertData,
        timestamp: new Date().toISOString(),
        status: 'active',
        createdBy: 'current_user', // Replace with actual user ID
        createdAt: new Date().toISOString()
      };

      // Send notifications if confidence is high enough
      if (alertData.confidence >= 85) {
        await notificationService.checkAndSendRiskAlerts({
          location: alertData.coordinates,
          riskLevel: alertData.severity,
          confidence: alertData.confidence,
          type: alertData.type,
          description: alertData.description
        });
        
        // Send push notification
        await notificationService.sendPushNotification(
          `🚨 ${alertData.severity.toUpperCase()} ${alertData.type.toUpperCase()} ALERT`,
          alertData.description,
          { alertId: newAlert.id }
        );
      }

      // Callback to parent component
      if (onAlertCreated) {
        onAlertCreated(newAlert);
      }

      toast.success('Alert created successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to create alert:', error);
      toast.error('Failed to create alert');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            'relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700',
            isMobile ? 'max-w-sm max-h-[90vh] overflow-y-auto' : 'max-w-3xl max-h-[90vh] overflow-y-auto'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className={cn(responsiveClasses.textXl, 'font-semibold text-gray-800 dark:text-white')}>
                Create Emergency Alert
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                  Alert Title *
                </label>
                <input
                  type="text"
                  value={alertData.title}
                  onChange={(e) => setAlertData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Wildfire approaching residential area"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                  Alert Type *
                </label>
                <select
                  value={alertData.type}
                  onChange={(e) => setAlertData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {alertTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Severity and Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                  Severity Level *
                </label>
                <div className="space-y-2">
                  {severityLevels.map(level => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="radio"
                        name="severity"
                        value={level.value}
                        checked={alertData.severity === level.value}
                        onChange={(e) => setAlertData(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className={`w-3 h-3 rounded-full ml-3 mr-2 bg-${level.color}-500`} />
                      <span className="text-gray-700 dark:text-gray-300">
                        {level.label} - {level.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                  Confidence Level: {alertData.confidence}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={alertData.confidence}
                  onChange={(e) => setAlertData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>50%</span>
                  <span className={alertData.confidence >= 85 ? 'text-green-500' : 'text-gray-500'}>
                    {alertData.confidence >= 85 ? 'Will send SMS/WhatsApp alerts' : 'Below alert threshold (85%)'}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                Description *
              </label>
              <textarea
                value={alertData.description}
                onChange={(e) => setAlertData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the emergency situation..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                Location *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={alertData.location}
                    onChange={(e) => setAlertData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter address or location"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleLocationSearch(alertData.location)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {locationLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  Use Current Location
                </button>
                
                {useCurrentLocation && alertData.coordinates && (
                  <p className={cn(responsiveClasses.textXs, 'text-green-600 dark:text-green-400')}>
                    ✓ Using current location: {alertData.coordinates.lat.toFixed(6)}, {alertData.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                  Affected Radius (meters)
                </label>
                <select
                  value={alertData.radius}
                  onChange={(e) => setAlertData(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1000}>1 km radius</option>
                  <option value={2000}>2 km radius</option>
                  <option value={5000}>5 km radius</option>
                  <option value={10000}>10 km radius</option>
                  <option value={20000}>20 km radius</option>
                </select>
              </div>
              
              <div>
                <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                  Expected Duration
                </label>
                <select
                  value={alertData.expectedDuration}
                  onChange={(e) => setAlertData(prev => ({ ...prev, expectedDuration: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="2-4 hours">2-4 hours</option>
                  <option value="4-8 hours">4-8 hours</option>
                  <option value="8-24 hours">8-24 hours</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className={cn(responsiveClasses.textSm, 'font-medium text-gray-700 dark:text-gray-300 mb-2 block')}>
                Safety Instructions
              </label>
              <textarea
                value={alertData.instructions}
                onChange={(e) => setAlertData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Instructions for affected population (e.g., evacuate immediately, avoid the area, stay indoors...)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Alert Preview */}
            {alertData.confidence >= 85 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Alert Preview (Will be sent to nearby users)
                </h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-line">
                  {notificationService.formatAlertMessage({
                    type: alertData.type,
                    riskLevel: alertData.severity,
                    location: alertData.location || 'Selected location',
                    description: alertData.description || 'Alert description',
                    confidence: alertData.confidence
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !alertData.title || !alertData.description || !alertData.location}
                className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Alert
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateAlertModal;
