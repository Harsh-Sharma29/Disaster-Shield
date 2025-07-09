import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Wifi, MapPin, Clock, LogIn, UserPlus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIPredictionCard from '../components/Dashboard/AIPredictionCard';
import WeatherCard from '../components/Dashboard/WeatherCard';
import MapCard from '../components/Dashboard/MapCard';
import AlertsCard from '../components/Dashboard/AlertsCard';
import locationService from '../services/locationService';
import toast from 'react-hot-toast';

const LandingDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize the dashboard
    const initializeDashboard = async () => {
      try {
        // Get user location
        const location = await locationService.getLocationWithFallback();
        setUserLocation(location);

        // Get nearby risk zones
        const nearbyRisks = locationService.getNearbyRiskZones(location);
        setRiskZones(nearbyRisks);

        // Mock alerts data
        setAlerts([
          {
            id: '1',
            title: 'Moderate Wildfire Risk Detected',
            time: '30 min ago',
            location: 'North Forest Area',
            icon: <AlertTriangle size={18} className="text-orange-500" />
          },
          {
            id: '2',
            title: 'Emergency Response Team Deployed',
            time: '2 hours ago',
            location: 'East Valley Region',
            icon: <Users size={18} className="text-blue-500" />
          },
          {
            id: '3',
            title: 'Communication System Status Update',
            time: '5 hours ago',
            location: 'All Regions',
            icon: <Wifi size={18} className="text-green-500" />
          }
        ]);

        // Show authentication prompt after 10 seconds
        setTimeout(() => {
          setShowAuthPrompt(true);
          toast('Sign in to access advanced features and real-time alerts', {
            icon: '🔐',
            duration: 6000
          });
        }, 10000);

      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();

    // Start location tracking
    const trackingId = locationService.startLocationTracking((location, error) => {
      if (location) {
        setUserLocation(location);
        
        // Check for risk zone alerts
        const nearbyRisks = locationService.getNearbyRiskZones(location);
        setRiskZones(nearbyRisks);
      }
    });

    // Listen for risk zone alerts
    const handleRiskZoneAlert = (event) => {
      const { zone, location } = event.detail;
      toast.error(`⚠️ You've entered a ${zone.level} risk ${zone.type} zone: ${zone.description}`, {
        duration: 8000
      });
    };

    window.addEventListener('riskZoneAlert', handleRiskZoneAlert);

    return () => {
      locationService.stopLocationTracking();
      window.removeEventListener('riskZoneAlert', handleRiskZoneAlert);
    };
  }, []);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading DisasterShield</h2>
          <p className="text-gray-600 dark:text-gray-400">Initializing emergency management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">DisasterShield</h1>
              </div>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Demo Mode</span>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignIn}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Top stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} className="text-red-500 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{alerts.length}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Alerts</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} className="text-orange-500 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{riskZones.length}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risk Zones Nearby</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <Wifi size={24} className="text-green-500 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">99%</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">System Uptime</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">15 min</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Response Time</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main dashboard content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Map and weather */}
            <motion.div variants={item} className="xl:col-span-2">
              <MapCard lastUpdated="Live" />
            </motion.div>
            
            <motion.div variants={item} className="space-y-6">
              <WeatherCard 
                temperature={24}
                condition="Partly Cloudy"
                humidity={45}
                precipitation={10}
                windSpeed={8}
                visibility={10}
              />
              <AIPredictionCard 
                floodRisk="Low"
                wildfireRisk="Moderate"
                earthquakeRisk="Very Low"
                predictionWindow="48 hours"
              />
            </motion.div>
          </div>

          {/* Alerts section */}
          <motion.div variants={item}>
            <AlertsCard alerts={alerts} />
          </motion.div>

          {/* Authentication prompt modal */}
          {showAuthPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Unlock Full Features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Sign in to access real-time alerts, emergency contacts, and personalized safety recommendations.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSignIn}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Continue without signing in
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LandingDashboard;
