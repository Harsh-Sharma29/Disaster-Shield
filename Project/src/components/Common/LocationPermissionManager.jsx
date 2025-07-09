import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationPermissionManager = ({ onPermissionGranted, onPermissionDenied }) => {
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if (!navigator.geolocation) {
        setPermissionStatus('not-supported');
        return;
      }

      // Check if permissions API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        // Listen for permission changes
        permission.onchange = () => {
          setPermissionStatus(permission.state);
          if (permission.state === 'granted') {
            onPermissionGranted?.();
          } else if (permission.state === 'denied') {
            onPermissionDenied?.();
          }
        };
      } else {
        // Fallback for browsers without permissions API
        setPermissionStatus('prompt');
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setPermissionStatus('unknown');
    }
  };

  const requestPermission = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      });

      setPermissionStatus('granted');
      onPermissionGranted?.();
    } catch (error) {
      setError(error.message);
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionStatus('denied');
        onPermissionDenied?.();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'not-supported':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <MapPin className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Location access granted';
      case 'denied':
        return 'Location access denied';
      case 'not-supported':
        return 'Geolocation not supported';
      case 'checking':
        return 'Checking location permissions...';
      default:
        return 'Location permission required';
    }
  };

  const showRequestButton = () => {
    return permissionStatus === 'prompt' || permissionStatus === 'unknown';
  };

  const showInstructions = () => {
    return permissionStatus === 'denied';
  };

  if (permissionStatus === 'granted') {
    return null; // Don't show anything if permission is already granted
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center mb-4">
          {getStatusIcon()}
          <h2 className="text-lg font-semibold ml-3 text-gray-900 dark:text-white">
            Location Access
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {getStatusMessage()}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {showRequestButton() && (
          <button
            onClick={requestPermission}
            disabled={isRequesting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            {isRequesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Enable Location Access
              </>
            )}
          </button>
        )}

        {showInstructions() && (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>To enable location access:</strong>
              </p>
              <ol className="text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                <li>Click the location icon in your browser's address bar</li>
                <li>Select "Allow" or "Always allow"</li>
                <li>Refresh the page</li>
              </ol>
            </div>
            
            <button
              onClick={checkPermissionStatus}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </button>
          </div>
        )}

        {permissionStatus === 'not-supported' && (
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              Your browser doesn't support geolocation. Please update your browser or use a different device.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LocationPermissionManager;
