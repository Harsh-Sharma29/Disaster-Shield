import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { showResponseDeployedToast } from '../Common/FlashMessage';

function EmergencyResponseModal({ onClose }) {
  const { user } = useAuth();
  const { weather } = useLocation();
  
  const [responseType, setResponseType] = useState('');
  const [location, setLocation] = useState('');
  const [resources, setResources] = useState('');
  const [priority, setPriority] = useState('high');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual emergency response deployment
    console.log('Emergency response deployed', { responseType, location, resources, priority, notes });
    
    // Show custom flash message with user and weather info
    showResponseDeployedToast(user, weather, location, responseType);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-lg md:max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-3 md:p-4 bg-blue-600 text-white">
          <h2 className="text-lg md:text-xl font-bold flex items-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Emergency Response Deployment
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3 md:p-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">This will deploy emergency response teams and resources. Please confirm all details carefully.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="responseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Response Type *
              </label>
              <select
                id="responseType"
                value={responseType}
                onChange={(e) => setResponseType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
              >
                <option value="">Select response type</option>
                <option value="medical">Medical</option>
                <option value="fire">Fire</option>
                <option value="search">Search & Rescue</option>
                <option value="evacuation">Evacuation</option>
                <option value="flood">Flood Response</option>
                <option value="police">Law Enforcement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deployment Location *
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Address or coordinates"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="resources" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resources Required *
            </label>
            <input
              id="resources"
              type="text"
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="e.g., '2 ambulances, 1 fire truck, 10 personnel'"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="medium"
                  checked={priority === 'medium'}
                  onChange={() => setPriority('medium')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">High</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="critical"
                  checked={priority === 'critical'}
                  onChange={() => setPriority('critical')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Critical</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            ></textarea>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Deploy Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmergencyResponseModal;
