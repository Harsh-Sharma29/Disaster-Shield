import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Boxes, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Eye,
  Edit,
  Truck,
  Package,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Wrench,
  MapPin,
  TrendingUp,
  BarChart3,
  Download
} from 'lucide-react';
import { responsiveClasses, cn, useBreakpoint } from '../utils/responsive';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedResource, setSelectedResource] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const breakpoint = useBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);
  const isTablet = breakpoint === 'md';

  // Mock data - would normally come from backend API
  const resources = [
    {
      id: '1',
      name: 'Fire Trucks',
      type: 'vehicle',
      location: 'Central Station',
      status: 'available',
      quantity: 6,
      lastUpdated: '2025-04-20T08:15:00'
    },
    {
      id: '2',
      name: 'Ambulances',
      type: 'vehicle',
      location: 'Medical Center',
      status: 'deployed',
      quantity: 8,
      lastUpdated: '2025-04-20T10:30:00'
    },
    {
      id: '3',
      name: 'Rescue Boats',
      type: 'vehicle',
      location: 'River Station',
      status: 'available',
      quantity: 4,
      lastUpdated: '2025-04-19T14:45:00'
    },
    {
      id: '4',
      name: 'Medical Supplies',
      type: 'equipment',
      location: 'Central Warehouse',
      status: 'available',
      quantity: 200,
      lastUpdated: '2025-04-18T16:20:00'
    },
    {
      id: '5',
      name: 'Emergency Shelters',
      type: 'facility',
      location: 'Multiple Locations',
      status: 'available',
      quantity: 10,
      lastUpdated: '2025-04-17T09:10:00'
    },
    {
      id: '6',
      name: 'Water Pumps',
      type: 'equipment',
      location: 'East Depot',
      status: 'maintenance',
      quantity: 12,
      lastUpdated: '2025-04-16T11:35:00'
    },
    {
      id: '7',
      name: 'Search & Rescue Teams',
      type: 'personnel',
      location: 'HQ',
      status: 'deployed',
      quantity: 5,
      lastUpdated: '2025-04-20T07:25:00'
    },
    {
      id: '8',
      name: 'Emergency Food Supply',
      type: 'supplies',
      location: 'Main Warehouse',
      status: 'available',
      quantity: 1000,
      lastUpdated: '2025-04-15T15:50:00'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'deployed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Resources Management
        </h1>
        
        <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md shadow-sm transition-colors">
          <Plus size={16} className="mr-2" />
          Add Resource
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="vehicle">Vehicles</option>
            <option value="equipment">Equipment</option>
            <option value="facility">Facilities</option>
            <option value="personnel">Personnel</option>
            <option value="supplies">Supplies</option>
          </select>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="deployed">Deployed</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResources.map(resource => (
                <motion.tr 
                  key={resource.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {resource.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {resource.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(resource.status)}`}>
                      {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {resource.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(resource.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-dark dark:text-primary-light hover:text-primary mr-3">
                      Edit
                    </button>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      Allocate
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredResources.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No resources found matching your filters
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Resource Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Vehicles</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">12/15</span>
              </div>
              <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Equipment</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">258/300</span>
              </div>
              <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Personnel</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">25/45</span>
              </div>
              <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Supplies</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">1000/1500</span>
              </div>
              <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Deployment Status</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">65%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">25%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Deployed</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">10%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Maintenance</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Allocations</h2>
          <ul className="space-y-3">
            <li className="flex items-center text-sm">
              <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium text-gray-800 dark:text-white mr-1">2 Ambulances → </span>
              <span className="text-gray-500 dark:text-gray-400">East Valley Region (30 min ago)</span>
            </li>
            <li className="flex items-center text-sm">
              <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium text-gray-800 dark:text-white mr-1">Search & Rescue Team → </span>
              <span className="text-gray-500 dark:text-gray-400">North Forest Area (2h ago)</span>
            </li>
            <li className="flex items-center text-sm">
              <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium text-gray-800 dark:text-white mr-1">Emergency Supplies → </span>
              <span className="text-gray-500 dark:text-gray-400">Shelter #2 (3h ago)</span>
            </li>
            <li className="flex items-center text-sm">
              <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium text-gray-800 dark:text-white mr-1">Water Pumps → </span>
              <span className="text-gray-500 dark:text-gray-400">Maintenance (8h ago)</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Resources;