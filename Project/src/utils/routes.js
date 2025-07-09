// Route definitions and navigation utilities
export const routes = {
  dashboard: '/dashboard',
  alerts: '/alerts',
  resources: '/resources',
  map: '/map',
  teams: '/teams',
  settings: '/settings',
};

// Navigation items with metadata
export const navigationItems = [
  {
    path: routes.dashboard,
    name: 'Dashboard',
    description: 'Main overview and system status',
    icon: 'Home',
    exact: true,
  },
  {
    path: routes.alerts,
    name: 'Alerts & Warnings',
    description: 'Emergency alerts and warning systems',
    icon: 'BellRing',
    badge: true, // Can show notification count
  },
  {
    path: routes.resources,
    name: 'Resources',
    description: 'Resource management and allocation',
    icon: 'Boxes',
  },
  {
    path: routes.map,
    name: 'Map View',
    description: 'Geographic view of incidents and resources',
    icon: 'Map',
  },
  {
    path: routes.teams,
    name: 'Emergency Teams',
    description: 'Team coordination and dispatch',
    icon: 'Users',
  },
  {
    path: routes.settings,
    name: 'Settings',
    description: 'System configuration and preferences',
    icon: 'Settings',
  },
];

// Utility functions for route handling
export const getRouteTitle = (pathname) => {
  const route = navigationItems.find(item => 
    item.exact ? item.path === pathname : pathname.startsWith(item.path)
  );
  return route ? route.name : 'DisasterShield';
};

export const getRouteDescription = (pathname) => {
  const route = navigationItems.find(item => 
    item.exact ? item.path === pathname : pathname.startsWith(item.path)
  );
  return route ? route.description : 'Emergency Management System';
};

// Check if route requires authentication (future use)
export const isProtectedRoute = (pathname) => {
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  return !publicRoutes.includes(pathname);
};

// Extract dynamic parameters from routes
export const getRouteParams = (pathname) => {
  const segments = pathname.split('/');
  const params = {};
  
  // Extract common patterns
  if (segments[1] === 'alerts' && segments[2]) {
    params.alertId = segments[2];
  }
  if (segments[1] === 'resources' && segments[2]) {
    params.resourceId = segments[2];
  }
  if (segments[1] === 'teams' && segments[2]) {
    params.teamId = segments[2];
  }
  if (segments[1] === 'map' && segments[2]) {
    params.location = segments[2];
  }
  if (segments[1] === 'settings' && segments[2]) {
    params.section = segments[2];
  }
  
  return params;
};

// Generate breadcrumb navigation
export const getBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: '/dashboard' }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Find route info
    const route = navigationItems.find(item => item.path === currentPath);
    if (route) {
      breadcrumbs.push({ name: route.name, path: currentPath });
    } else {
      // Handle dynamic segments
      const parentRoute = navigationItems.find(item => 
        currentPath.startsWith(item.path) && item.path !== '/dashboard'
      );
      if (parentRoute && index === segments.length - 1) {
        // This is a dynamic parameter
        breadcrumbs.push({ 
          name: segment.charAt(0).toUpperCase() + segment.slice(1), 
          path: currentPath 
        });
      }
    }
  });
  
  return breadcrumbs;
};

// Quick navigation shortcuts
export const quickActions = [
  {
    name: 'Report Incident',
    description: 'Report a new emergency incident',
    action: 'reportIncident',
    shortcut: 'Ctrl+R',
    priority: 'high',
  },
  {
    name: 'Emergency Response',
    description: 'Activate emergency response protocols',
    action: 'emergencyResponse',
    shortcut: 'Ctrl+E',
    priority: 'critical',
  },
  {
    name: 'View Map',
    description: 'Open interactive map view',
    action: 'viewMap',
    path: routes.map,
    shortcut: 'Ctrl+M',
  },
  {
    name: 'Check Alerts',
    description: 'View active alerts and warnings',
    action: 'checkAlerts',
    path: routes.alerts,
    shortcut: 'Ctrl+A',
  },
];

export default {
  routes,
  navigationItems,
  getRouteTitle,
  getRouteDescription,
  isProtectedRoute,
  getRouteParams,
  getBreadcrumbs,
  quickActions,
};
