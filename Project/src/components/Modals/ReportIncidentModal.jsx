import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { showIncidentSubmittedToast } from '../Common/FlashMessage';

function ReportIncidentModal({ onClose }) {
  const { user } = useAuth();
  const { weather } = useLocation();
  
  const [incidentType, setIncidentType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [affectedPeople, setAffectedPeople] = useState('');
  const [landmarks, setLandmarks] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const reportData = {
      id: `RPT-${Date.now()}`,
      type: incidentType,
      location,
      description,
      severity,
      reporterName,
      reporterPhone,
      affectedPeople,
      landmarks,
      timestamp: new Date(),
      status: 'reported',
      source: 'manual_report'
    };
    console.log('Incident report submitted', reportData);
    
    // Show custom flash message with user and weather info
    showIncidentSubmittedToast(user, weather, location, incidentType);
    
    onClose();
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-lg md:max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-3 md:p-4 bg-amber-500 text-white">
          <h2 className="text-lg md:text-xl font-bold flex items-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Incident
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Type *
              </label>
              <select
                id="incidentType"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
              >
                <option value="">Select incident type</option>
                <option value="fire">Fire</option>
                <option value="flood">Flood</option>
                <option value="earthquake">Earthquake</option>
                <option value="storm">Storm</option>
                <option value="landslide">Landslide</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <div className="flex">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Address or coordinates"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={getLocation}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-r-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reporter Name *
              </label>
              <input
                id="reporterName"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="reporterPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Number *
              </label>
              <input
                id="reporterPhone"
                type="tel"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="affectedPeople" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated People Affected
              </label>
              <input
                id="affectedPeople"
                type="number"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                placeholder="Number of people"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="landmarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nearby Landmarks
              </label>
              <input
                id="landmarks"
                type="text"
                value={landmarks}
                onChange={(e) => setLandmarks(e.target.value)}
                placeholder="Schools, hospitals, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="severity"
                  value="low"
                  checked={severity === 'low'}
                  onChange={() => setSeverity('low')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Low</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="severity"
                  value="medium"
                  checked={severity === 'medium'}
                  onChange={() => setSeverity('medium')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="severity"
                  value="high"
                  checked={severity === 'high'}
                  onChange={() => setSeverity('high')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">High</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="severity"
                  value="critical"
                  checked={severity === 'critical'}
                  onChange={() => setSeverity('critical')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Critical</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors text-sm font-medium"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportIncidentModal;