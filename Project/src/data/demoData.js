// Demo data 
// This simulates real-time data that would come from APIs

export const mockAlerts = [
  {
    id: '1',
    type: 'wildfire',
    severity: 'high',
    title: 'Wildfire Reported in North Forest',
    description: 'Local ranger reports active fire spreading rapidly due to dry conditions and high winds. Reported by Forest Station 7.',
    location: 'North Forest Area, Sector 7',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'active',
    affectedArea: '450 hectares',
    responseTeams: ['Fire Team Alpha', 'Air Support Unit 1']
  },
  {
    id: '2',
    type: 'flood',
    severity: 'moderate',
    title: 'River Level Rising',
    description: 'Heavy rainfall causing river levels to rise above warning threshold.',
    location: 'Central Valley River Basin',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'monitoring',
    affectedArea: '1200 households',
    responseTeams: ['Rescue Team Beta']
  },
  {
    id: '3',
    type: 'storm',
    severity: 'critical',
    title: 'Severe Thunderstorm Warning',
    description: 'Severe thunderstorms with 100+ km/h winds and large hail approaching the city.',
    location: 'Metropolitan Area',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'active',
    affectedArea: '2.5 million residents',
    responseTeams: ['Emergency Coordination Center', 'Medical Response Unit']
  }
];

export const mockTeams = [
  {
    id: '1',
    name: 'Fire Team Alpha',
    type: 'firefighting',
    status: 'deployed',
    location: 'North Forest Area',
    members: 12,
    equipment: ['Fire Truck', 'Water Tanker', 'Helicopter'],
    missionStart: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    estimatedReturn: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours from now
  },
  {
    id: '2',
    name: 'Rescue Team Beta',
    type: 'water_rescue',
    status: 'standby',
    location: 'Emergency Station 2',
    members: 8,
    equipment: ['Rescue Boat', 'Life Vests', 'Medical Kit'],
    readinessLevel: 'high'
  },
  {
    id: '3',
    name: 'Medical Response Unit',
    type: 'medical',
    status: 'available',
    location: 'Central Hospital',
    members: 15,
    equipment: ['Ambulances (3)', 'Mobile Medical Unit', 'Emergency Supplies'],
    specialties: ['Trauma Care', 'Emergency Surgery', 'Disaster Medicine']
  },
  {
    id: '4',
    name: 'Search & Rescue Delta',
    type: 'search_rescue',
    status: 'training',
    location: 'Training Facility',
    members: 10,
    equipment: ['All-Terrain Vehicles', 'Rescue Dogs', 'Communication Equipment'],
    currentActivity: 'Urban Search Training Exercise'
  }
];

export const mockResources = [
  {
    id: '1',
    name: 'Emergency Vehicles',
    category: 'transportation',
    available: 8,
    total: 12,
    status: 'adequate',
    items: [
      { name: 'Fire Trucks', available: 3, total: 5 },
      { name: 'Ambulances', available: 4, total: 6 },
      { name: 'Rescue Vehicles', available: 1, total: 1 }
    ]
  },
  {
    id: '2',
    name: 'Medical Supplies',
    category: 'medical',
    available: 85,
    total: 100,
    status: 'good',
    unit: '%',
    items: [
      { name: 'Bandages & Gauze', available: 920, total: 1000 },
      { name: 'IV Fluids', available: 45, total: 60 },
      { name: 'Emergency Medications', available: 78, total: 80 }
    ]
  },
  {
    id: '3',
    name: 'Communication Equipment',
    category: 'technology',
    available: 45,
    total: 50,
    status: 'excellent',
    items: [
      { name: 'Radio Units', available: 28, total: 30 },
      { name: 'Satellite Phones', available: 12, total: 15 },
      { name: 'Emergency Beacons', available: 5, total: 5 }
    ]
  },
  {
    id: '4',
    name: 'Shelter Supplies',
    category: 'shelter',
    available: 2400,
    total: 3000,
    status: 'adequate',
    items: [
      { name: 'Emergency Tents', available: 150, total: 200 },
      { name: 'Sleeping Bags', available: 800, total: 1000 },
      { name: 'Emergency Food (days)', available: 1450, total: 1800 }
    ]
  }
];

