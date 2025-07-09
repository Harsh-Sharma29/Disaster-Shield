import React from 'react';
import { MoreHorizontal, Truck, Users, Cpu, Battery } from 'lucide-react';
import { motion } from 'framer-motion';

function ResourceSummary() {
  const resourceData = [
    { 
      id: 1, 
      name: 'Emergency Vehicles', 
      total: 12, 
      active: 5,
      icon: <Truck size={18} className="text-blue-500" />,
      color: 'blue',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900/30',
      progressColor: 'bg-blue-500'
    },
    { 
      id: 2, 
      name: 'Response Teams', 
      total: 8, 
      active: 5,
      icon: <Users size={18} className="text-green-500" />,
      color: 'green',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/30',
      progressColor: 'bg-green-500'
    },
    { 
      id: 3, 
      name: 'Sensor Networks', 
      total: 4, 
      active: 4,
      icon: <Cpu size={18} className="text-purple-500" />,
      color: 'purple',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900/30',
      progressColor: 'bg-purple-500'
    },
    { 
      id: 4, 
      name: 'Backup Power', 
      total: 100, 
      active: 85,
      icon: <Battery size={18} className="text-yellow-500" />,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      darkBgColor: 'dark:bg-yellow-900/30',
      progressColor: 'bg-yellow-500',
      isPercentage: true
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <Users className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
          Resource Status
        </h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal size={18} className="md:w-5 md:h-5" />
        </button>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {resourceData.map((resource) => (
          <div key={resource.id} className="p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${resource.bgColor} ${resource.darkBgColor} rounded-full p-1.5 md:p-2`}>
                {resource.icon}
              </div>
              
              <div className="ml-2 md:ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-white truncate">{resource.name}</p>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {resource.active} / {resource.total} {resource.isPercentage ? '%' : ''}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(resource.active / resource.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-1.5 md:h-2 rounded-full ${resource.progressColor}`}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-2 md:p-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2 text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          Manage Resources
        </button>
      </div>
    </div>
  );
}

export default ResourceSummary;