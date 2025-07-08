import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Search, 
  Plus, 
  Eye, 
  X, 
  MapPin, 
  Bell,
  Phone,
  MessageSquare,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const AlertsWarningsFixed = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ field: 'timestamp', direction: 'desc' });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Notification settings state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState({
    sms: true,
    whatsapp: true,
    riskLevels: ['high', 'critical']
  });

  // Create alert state
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    type: 'wildfire',
    severity: 'moderate',
    location: '',
    confidence: 85
  });

  useEffect(() => {
    // Load alerts data
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAlerts([
        {
          id: '1',
          type: 'wildfire',
          severity: 'moderate',
          title: 'Moderate Wildfire Risk Detected',
          description: 'Satellite imagery indicates increasing wildfire risk in northern forest area.',
          location: 'North Forest Area',
          coordinates: { lat: 37.7849, lng: -122.4094 },
          timestamp: '2025-01-08T10:30:00',
          status: 'active',
          confidence: 87
        },
        {
          id: '2',
          type: 'flood',
          severity: 'high',
          title: 'Flash Flood Warning',
          description: 'Heavy rainfall expected. River levels rising rapidly.',
          location: 'River Valley District',
          coordinates: { lat: 37.7649, lng: -122.4194 },
          timestamp: '2025-01-08T08:15:00',
          status: 'active',
          confidence: 92
        },
        {
          id: '3',
          type: 'storm',
          severity: 'critical',
          title: 'Severe Thunderstorm Warning',
          description: 'Severe thunderstorms with high winds and hail approaching.',
          location: 'Downtown Area',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          timestamp: '2025-01-07T22:45:00',
          status: 'active',
          confidence: 95
        }
      ]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle route parameter for specific alert
  useEffect(() => {
    if (alertId && alerts.length > 0) {
      const alert = alerts.find(a => a.id === alertId);
      setSelectedAlert(alert);
    }
  }, [alertId, alerts]);

  // Handle new alert creation
  const handleAlertCreated = (alertData) => {
    const alert = {
      id: Date.now().toString(),
      ...alertData,
      timestamp: new Date().toISOString(),
      status: 'active',
      coordinates: alertData.coordinates || { lat: 37.7749, lng: -122.4194 }
    };

    setAlerts(prev => [alert, ...prev]);
    
    // Send notifications if confidence >= 85%
    if (alert.confidence >= 85) {
      toast.success(`Alert created! SMS notifications sent (confidence: ${alert.confidence}%)`);
    } else {
      toast.success('Alert created successfully!');
    }
    
    setShowCreateModal(false);
    setNewAlert({
      title: '',
      description: '',
      type: 'wildfire',
      severity: 'moderate',
      location: '',
      confidence: 85
    });
  };

  // Handle view on map
  const handleViewOnMap = (alert) => {
    if (alert.coordinates) {
      navigate(`/dashboard/map?lat=${alert.coordinates.lat}&lng=${alert.coordinates.lng}&alert=${alert.id}`);
    } else {
      navigate(`/dashboard/map?location=${encodeURIComponent(alert.location)}&alert=${alert.id}`);
    }
  };

  // Save notification settings
  const handleSaveNotificationSettings = () => {
    if (!phoneNumber) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    localStorage.setItem('notificationPhone', phoneNumber);
    localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs));
    toast.success('Notification settings saved successfully!');
    setShowNotificationSettings(false);
  };

  // Test notification
  const handleTestNotification = (type) => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number first');
      return;
    }
    
    toast.success(`Test ${type} notification would be sent to ${phoneNumber}`);
  };

  // Get current location for alert
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setNewAlert(prev => ({
            ...prev,
            location,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          toast.success('Current location obtained');
        },
        (error) => {
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sort.field === 'timestamp') {
      return sort.direction === 'asc' 
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sort.field === 'severity') {
      const severityOrder = { low: 1, moderate: 2, high: 3, critical: 4 };
      return sort.direction === 'asc' 
        ? severityOrder[a.severity] - severityOrder[b.severity]
        : severityOrder[b.severity] - severityOrder[a.severity];
    }
    return 0;
  });

  const filteredAlerts = sortedAlerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active' && alert.status === 'active') return true;
    if (filter === 'resolved' && alert.status === 'resolved') return true;
    return alert.type === filter;
  });

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading alerts data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alerts & Warnings</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter */}
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="active">Active Alerts</option>
              <option value="resolved">Resolved Alerts</option>
              <option value="wildfire">Wildfire</option>
              <option value="flood">Flood</option>
              <option value="storm">Storm</option>
              <option value="earthquake">Earthquake</option>
            </select>
          </div>
          
          {/* Notification Settings Button */}
          <button 
            onClick={() => setShowNotificationSettings(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Bell size={16} className="mr-2" />
            Alert Settings
          </button>
          
          {/* Create Alert Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Create Alert
          </button>
        </div>
      </div>
      
      {/* Alerts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center">
                    Severity
                    {sort.field === 'severity' && (
                      sort.direction === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center">
                    Time
                    {sort.field === 'timestamp' && (
                      sort.direction === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAlerts.map(alert => (
                <motion.tr 
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(alert.status)}`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityClass(alert.severity)}`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{alert.description}</div>
                    {alert.confidence && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">Confidence: {alert.confidence}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{alert.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 inline-flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      Details
                    </button>
                    <button 
                      onClick={() => handleViewOnMap(alert)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 inline-flex items-center ml-2"
                    >
                      <MapPin size={16} className="mr-1" />
                      Map
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No alerts match your current filter
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedAlert(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Alert Details</h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityClass(selectedAlert.severity)}`}>
                      {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)} Severity
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(selectedAlert.status)}`}>
                      {selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    {selectedAlert.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedAlert.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-1">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedAlert.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-1">Alert Type</h4>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{selectedAlert.type}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button 
                    onClick={() => handleViewOnMap(selectedAlert)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowCreateModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create Emergency Alert</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alert Title *
                    </label>
                    <input
                      type="text"
                      value={newAlert.title}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Wildfire approaching residential area"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alert Type *
                    </label>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="wildfire">Wildfire</option>
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="storm">Storm</option>
                      <option value="hurricane">Hurricane</option>
                      <option value="tornado">Tornado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity Level *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['low', 'moderate', 'high', 'critical'].map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="severity"
                          value={level}
                          checked={newAlert.severity === level}
                          onChange={(e) => setNewAlert(prev => ({ ...prev, severity: e.target.value }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confidence Level: {newAlert.confidence}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={newAlert.confidence}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span className={newAlert.confidence >= 85 ? 'text-green-500' : 'text-gray-500'}>
                      {newAlert.confidence >= 85 ? 'Will send SMS alerts' : 'Below SMS threshold (85%)'}
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newAlert.description}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the emergency situation..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newAlert.location}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter address or location"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Use Current Location
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAlertCreated(newAlert)}
                    disabled={!newAlert.title || !newAlert.description || !newAlert.location}
                    className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Settings Modal */}
      <AnimatePresence>
        {showNotificationSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowNotificationSettings(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-2xl border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center">
                  <Bell className="w-6 h-6 text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Alert Settings</h2>
                </div>
                <button
                  onClick={() => setShowNotificationSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">Include country code (e.g., +1 for US)</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Notification Methods
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.sms}
                        onChange={(e) => setNotificationPrefs(prev => ({ ...prev, sms: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Phone className="w-5 h-5 text-green-500 ml-3 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">SMS Text Messages</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.whatsapp}
                        onChange={(e) => setNotificationPrefs(prev => ({ ...prev, whatsapp: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <MessageSquare className="w-5 h-5 text-green-500 ml-3 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">WhatsApp Messages</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Test Notifications
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTestNotification('SMS')}
                      disabled={!phoneNumber || !notificationPrefs.sms}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Test SMS
                    </button>
                    <button
                      onClick={() => handleTestNotification('WhatsApp')}
                      disabled={!phoneNumber || !notificationPrefs.whatsapp}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Test WhatsApp
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowNotificationSettings(false)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotificationSettings}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlertsWarningsFixed;
