import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle, User, MapPin, CloudSun } from 'lucide-react';

export const showIncidentSubmittedToast = (user, weather, location, incidentType) => {
  const userName = user?.name || user?.firstName || user?.email || 'Unknown User';
  const weatherInfo = weather ? `${weather.temperature}°C, ${weather.condition}` : 'Weather data unavailable';
  const locationInfo = location || 'Location not specified';
  
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-orange-500 flash-message`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                🚨 Incident Report Submitted
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>Reported by: {userName}</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Type: {incidentType}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Location: {locationInfo}</span>
                </div>
                <div className="flex items-center">
                  <CloudSun className="h-3 w-3 mr-1" />
                  <span>Weather: {weatherInfo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: 7000,
      position: 'top-right',
    }
  );
};

export const showResponseDeployedToast = (user, weather, location, responseType) => {
  const userName = user?.name || user?.firstName || user?.email || 'Unknown User';
  const weatherInfo = weather ? `${weather.temperature}°C, ${weather.condition}` : 'Weather data unavailable';
  const locationInfo = location || 'Location not specified';
  
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-blue-500 flash-message`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                🚑 Emergency Response Deployed
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>Deployed by: {userName}</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Type: {responseType}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Location: {locationInfo}</span>
                </div>
                <div className="flex items-center">
                  <CloudSun className="h-3 w-3 mr-1" />
                  <span>Weather: {weatherInfo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: 7000,
      position: 'top-right',
    }
  );
};

export default {
  showIncidentSubmittedToast,
  showResponseDeployedToast
};
