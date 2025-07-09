import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';

// Layout Components
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import AuthDebug from './components/AuthDebug';

// Authentication Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import LandingDashboard from './pages/LandingDashboard';
import AlertsWarningsFixed from './pages/AlertsWarningsFixed';
import Resources from './pages/Resources';
import MapViewFixed from './pages/MapViewFixed';
import EmergencyTeams from './pages/EmergencyTeams';
import Settings from './pages/Settings';
import SmartContracts from './pages/SmartContracts';
import NotFound from './pages/NotFound';

// Enhanced Loading Component
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">DisasterShield</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Management System</p>
        </div>
        
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-gray-600 rounded-full mx-auto"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        
        {/* Loading Text */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Initializing System...</h2>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
        
        {/* Loading Steps */}
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Loading emergency protocols...</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Connecting to monitoring systems...</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              <span>Establishing secure connections...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LocationProvider>
          <ThemeProvider>
            <Router>
            <div className="App">
              {/* Global Toast Notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10B981',
                    },
                  },
                  error: {
                    style: {
                      background: '#EF4444',
                    },
                  },
                }}
              />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Main Application Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  
                  {/* Alerts Routes */}
                  <Route path="alerts" element={<AlertsWarningsFixed />} />
                  <Route path="alerts/:alertId" element={<AlertsWarningsFixed />} />
                  
                  {/* Resources Routes - Available to all authenticated users */}
                  <Route path="resources" element={<Resources />} />
                  <Route path="resources/:resourceId" element={<Resources />} />
                  
                  {/* Map View - Available to all authenticated users */}
                  <Route path="map" element={<MapViewFixed />} />
                  <Route path="map/:location" element={<MapViewFixed />} />
                  
                  {/* Emergency Teams - Available to all authenticated users */}
                  <Route path="teams" element={<EmergencyTeams />} />
                  <Route path="teams/:teamId" element={<EmergencyTeams />} />
                  
                  {/* Smart Contracts - Available to all authenticated users */}
                  <Route path="smart-contracts" element={<SmartContracts />} />
                  <Route path="smart-contracts/:contractId" element={<SmartContracts />} />
                  
                  {/* Settings - Available to all authenticated users */}
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/:section" element={<Settings />} />
                </Route>
                
                {/* Redirect old routes */}
                <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                <Route path="/main" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Auth Debug Component (Development only) */}
              <AuthDebug />
            </div>
            </Router>
          </ThemeProvider>
        </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
