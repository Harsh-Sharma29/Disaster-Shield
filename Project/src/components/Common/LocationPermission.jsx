import React from 'react';
import { MapPin, Shield, RefreshCw } from 'lucide-react';

function LocationPermission({ error, onRetry, isLoading }) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 md:p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <MapPin className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Location Access Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              {error || 'We need your location to provide weather information, emergency services, and AI predictions for your area.'}
            </p>
          </div>
          <div className="mt-4">
            <div className="flex">
              <button
                onClick={onRetry}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Location Access
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              <h4 className="font-medium">Why we need your location:</h4>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Show local weather conditions</li>
                <li>Provide nearby emergency services</li>
                <li>Generate AI disaster predictions for your area</li>
                <li>Display relevant map information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationPermission;