export const mockWeatherData = {
  current: {
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    windDirection: 'SW',
    pressure: 1013,
    visibility: 8,
    uvIndex: 6,
    lastUpdated: new Date()
  },
  forecast: [
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      high: 28,
      low: 18,
      condition: 'Thunderstorms',
      precipitationChance: 85,
      windSpeed: 25
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      high: 22,
      low: 15,
      condition: 'Heavy Rain',
      precipitationChance: 95,
      windSpeed: 18
    },
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      high: 25,
      low: 17,
      condition: 'Partly Cloudy',
      precipitationChance: 20,
      windSpeed: 10
    }
  ],
  alerts: [
    {
      id: 'weather-1',
      type: 'severe_thunderstorm',
      severity: 'high',
      title: 'Severe Thunderstorm Watch',
      description: 'Conditions favorable for severe thunderstorms with damaging winds and large hail.',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
      areas: ['Metropolitan Area', 'Northern Suburbs']
    }
  ]
};

export const mockStatistics = {
  totalAlerts: 127,
  activeAlerts: 3,
  resolvedToday: 8,
  averageResponseTime: 15, // minutes
  teamsDeployed: 2,
  teamsAvailable: 8,
  resourceUtilization: 68, // percentage
  systemUptime: 99.2, // percentage
  lastSystemUpdate: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  monthlyTrends: {
    alerts: [45, 52, 38, 61, 47, 39, 44, 58, 42, 36, 49, 53],
    responses: [42, 49, 35, 58, 44, 37, 41, 55, 39, 34, 46, 50],
    averageResponseTime: [18, 16, 19, 14, 17, 20, 15, 13, 16, 18, 15, 14]
  }
};

export const mockIncidents = [
  {
    id: 'INC-2025-001',
    title: 'Forest Fire Suppression Operation',
    type: 'wildfire',
    severity: 'high',
    status: 'active',
    location: 'North Forest Area',
    reportedBy: 'Fire Watchtower 7',
    assignedTeams: ['Fire Team Alpha', 'Air Support Unit 1'],
    startTime: new Date(Date.now() - 45 * 60 * 1000),
    estimatedContainment: new Date(Date.now() + 4 * 60 * 60 * 1000),
    affectedArea: '450 hectares',
    evacuationStatus: 'voluntary',
    evacuatedPersons: 85,
    injuries: 0,
    fatalities: 0,
    estimatedDamage: '$2.5M',
    progressUpdates: [
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        update: 'Fire containment at 35%. Firebreaks established on eastern perimeter.',
        author: 'Incident Commander Johnson'
      },
      {
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        update: 'Initial response teams deployed. Helicopter water drops commenced.',
        author: 'Emergency Dispatch'
      }
    ]
  }
];

// Utility functions to simulate real-time updates
export const getRandomUpdate = () => {
  const updates = [
    'Communication systems tested successfully',
    'Weather data refreshed from meteorological service',
    'Team status updated via radio check-in',
    'Resource inventory manually updated',
    'Emergency protocol database synchronized',
    'Team deployment status confirmed'
  ];
  return updates[Math.floor(Math.random() * updates.length)];
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'text-red-600 bg-red-100',
    resolved: 'text-green-600 bg-green-100',
    monitoring: 'text-yellow-600 bg-yellow-100',
    standby: 'text-blue-600 bg-blue-100',
    deployed: 'text-orange-600 bg-orange-100',
    available: 'text-green-600 bg-green-100',
    training: 'text-purple-600 bg-purple-100'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

export const getSeverityIcon = (severity) => {
  const icons = {
    low: '🟢',
    moderate: '🟡',
    high: '🟠',
    critical: '🔴'
  };
  return icons[severity] || '⚪';
};

// Export all data as a single object for easy importing
export default {
  alerts: mockAlerts,
  teams: mockTeams,
  resources: mockResources,
  weather: mockWeatherData,
  statistics: mockStatistics,
  incidents: mockIncidents,
  utils: {
    getRandomUpdate,
    getStatusColor,
    getSeverityIcon
  }
};
