import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, UserPlus, Phone, Mail, MapPin, Activity, AlertTriangle, Heart, Droplet, HardHat, Truck } from 'lucide-react';

const EmergencyTeams = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTeam, setActiveTeam] = useState(null);

  // Mock data - would normally come from backend API
  const teams = [
    {
      id: '1',
      name: 'Alpha Response Team',
      type: 'fire',
      members: 8,
      leader: 'John Doe',
      contact: '+1 (555) 123-4567',
      location: 'Central Station',
      status: 'active'
    },
    {
      id: '2',
      name: 'Bravo Medical Unit',
      type: 'medical',
      members: 6,
      leader: 'Jane Smith',
      contact: '+1 (555) 987-6543',
      location: 'East Valley Hospital',
      status: 'active'
    },
    {
      id: '3',
      name: 'Charlie Search & Rescue',
      type: 'search',
      members: 10,
      leader: 'Robert Johnson',
      contact: '+1 (555) 789-0123',
      location: 'North Base',
      status: 'standby'
    },
    {
      id: '4',
      name: 'Delta Water Rescue',
      type: 'water',
      members: 5,
      leader: 'Emily Williams',
      contact: '+1 (555) 456-7890',
      location: 'River Station',
      status: 'standby'
    },
    {
      id: '5',
      name: 'Echo Hazmat Response',
      type: 'hazmat',
      members: 7,
      leader: 'Michael Brown',
      contact: '+1 (555) 234-5678',
      location: 'West Industrial Zone',
      status: 'off-duty'
    },
    {
      id: '6',
      name: 'Foxtrot Support Unit',
      type: 'logistics',
      members: 4,
      leader: 'Sarah Davis',
      contact: '+1 (555) 345-6789',
      location: 'Headquarters',
      status: 'active'
    }
  ];

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          team.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || team.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'standby': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'off-duty': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'fire':
        return (
          <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20">
            <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
          </div>
        );
      case 'medical':
        return (
          <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
            <Heart size={20} className="text-green-500 dark:text-green-400" />
          </div>
        );
      case 'search':
        return (
          <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
            <Search size={20} className="text-blue-500 dark:text-blue-400" />
          </div>
        );
      case 'water':
        return (
          <div className="p-2 rounded-md bg-cyan-100 dark:bg-cyan-900/20">
            <Droplet size={20} className="text-cyan-500 dark:text-cyan-400" />
          </div>
        );
      case 'hazmat':
        return (
          <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/20">
            <HardHat size={20} className="text-orange-500 dark:text-orange-400" />
          </div>
        );
      case 'logistics':
        return (
          <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/20">
            <Truck size={20} className="text-purple-500 dark:text-purple-400" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-900/20">
            <Users size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
        );
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
          Emergency Teams
        </h1>
        <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md shadow-sm transition-colors">
          <UserPlus size={16} className="mr-2" />
          Add Team
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search teams or leaders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="fire">Fire</option>
                  <option value="medical">Medical</option>
                  <option value="search">Search & Rescue</option>
                  <option value="water">Water Rescue</option>
                  <option value="hazmat">Hazmat</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Activity size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="standby">Standby</option>
                  <option value="off-duty">Off-Duty</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No teams found matching your search criteria
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTeams.map(team => (
                  <li 
                    key={team.id} 
                    onClick={() => setActiveTeam(team)}
                    className={`p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      activeTeam?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {getTypeIcon(team.type)}
                      
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{team.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {team.type.charAt(0).toUpperCase() + team.type.slice(1)} • {team.members} members
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(team.status)}`}>
                            {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <MapPin size={14} className="mr-1" />
                          {team.location}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none">
          {activeTeam ? (
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{activeTeam.name}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(activeTeam.status)}`}>
                  {activeTeam.status.charAt(0).toUpperCase() + activeTeam.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Team Details</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{activeTeam.type.charAt(0).toUpperCase() + activeTeam.type.slice(1)}</dd>
                    </div>
                    <div className="col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Members</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{activeTeam.members}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{activeTeam.location}</dd>
                    </div>
                  </dl>
                </div>
              
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Team Leader</h3>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      {activeTeam.leader.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activeTeam.leader}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Phone size={14} className="mr-1" />
                        {activeTeam.contact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Current Mission</h3>
                {activeTeam.status === 'active' ? (
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">East Valley Response</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Deployed 2 hours ago</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full">
                        <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">75%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No active mission
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Deploy Team
                </button>
                <button className="flex-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  Edit Team
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Users size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Select a Team</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click on a team to view its details and manage its status
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmergencyTeams;