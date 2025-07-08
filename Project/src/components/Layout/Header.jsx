import React, { useContext, useState } from 'react';
import { 
  Moon, 
  Sun, 
  Menu, 
  AlertTriangle,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { responsiveClasses, cn } from '../../utils/responsive';

function Header({ toggleSidebar, onReportIncident, onEmergencyResponse }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout, isAuthenticated } = useAuth();
  const [alertLevel, setAlertLevel] = useState('Normal');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="flex items-center h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
      <button 
        onClick={toggleSidebar}
        className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
      >
        <Menu size={24} />
      </button>

      <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
        Disaster Management Dashboard
      </h1>

      <div className="flex items-center ml-auto space-x-2 md:space-x-3">
        {/* Alert Level - Hidden on small screens */}
        <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
          <span className="text-sm font-medium">Alert Level: {alertLevel}</span>
        </div>

        {/* Mobile menu button for actions */}
        <div className="sm:hidden relative">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <AlertTriangle size={20} />
          </button>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center space-x-2">
          <button 
            onClick={onReportIncident}
            className="px-3 md:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors text-sm"
          >
            <AlertTriangle size={16} className="inline-block mr-1" />
            <span className="hidden md:inline">Report Incident</span>
            <span className="md:hidden">Report</span>
          </button>

          <button 
            onClick={onEmergencyResponse}
            className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden md:inline">Emergency Response</span>
              <span className="md:hidden">Emergency</span>
            </span>
          </button>
        </div>

        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Menu */}
        {isAuthenticated && user && (
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium truncate max-w-32">
                {user.name || user.email}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                    {user.role} {localStorage.getItem('isDemoMode') && '(Demo)'}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Add settings navigation here
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
