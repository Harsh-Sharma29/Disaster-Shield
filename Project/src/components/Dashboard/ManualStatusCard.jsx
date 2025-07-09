import React, { useState } from 'react';
import { Phone, MapPin, Clock, AlertCircle, Users } from 'lucide-react';

function ManualStatusCard() {
  const [recentReports, setRecentReports] = useState([
    {
      id: 1,
      type: 'field_report',
      source: 'Fire Team Alpha',
      message: 'Fire containment at 60%. Northern perimeter secured.',
      location: 'North Forest Area',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'high'
    },
    {
      id: 2,
      type: 'citizen_report',
      source: 'Emergency Hotline',
      message: 'Multiple residents reporting power outages in downtown area.',
      location: 'Downtown District',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: 3,
      type: 'patrol_update',
      source: 'Police Unit 12',
      message: 'Road access clear to evacuation center. Traffic flowing normally.',
      location: 'Highway 101',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'low'
    }
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'field_report': return <Users className="h-4 w-4" />;
      case 'citizen_report': return <Phone className="h-4 w-4" />;
      case 'patrol_update': return <MapPin className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <Phone className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
          Recent Status Updates
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Manual Reports
        </span>
      </div>
      
      <div className="p-3 md:p-4">
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`p-1.5 rounded-full ${getPriorityColor(report.priority)}`}>
                  {getIcon(report.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {report.source}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(report.timestamp)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {report.message}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  {report.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Emergency Hotline: 911
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                For immediate assistance and incident reporting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualStatusCard;
