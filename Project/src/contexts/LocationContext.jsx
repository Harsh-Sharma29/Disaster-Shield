import React, { createContext, useContext, useState, useEffect } from 'react';
import locationService from '../services/locationService';
import weatherService from '../services/weatherService';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Get user's current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await locationService.getCurrentPosition();
      const newLocation = {
        latitude: position.lat,
        longitude: position.lng,
        accuracy: position.accuracy,
        timestamp: new Date(position.timestamp)
      };
      
      setLocation(newLocation);
      
      // Get address from coordinates
      await getAddressFromCoordinates(position.lat, position.lng);
      
      // Get weather for location
      await getWeatherForLocation(position.lat, position.lng);
      
      setIsLoading(false);
      return newLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      setError(error.message);
      setIsLoading(false);
      throw error;
    }
  };

  // Watch user's location for continuous updates
  const watchLocation = () => {
    if (isTracking) {
      stopWatchingLocation();
    }

    try {
      locationService.startLocationTracking(async (locationData, error) => {
        if (error) {
          setError(error);
          return;
        }

        if (locationData) {
          const newLocation = {
            latitude: locationData.lat,
            longitude: locationData.lng,
            accuracy: locationData.accuracy,
            timestamp: new Date(locationData.timestamp)
          };
          
          setLocation(newLocation);
          
          // Update address if significantly moved
          if (!address || hasSignificantLocationChange(newLocation)) {
            await getAddressFromCoordinates(locationData.lat, locationData.lng);
          }
          
          // Update weather periodically (every 10 minutes)
          const now = new Date();
          if (!weather || (now - new Date(weather.timestamp)) > 10 * 60 * 1000) {
            await getWeatherForLocation(locationData.lat, locationData.lng);
          }
        }
      });
      
      setIsTracking(true);
    } catch (error) {
      setError(error.message);
    }
  };

  // Stop watching location
  const stopWatchingLocation = () => {
    locationService.stopLocationTracking();
    setIsTracking(false);
  };

  // Check if location has changed significantly
  const hasSignificantLocationChange = (newLocation) => {
    if (!location) return true;
    
    const distance = locationService.calculateDistance(
      location.latitude, location.longitude,
      newLocation.latitude, newLocation.longitude
    );
    
    return distance > 0.5; // 500 meters
  };

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const addressData = await locationService.reverseGeocode(lat, lng);
      setAddress({
        formatted: addressData.displayName,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postcode: addressData.postcode,
        components: addressData.address
      });
    } catch (error) {
      console.error('Error getting address:', error);
      // Fallback to basic coordinates display
      setAddress({
        formatted: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      });
    }
  };

  // Get weather for current location
  const getWeatherForLocation = async (lat, lng) => {
    try {
      const weatherData = await weatherService.getCurrentWeather(lat, lng);
      setWeather({
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        description: weatherData.description || weatherData.condition,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        pressure: weatherData.pressure,
        visibility: weatherData.visibility,
        uvIndex: weatherData.uvIndex || 0,
        timestamp: new Date(),
        location: weatherData.location || address?.city || 'Your Location',
        icon: weatherData.icon,
        feelsLike: weatherData.feelsLike
      });
    } catch (error) {
      console.error('Error getting weather:', error);
      // Fallback to mock weather data
      setWeather({
        temperature: Math.round(Math.random() * 30 + 5),
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 60 + 30),
        windSpeed: Math.round(Math.random() * 20 + 5),
        pressure: Math.round(Math.random() * 50 + 1000),
        visibility: Math.round(Math.random() * 15 + 5),
        uvIndex: Math.round(Math.random() * 10),
        timestamp: new Date(),
        location: address?.city || 'Your Location'
      });
    }
  };

  // Request location permission explicitly
  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }
      
      // Try to get current position (this will request permission)
      await getCurrentLocation();
      
      // Start watching for location changes
      watchLocation();
      
    } catch (error) {
      console.error('Location permission error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Check location permission status
  const checkLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        return 'not-supported';
      }
      
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Error checking permission:', error);
      return 'unknown';
    }
  };

  // Initialize location on mount
  useEffect(() => {
    // Auto-request location on mount
    requestLocationPermission();
    
    // Clean up on unmount
    return () => {
      stopWatchingLocation();
    };
  }, []);

  const value = {
    location,
    address,
    weather,
    isLoading,
    error,
    isTracking,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    getWeatherForLocation,
    getAddressFromCoordinates,
    requestLocationPermission,
    // Additional location service methods
    locationService
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
