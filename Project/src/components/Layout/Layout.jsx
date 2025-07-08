import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  const { user, isLoading } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const location = useLocation();
     // Update page title based on current route
  useEffect(() => {
    const title = getRouteTitle(location.pathname);
    document.title = `${title} - DisasterShield`;
  }, [location.pathname]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            setShowReportModal(true);
            break;
          case 'e':
            e.preventDefault();
            setShowEmergencyModal(true);
            break;
          case 'k':
            e.preventDefault();
            setQuickNavOpen(!quickNavOpen);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quickNavOpen]);
  
  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        user={user}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          onReportIncident={() => setShowReportModal(true)}
          onEmergencyResponse={() => setShowEmergencyModal(true)}
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
      
      {showReportModal && (
        <ReportIncidentModal onClose={() => setShowReportModal(false)} user={user} />
      )}
      
      {showEmergencyModal && (
        <EmergencyResponseModal onClose={() => setShowEmergencyModal(false)} user={user} />
      )}
      
      <QuickNav 
        isOpen={quickNavOpen} 
        onClose={() => setQuickNavOpen(false)}
        onReportIncident={() => setShowReportModal(true)}
        onEmergencyResponse={() => setShowEmergencyModal(true)}
        user={user}
      />
    </div>
  );
}

export default Layout;
