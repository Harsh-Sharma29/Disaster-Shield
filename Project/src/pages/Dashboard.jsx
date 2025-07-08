import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Wifi, MapPin, Clock } from 'lucide-react';
import AIPredictionCard from '../components/Dashboard/AIPredictionCard';
import WeatherCard from '../components/Dashboard/WeatherCard';
import MapCard from '../components/Dashboard/MapCard';
import AlertsCard from '../components/Dashboard/AlertsCard';
import ResourceSummary from '../components/Dashboard/ResourceSummary';
import ManualStatusCard from '../components/Dashboard/ManualStatusCard';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    // Simulate loading data from an API
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mock data - would normally come from backend API
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
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 md:space-y-6"
    >
      {/* Top cards row */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <motion.div variants={item} className="card-transition bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-3 md:p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-500 dark:text-red-400 md:w-6 md:h-6" />
            </div>
            <div className="ml-3 md:ml-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">3</h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Active Alerts</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="card-transition bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-3 md:p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-blue-500 dark:text-blue-400 md:w-6 md:h-6" />
            </div>
            <div className="ml-3 md:ml-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">5</h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Teams Deployed</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="card-transition bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-3 md:p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <Wifi size={20} className="text-green-500 dark:text-green-400 md:w-6 md:h-6" />
            </div>
            <div className="ml-3 md:ml-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">99%</h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">System Uptime</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="card-transition bg-white dark:bg-gray-800 rounded-lg shadow-elevation-1 dark:shadow-none p-3 md:p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-purple-500 dark:text-purple-400 md:w-6 md:h-6" />
            </div>
            <div className="ml-3 md:ml-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">15 min</h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Avg. Response Time</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Middle content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Map and weather */}
        <motion.div variants={item} className="xl:col-span-2">
          <MapCard lastUpdated="Today, 10:30 AM" />
        </motion.div>
        
        <motion.div variants={item} className="space-y-4 md:space-y-6">
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
      
      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Alerts feed */}
        <motion.div variants={item}>
          <AlertsCard alerts={alerts} />
        </motion.div>
        
        {/* Manual Status Updates */}
        <motion.div variants={item}>
          <ManualStatusCard />
        </motion.div>
        
        {/* Resource summary */}
        <motion.div variants={item}>
          <ResourceSummary />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
