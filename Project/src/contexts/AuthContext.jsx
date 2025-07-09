/**
 * Authentication Context
 * Manages user authentication state, login, logout, and user data
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Authentication API endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API request helper
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include', // Include cookies
      ...options
    };

    // Add authorization header if token exists
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  // Demo user data
  const getDemoUser = (email) => {
    const demoUsers = {
      'admin@demo.com': {
        id: 'demo-admin',
        email: 'admin@demo.com',
        name: 'Admin Demo User',
        role: 'admin',
        permissions: ['all'],
        avatar: null
      },
      'coordinator@demo.com': {
        id: 'demo-coordinator',
        email: 'coordinator@demo.com',
        name: 'Coordinator Demo User',
        role: 'coordinator',
        permissions: ['coordinate', 'view_reports', 'manage_resources'],
        avatar: null
      },
      'responder@demo.com': {
        id: 'demo-responder',
        email: 'responder@demo.com',
        name: 'Responder Demo User',
        role: 'responder',
        permissions: ['respond', 'view_incidents'],
        avatar: null
      },
      'citizen@demo.com': {
        id: 'demo-citizen',
        email: 'citizen@demo.com',
        name: 'Citizen Demo User',
        role: 'citizen',
        permissions: ['report', 'view_alerts'],
        avatar: null
      }
    };
    return demoUsers[email] || null;
  };

  // Simplified login function that works with demo accounts
  const login = async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Always check for demo accounts first
      const demoUser = getDemoUser(email);
      if (demoUser) {
        // Simulate realistic loading time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const demoToken = `demo-token-${Date.now()}`;
        const loginData = {
          user: demoUser,
          token: demoToken
        };
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: loginData
        });

        // Store token in localStorage for persistence
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('isDemoMode', 'true');

        toast.success(`Welcome ${demoUser.name}! (Demo Mode)`);
        return loginData;
      }

      // For non-demo accounts, show error since we don't have a backend
      throw new Error('Only demo accounts are available. Please use one of the demo login buttons.');
      
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Simplified register function for demo mode
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a demo user from registration data
      const newDemoUser = {
        id: `demo-registered-${Date.now()}`,
        email: userData.email,
        name: userData.name || userData.firstName + ' ' + userData.lastName,
        role: 'citizen',
        permissions: ['report', 'view_alerts'],
        avatar: null
      };
      
      const demoToken = `demo-token-${Date.now()}`;
      const loginData = {
        user: newDemoUser,
        token: demoToken
      };
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: loginData
      });

      // Store token in localStorage
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(newDemoUser));
      localStorage.setItem('isDemoMode', 'true');

      toast.success('Registration successful! (Demo Mode)');
      return loginData;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Only call API if not in demo mode
      const isDemoMode = localStorage.getItem('isDemoMode');
      
      if (!isDemoMode) {
        await apiRequest('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isDemoMode');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      const response = await apiRequest('/auth/me');
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.data.user
        });
        return response.data.user;
      }
    } catch (error) {
      console.error('Get user error:', error);
      // If token is invalid, logout
      logout();
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.data.user
        });
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success('Profile updated successfully');
        return response.data.user;
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.success) {
        toast.success('Password changed successfully');
        return true;
      }
    } catch (error) {
      const errorMessage = error.message || 'Password change failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.success) {
        toast.success('Password reset email sent');
        return true;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      });

      if (response.success) {
        toast.success('Password reset successful');
        return true;
      }
    } catch (error) {
      const errorMessage = error.message || 'Password reset failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    return state.user?.permissions?.includes(permission) || false;
  };

  // Check if user has role
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(state.user?.role);
    }
    return state.user?.role === role;
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const isDemoMode = localStorage.getItem('isDemoMode');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });

          // Only verify token with API if not in demo mode
          if (!isDemoMode) {
            try {
              await getCurrentUser();
            } catch (error) {
              // Token is invalid, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('isDemoMode');
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,

    // Utility functions
    hasPermission,
    hasRole,
    clearError: () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }),

    // API helper
    apiRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
export function ProtectedRoute({ children, requiredPermission, requiredRole, fallback }) {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <Navigate to="/login" replace />;
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have the required role to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default AuthContext;
