import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Target,
  Users,
  Shield,
  Phone,
  Clock,
  Battery,
  Satellite
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import locationService from '../../services/locationService';
import { responsiveClasses, cn } from '../../utils/responsive';

// Fix Leaflet default icon issue
const iconRetinaUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const iconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const shadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

// Fallback to CDN if local images fail
const getIconUrl = (local, cdn) => {
  try {
    return local;
  } catch {
    return cdn;
  }
};

try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: getIconUrl(iconRetinaUrl, 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png'),
    iconUrl: getIconUrl(iconUrl, 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png'),
    shadowUrl: getIconUrl(shadowUrl, 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'),
  });
} catch (error) {
  console.warn('Leaflet icon initialization failed, using CDN fallback:', error);
  // Fallback to CDN URLs
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Custom icons for different markers
const createCustomIcon = (type, color = '#3B82F6') => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Map event handler for live tracking
function LiveTracker({ onLocationUpdate, centerOnUser }) {
  const map = useMap();
  
  useMapEvents({
    locationfound(e) {
      if (onLocationUpdate) {
        onLocationUpdate(e.latlng, e.accuracy);
      }
      if (centerOnUser) {
        map.flyTo(e.latlng, Math.max(map.getZoom(), 15));
      }
    },
    locationerror(e) {
      console.error('Location error:', e.message);
    }
  });

  useEffect(() => {
    map.locate({ 
      watch: true, 
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    });

    return () => {
      map.stopLocate();
    };
  }, [map]);

  return null;
}

// Location accuracy circle component
function AccuracyCircle({ position, accuracy }) {
  if (!position || !accuracy) return null;
  
  return (
    <Circle
      center={position}
      radius={accuracy}
      pathOptions={{
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 2
      }}
    />
  );
}

// User location marker with pulse animation
function UserLocationMarker({ position, accuracy, locationInfo }) {
  if (!position) return null;

  return (
    <>
      <Marker 
        position={position} 
        icon={createCustomIcon('user', '#10B981')}
      >
        <Popup>
          <div className="text-center p-2">
            <div className="flex items-center justify-center mb-2">
              <Navigation className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-600">Your Location</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Lat: {position.lat.toFixed(6)}</p>
              <p>Lng: {position.lng.toFixed(6)}</p>
              {accuracy && <p>Accuracy: ±{Math.round(accuracy)}m</p>}
              {locationInfo && (
                <p className="text-xs text-gray-500 mt-2">
                  {locationInfo.displayName}
                </p>
              )}
            </div>
          </div>
        </Popup>
      </Marker>
      <AccuracyCircle position={position} accuracy={accuracy} />
    </>
  );
}

// Emergency facilities markers
function EmergencyMarkers({ facilities, showFacilities }) {
  if (!showFacilities) return null;

  const getMarkerColor = (type) => {
    switch (type) {
      case 'hospital': return '#EF4444';
      case 'fire_station': return '#F97316';
      case 'police_station': return '#3B82F6';
      case 'shelter': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'fire_station': return '🚒';
      case 'police_station': return '👮';
      case 'shelter': return '🏠';
      default: return '📍';
    }
  };

  return facilities.map((facility) => (
    <Marker 
      key={facility.id} 
      position={[facility.position.lat, facility.position.lng]}
      icon={createCustomIcon(facility.type, getMarkerColor(facility.type))}
    >
      <Popup>
        <div className="p-2">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">{getTypeIcon(facility.type)}</span>
            <h3 className="font-semibold text-gray-800">{facility.name}</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Type:</strong> {facility.type.replace('_', ' ')}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-1 ${facility.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {facility.status}
              </span>
            </p>
            {facility.contact && (
              <p><strong>Contact:</strong> {facility.contact}</p>
            )}
            {facility.capacity && (
              <p><strong>Capacity:</strong> {facility.capacity}</p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  ));
}

// Alert location marker
function AlertLocationMarker({ alertLocation }) {
  if (!alertLocation) return null;

  return (
    <Marker 
      position={[alertLocation.lat, alertLocation.lng]}
      icon={createCustomIcon('alert', '#EF4444')}
    >
      <Popup>
        <div className="p-2">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-600">Alert Location</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Coordinates:</strong> {alertLocation.lat.toFixed(6)}, {alertLocation.lng.toFixed(6)}</p>
            {alertLocation.name && (
              <p><strong>Location:</strong> {alertLocation.name}</p>
            )}
            {alertLocation.alertId && (
              <p><strong>Alert ID:</strong> {alertLocation.alertId}</p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Risk zones display
function RiskZones({ zones, showRiskZones }) {
  if (!showRiskZones) return null;

  const getZoneColor = (level) => {
    switch (level) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return zones.map((zone) => (
    <Circle
      key={zone.id}
      center={[zone.center.lat, zone.center.lng]}
      radius={zone.radius}
      pathOptions={{
        color: getZoneColor(zone.level),
        fillColor: getZoneColor(zone.level),
        fillOpacity: 0.2,
        weight: 2
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-800 mb-2">{zone.description}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Risk Level:</strong> 
              <span className={`ml-1 font-medium ${
                zone.level === 'high' ? 'text-red-600' : 
                zone.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {zone.level.toUpperCase()}
              </span>
            </p>
            <p><strong>Type:</strong> {zone.type}</p>
            <p className="text-xs text-gray-500 mt-2">{zone.alertMessage}</p>
          </div>
        </div>
      </Popup>
    </Circle>
  ));
}

// Main LiveLocationMap component
const LiveLocationMap = ({ 
  height = '500px',
  showControls = true,
  autoCenter = true,
  showEmergencyFacilities = true,
  showRiskZones = true,
  alertLocation = null,
  className,
  onLocationUpdate
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  
  // Map layer controls
  const [showFacilities, setShowFacilities] = useState(showEmergencyFacilities);
  const [showRisks, setShowRisks] = useState(showRiskZones);
  const [mapStyle, setMapStyle] = useState('standard');
  
  const mapRef = useRef(null);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle location updates
  const handleLocationUpdate = useCallback(async (position, accuracy) => {
    if (!position) return;
    
    const newLocation = {
      lat: position.lat,
      lng: position.lng,
      timestamp: Date.now()
    };
    
    setUserLocation(newLocation);
    setLocationAccuracy(accuracy || position.accuracy);
    setLastUpdate(new Date().toLocaleTimeString());
    setError(null);
    
    // Get reverse geocoding info (with debouncing)
    try {
      const info = await locationService.reverseGeocode(position.lat, position.lng);
      setLocationInfo(info);
    } catch (err) {
      console.warn('Failed to get location info:', err);
    }
    
    // Notify parent component
    if (onLocationUpdate) {
      onLocationUpdate({ ...newLocation, accuracy: accuracy || position.accuracy, info: locationInfo });
    }
  }, [onLocationUpdate, locationInfo]);

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    setIsTracking(true);
    setError(null);
    
    try {
      const id = await locationService.startLocationTracking(
        (location, errorMsg) => {
          if (location) {
            handleLocationUpdate(location, location.accuracy);
          } else if (errorMsg) {
            console.warn('Location tracking error:', errorMsg);
            setError(errorMsg);
            // Don't immediately stop tracking on error - let user decide
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
      setTrackingId(id);
    } catch (err) {
      console.error('Failed to start location tracking:', err);
      setError(err.message);
      setIsTracking(false);
    }
  }, [isTracking, handleLocationUpdate]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (!isTracking) return;
    
    locationService.stopLocationTracking();
    setIsTracking(false);
    setTrackingId(null);
  }, [isTracking]);

  // Get current location once
  const getCurrentLocation = useCallback(async () => {
    try {
      setError(null);
      const location = await locationService.getBestAvailableLocation();
      handleLocationUpdate(location, location.accuracy);
    } catch (err) {
      console.error('Failed to get current location:', err);
      setError(err.message);
    }
  }, [handleLocationUpdate]);

  // Initialize map
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    }
  }, [getCurrentLocation, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

  // Get tile layer URL based on style
  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Determine map center based on alert location or user location
  const getMapCenter = () => {
    if (alertLocation) {
      return [alertLocation.lat, alertLocation.lng];
    }
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    return [37.7749, -122.4194]; // San Francisco as fallback
  };
  
  const defaultCenter = getMapCenter();

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          {/* Tracking Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={isTracking ? stopTracking : startTracking}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  isTracking 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                )}
                title={isTracking ? 'Stop tracking' : 'Start tracking'}
              >
                <Target className="w-4 h-4" />
              </button>
              
              <button
                onClick={getCurrentLocation}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                title="Get current location"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Layer Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2">
            <button
              onClick={() => setShowFacilities(!showFacilities)}
              className={cn(
                'w-full p-2 rounded-md text-sm transition-colors',
                showFacilities 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              Emergency Facilities
            </button>
            
            <button
              onClick={() => setShowRisks(!showRisks)}
              className={cn(
                'w-full p-2 rounded-md text-sm transition-colors',
                showRisks 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              Risk Zones
            </button>
          </div>

          {/* Map Style Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="standard">Standard</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {/* Online Status */}
        <div className={cn(
          'flex items-center px-3 py-2 rounded-lg shadow-lg text-sm',
          isOnline 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        )}>
          {isOnline ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>

        {/* Tracking Status */}
        {isTracking && (
          <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Live Tracking
            </div>
          </div>
        )}
      </div>

      {/* Location Info Panel */}
      {userLocation && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 text-blue-500 mr-2" />
            <span className="font-medium text-sm">Current Location</span>
          </div>
          
          {locationInfo && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {locationInfo.city}, {locationInfo.country}
            </p>
          )}
          
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Lat:</span>
              <span>{userLocation.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Lng:</span>
              <span>{userLocation.lng.toFixed(6)}</span>
            </div>
            {locationAccuracy && (
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span>±{Math.round(locationAccuracy)}m</span>
              </div>
            )}
            {lastUpdate && (
              <div className="flex justify-between">
                <span>Updated:</span>
                <span>{lastUpdate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg max-w-md text-sm"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div style={{ height }} className="w-full">
        <MapContainer
          ref={mapRef}
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          whenCreated={() => setMapReady(true)}
        >
          <TileLayer
            url={getTileLayerUrl()}
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Live tracking handler */}
          {mapReady && (
            <LiveTracker 
              onLocationUpdate={handleLocationUpdate}
              centerOnUser={autoCenter && isTracking}
            />
          )}
          
          {/* User location marker */}
          <UserLocationMarker 
            position={userLocation}
            accuracy={locationAccuracy}
            locationInfo={locationInfo}
          />
          
          {/* Emergency facilities */}
          <EmergencyMarkers 
            facilities={locationService.emergencyFacilities}
            showFacilities={showFacilities}
          />
          
          {/* Risk zones */}
          <RiskZones 
            zones={locationService.riskZones}
            showRiskZones={showRisks}
          />
          
          {/* Alert location marker */}
          <AlertLocationMarker alertLocation={alertLocation} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveLocationMap;
