import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BellRing, 
  Boxes, 
  Map, 
  Users, 
  Settings, 
  LogIn,
  Shield,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

function Sidebar({ isOpen, toggleSidebar, onLoginClick }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 flex flex-col z-30 w-64 transition-all transform 
                   bg-blue-700 dark:bg-blue-900 text-white ${
                   isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-blue-800 dark:border-blue-950">
          <Shield className="h-8 w-8 flex-shrink-0" />
          <div className={`ml-2 flex-1 ${!isOpen && 'md:hidden'}`}>
            <div className="font-bold text-xl">DisasterShield</div>
            <div className="text-xs text-blue-200">by ResQTech</div>
          </div>
          
          <button 
            onClick={toggleSidebar}
            className="text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <NavItem to="/dashboard" icon={<Home size={20} />} text="Dashboard" collapsed={!isOpen} />
            <NavItem to="/dashboard/alerts" icon={<BellRing size={20} />} text="Alerts & Warnings" collapsed={!isOpen} badge="3" />
            <NavItem to="/dashboard/resources" icon={<Boxes size={20} />} text="Resources" collapsed={!isOpen} />
            <NavItem to="/dashboard/map" icon={<Map size={20} />} text="Map View" collapsed={!isOpen} />
            <NavItem to="/dashboard/teams" icon={<Users size={20} />} text="Emergency Teams" collapsed={!isOpen} />
            <NavItem to="/dashboard/settings" icon={<Settings size={20} />} text="Settings" collapsed={!isOpen} />
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-blue-800 dark:border-blue-950">
          <button 
            onClick={onLoginClick}
            className={`flex items-center w-full px-3 py-2 rounded 
                       hover:bg-blue-800 dark:hover:bg-blue-800 transition-colors`}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 flex-shrink-0">
              <span className="text-sm font-medium">RC</span>
            </div>
            
            <div className={`ml-3 flex-1 ${!isOpen && 'md:hidden'}`}>
              <div className="text-sm font-medium">Response Coordinator</div>
              <div className="text-xs text-blue-300">Admin</div>
            </div>
            
            <LogIn className={`h-4 w-4 flex-shrink-0 ${!isOpen && 'md:hidden'}`} />
          </button>
        </div>

        {/* Toggle Button for Desktop */}
        <button 
          onClick={toggleSidebar} 
          className="hidden md:flex md:items-center md:justify-center h-8 w-8 m-2 ml-auto rounded-full bg-blue-800 hover:bg-blue-700 text-white transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>
    </>
  );
}

function NavItem({ to, icon, text, collapsed, badge }) {
  return (
    <li>
      <NavLink 
        to={to} 
        className={({ isActive }) => 
          `flex items-center px-3 py-2 rounded-md transition-colors group relative
           ${isActive ? 'bg-blue-800 dark:bg-blue-800' : 'hover:bg-blue-600 dark:hover:bg-blue-800'}`
        }
        end={to === '/dashboard'}
      >
        <div className="flex items-center justify-center h-6 w-6 flex-shrink-0">
          {icon}
        </div>
        <span className={`ml-3 flex-1 ${collapsed && 'md:hidden'}`}>{text}</span>
        
        {/* Badge for notifications */}
        {badge && (
          <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${collapsed && 'md:hidden'}`}>
            {badge}
          </span>
        )}
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:block z-50 whitespace-nowrap">
            {text}
            {badge && <span className="ml-2 text-red-300">({badge})</span>}
          </div>
        )}
      </NavLink>
    </li>
  );
}

export default Sidebar;
