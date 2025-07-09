import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Wifi, WifiOff, Clock, Router, Building2, Shield, Phone, Building } from 'lucide-react';
import { responsiveClasses, cn } from '../../utils/responsive';

// Simple location service mock
const simpleLocationService = {
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },
  
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      return {
        displayName: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: data.address?.city || data.address?.town || 'Unknown',
        country: data.address?.country || 'Unknown'
      };
    } catch (error) {
      return {
        displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: 'Unknown',
        country: 'Unknown'
      };
    }
  },
  
  async getNearbyPlaces(lat, lng, radius = 5000) {
    try {
      const places = [];
      const placeTypes = [
        { type: 'hospital', icon: Building2, color: 'text-red-500', label: 'Hospital' },
        { type: 'police', icon: Shield, color: 'text-blue-500', label: 'Police Station' },
        { type: 'fire_station', icon: AlertTriangle, color: 'text-orange-500', label: 'Fire Station' },
        { type: 'pharmacy', icon: Building, color: 'text-green-500', label: 'Pharmacy' },
        { type: 'school', icon: Building, color: 'text-purple-500', label: 'School' },
        { type: 'bank', icon: Building, color: 'text-yellow-600', label: 'Bank' }
      ];
      
      for (const placeType of placeTypes) {
        try {
          const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["amenity"="${placeType.type}"](around:${radius},${lat},${lng});way["amenity"="${placeType.type}"](around:${radius},${lat},${lng}););out center;`
          );
          
          if (response.ok) {
            const data = await response.json();
            const nearbyPlaces = data.elements.slice(0, 5).map(element => ({
              id: element.id,
              name: element.tags?.name || `${placeType.label}`,
              type: placeType.type,
              lat: element.lat || element.center?.lat,
              lng: element.lon || element.center?.lon,
              icon: placeType.icon,
              color: placeType.color,
              label: placeType.label,
              address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || 'Address not available',
              phone: element.tags?.phone || 'Phone not available',
              distance: this.calculateDistance(lat, lng, element.lat || element.center?.lat, element.lon || element.center?.lon)
            }));
            
            places.push(...nearbyPlaces);
          }
        } catch (error) {
          console.warn(`Failed to fetch ${placeType.type}:`, error);
        }
      }
      
      // Sort by distance and return top 20
      const sortedPlaces = places.sort((a, b) => a.distance - b.distance).slice(0, 20);
      
      // If no places found, return static fallback data
      if (sortedPlaces.length === 0) {
        console.log('Using static fallback data for MapCard nearby places');
        return this.generateStaticPlaces(lat, lng, placeTypes);
      }
      
      return sortedPlaces;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      // Return static fallback data when API fails
      return this.generateStaticPlaces(lat, lng, placeTypes);
    }
  },
  
  generateStaticPlaces(lat, lng, placeTypes) {
    const staticPlaces = [];
    const sampleNames = {
      hospital: ['City Hospital', 'Medical Center', 'Community Hospital', 'Emergency Care'],
      police: ['Police Station', 'Law Enforcement', 'Public Safety', 'Police Precinct'],
      fire_station: ['Fire Station', 'Fire Department', 'Emergency Services', 'Rescue Station'],
      pharmacy: ['Pharmacy', 'Drug Store', 'Medical Supplies', 'Health Store'],
      school: ['Elementary School', 'High School', 'Education Center', 'Learning Academy'],
      bank: ['Bank', 'Credit Union', 'Financial Center', 'ATM Location']
    };
    
    const addresses = [
      '123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St', '654 Maple Dr'
    ];
    
    const phoneNumbers = [
      '+1-555-0123', '+1-555-0456', '+1-555-0789', '+1-555-0321', '+1-555-0654'
    ];
    
    placeTypes.forEach((placeType) => {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 places per type
      
      for (let i = 0; i < count; i++) {
        const randomOffset = () => (Math.random() - 0.5) * 0.05;
        const distance = Math.random() * 4 + 1; // 1-5km distance
        
        staticPlaces.push({
          id: `static_${placeType.type}_${i}`,
          name: sampleNames[placeType.type][Math.floor(Math.random() * sampleNames[placeType.type].length)],
          type: placeType.type,
          lat: lat + randomOffset(),
          lng: lng + randomOffset(),
          icon: placeType.icon,
          color: placeType.color,
          label: placeType.label,
          address: addresses[Math.floor(Math.random() * addresses.length)],
          phone: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
          distance: distance
        });
      }
    });
    
    return staticPlaces.sort((a, b) => a.distance - b.distance);
  },
  
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

// Connection status checker
const checkConnection = async () => {
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Component to display nearby places
const NearbyPlacesList = ({ places, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Finding nearby places...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  if (!places || places.length === 0) {
    return (
      <div className="p-4 text-center">
        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">No nearby places found</p>
      </div>
    );
  }
  
  return (
    <div className="max-h-64 overflow-y-auto">
      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Nearby Places</h4>
      </div>
      <div className="space-y-2 p-3">
        {places.map((place) => {
          const IconComponent = place.icon;
          return (
            <div key={place.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <IconComponent className={`w-5 h-5 ${place.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {place.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {place.address}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {place.distance.toFixed(1)} km away
                  </span>
                  {place.phone !== 'Phone not available' && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      📞 {place.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple static map component that shows location info
const StaticMapView = ({ location, locationInfo, isOnline }) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01},${location.lat-0.01},${location.lng+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lng}`;
  
  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      {isOnline ? (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
          className="rounded-lg"
        />
      ) : (
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {locationInfo?.city || 'Gwalior'}, {locationInfo?.country || 'India'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

const MapCard = ({ lastUpdated }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(lastUpdated || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [connectionStrength, setConnectionStrength] = useState('good');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  
  // Default locations for fallback
  const defaultLocations = {
    gwalior: { lat: 26.2183, lng: 78.1828, name: 'Gwalior, India' },
    delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi, India' }
  };
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStrength('good');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStrength('poor');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection quality
    const checkConnectionQuality = async () => {
      try {
        const start = Date.now();
        const isConnected = await checkConnection();
        const end = Date.now();
        const responseTime = end - start;
        
        if (!isConnected) {
          setConnectionStrength('poor');
          setIsOnline(false);
        } else if (responseTime > 3000) {
          setConnectionStrength('weak');
        } else {
          setConnectionStrength('good');
        }
      } catch (error) {
        setConnectionStrength('poor');
        setIsOnline(false);
      }
    };
    
    checkConnectionQuality();
    const interval = setInterval(checkConnectionQuality, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);
  
  // Get user's current location
  const getCurrentLocation = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isLocating) return;
    
    setIsLocating(true);
    setError(null);
    
    try {
      // If offline or poor connection, use default location
      if (!isOnline || connectionStrength === 'poor') {
        const fallbackLocation = defaultLocations.gwalior;
        setUserLocation(fallbackLocation);
        setLocationInfo({
          city: 'Gwalior',
          country: 'India',
          displayName: 'Gwalior, Madhya Pradesh, India (Default Location)'
        });
        setError('Your connection is weak. Please check your network connection.');
        setLastUpdateTime(new Date().toLocaleString());
        setIsLocating(false);
        setIsLoading(false);
        return;
      }
      
      // Try to get actual location
      const location = await simpleLocationService.getCurrentLocation();
      setUserLocation(location);
      setLocationAccuracy(location.accuracy);
      
      // Get location info
      try {
        const info = await simpleLocationService.reverseGeocode(location.lat, location.lng);
        setLocationInfo(info);
      } catch (geoError) {
        console.warn('Failed to get location info:', geoError);
        setLocationInfo({
          city: 'Unknown',
          country: 'Unknown',
          displayName: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
        });
      }
      
      setLastUpdateTime(new Date().toLocaleString());
      setError(null);
      
    } catch (err) {
      console.error('Location error:', err);
      
      // Handle different error types
      let errorMessage = 'Unable to get your location.';
      let fallbackCity = 'gwalior';
      
      if (err.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Location access denied. Using default location (Gwalior).';
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'Location services unavailable. Check your connection.';
      } else if (err.code === 3) { // TIMEOUT
        errorMessage = 'Location request timed out. Your connection might be weak.';
      } else {
        errorMessage = 'Your connection is weak. Please check your network connection.';
      }
      
      setError(errorMessage);
      const fallback = defaultLocations[fallbackCity];
      setUserLocation(fallback);
      setLocationInfo({
        city: fallback.name.split(',')[0],
        country: 'India',
        displayName: `${fallback.name} (Default Location)`
      });
      
    } finally {
      setIsLocating(false);
      setIsLoading(false);
    }
  }, [isLocating, isOnline, connectionStrength]);
  
  // Function to fetch nearby places
  const fetchNearbyPlaces = useCallback(async (location) => {
    if (!location || !isOnline || connectionStrength === 'poor') {
      setPlacesError('Unable to fetch nearby places due to poor connection');
      return;
    }
    
    setIsLoadingPlaces(true);
    setPlacesError(null);
    
    try {
      const places = await simpleLocationService.getNearbyPlaces(location.lat, location.lng);
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      setPlacesError('Failed to load nearby places');
    } finally {
      setIsLoadingPlaces(false);
    }
  }, [isOnline, connectionStrength]);
  
  // Initialize location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);
  
  // Fetch nearby places when location changes
  useEffect(() => {
    if (userLocation && !error) {
      fetchNearbyPlaces(userLocation);
    }
  }, [userLocation, error, fetchNearbyPlaces]);
  
  // Connection strength indicator
  const getConnectionIcon = () => {
    switch (connectionStrength) {
      case 'good':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'weak':
        return <Wifi className="w-3 h-3 text-yellow-500" />;
      default:
        return <WifiOff className="w-3 h-3 text-red-500" />;
    }
  };
  
  const getConnectionStatus = () => {
    switch (connectionStrength) {
      case 'good':
        return 'Good Connection';
      case 'weak':
        return 'Weak Connection';
      default:
        return 'Poor Connection';
    }
  };
  
  const getConnectionColor = () => {
    switch (connectionStrength) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'weak':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };
  
  // Show error state if no location and error
  if (error && !userLocation) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Map View
          </h2>
          <div className={`flex items-center px-2 py-1 rounded-md text-xs ${getConnectionColor()}`}>
            {getConnectionIcon()}
            <span className="ml-1">{getConnectionStatus()}</span>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="mb-6">
            <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Connection Issue
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your connection is weak. Please check your network connection.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => getCurrentLocation(true)}
              disabled={isLocating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLocating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isLocating ? 'Checking Connection...' : 'Try Again'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Router className="w-4 h-4 mr-2" />
              Reload Page
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Troubleshooting tips:</p>
            <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Disable VPN if enabled</li>
              <li>• Clear browser cache</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Map View
          </h2>
          {locationInfo && (
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {locationInfo.city}, {locationInfo.country}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center px-2 py-1 rounded-md text-xs ${getConnectionColor()}`}>
            {getConnectionIcon()}
            <span className="ml-1">{getConnectionStatus()}</span>
          </div>
          
          <button
            onClick={() => setShowNearbyPlaces(!showNearbyPlaces)}
            className={`p-2 text-gray-500 hover:text-blue-600 transition-colors ${showNearbyPlaces ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}`}
            title="Toggle nearby places"
          >
            <Building className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => getCurrentLocation(true)}
            disabled={isLocating}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Refresh location"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row">
        {/* Map Content */}
        <div className={`relative ${showNearbyPlaces ? 'lg:w-2/3' : 'w-full'} h-96 md:h-[400px] lg:h-[450px]`}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {connectionStrength === 'poor' ? 'Checking connection...' : 'Getting your location...'}
                </p>
              </div>
            </div>
          ) : userLocation ? (
            <StaticMapView 
              location={userLocation} 
              locationInfo={locationInfo} 
              isOnline={isOnline && connectionStrength !== 'poor'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Unable to load map</p>
                <p className="text-xs text-red-500 mt-2">Please check your connection</p>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
          
          {/* Location info overlay */}
          {userLocation && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs">
              <div className="flex items-center text-sm mb-1">
                {error ? (
                  <>
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Default Location</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-gray-700 dark:text-gray-300">Live Location</span>
                  </>
                )}
              </div>
              
              {locationInfo && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {locationInfo.displayName}
                </p>
              )}
              
              {locationAccuracy && !error && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Accuracy: ±{Math.round(locationAccuracy)}m
                </p>
              )}
              
              {lastUpdateTime && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{lastUpdateTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Nearby Places Sidebar */}
        {showNearbyPlaces && (
          <div className="lg:w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <NearbyPlacesList 
              places={nearbyPlaces} 
              isLoading={isLoadingPlaces} 
              error={placesError} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCard;
