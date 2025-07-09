import React from 'react';
import { Bell, MoreHorizontal } from 'lucide-react';

function AlertsCard({ alerts = [] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <Bell className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
          Recent Alerts
        </h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal size={18} className="md:w-5 md:h-5" />
        </button>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className="p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-1.5 md:p-2">
                  {alert.icon}
                </div>
                
                <div className="ml-2 md:ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-white truncate">{alert.title}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.location}</p>
                </div>
                
                <button className="ml-2 px-2 md:px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex-shrink-0">
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 md:p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No alerts at this time</p>
          </div>
        )}
      </div>
      
      <div className="p-2 md:p-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View All Alerts
        </button>
      </div>
    </div>
  );
}

export default AlertsCard;