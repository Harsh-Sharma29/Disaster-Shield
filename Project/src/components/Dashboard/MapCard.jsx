import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, RefreshCw, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import locationService from '../../services/locationService';
import weatherService from '../../services/weatherService';
import { responsiveClasses, cn } from '../../utils/responsive';

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to create risk zone circle options
function getRiskZoneOptions(level) {
  switch (level) {
    case 'high':
      return { color: 'red', fillColor: '#f03', fillOpacity: 0.2 };
    case 'medium':
      return { color: 'orange', fillColor: '#f60', fillOpacity: 0.2 };
    default:
      return { color: 'yellow', fillColor: '#ff0', fillOpacity: 0.2 };
  }
}

// Map event handler component
function LocationMarker({ position, onLocationFound }) {
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold flex items-center">
            <Navigation className="w-4 h-4 mr-2 text-blue-600" />
            Your Location
          </h3>
          <p className="text-sm text-gray-600">Lat: {position.lat.toFixed(4)}</p>
          <p className="text-sm text-gray-600">Lng: {position.lng.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function RiskZoneMarkers({ riskZones }) {
  return riskZones.map((zone) => (
    <Circle
      key={zone.id}
      center={zone.center}
      radius={zone.radius}
      pathOptions={getRiskZoneOptions(zone.level)}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-red-500">{zone.description}</h3>
          <p className="text-xs text-gray-600">{zone.alertMessage}</p>
        </div>
      </Popup>
    </Circle>
  ));
}

function FacilityMarkers({ facilities }) {
  return facilities.map((facility) => (
    <Marker key={facility.id} position={facility.position}>
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-blue-600">{facility.name}</h3>
          <p className="text-sm text-gray-600">Type: {facility.type}</p>
          <p className="text-xs text-gray-500">Status: {facility.status}</p>
          <p className="text-xs text-gray-500">Contact: {facility.contact}</p>
        </div>
      </Popup>
    </Marker>
  ));
}

const MapCard = ({ lastUpdated }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(lastUpdated || '');
  const [isLocating, setIsLocating] = useState(false);
  
  // Get user's current location
  const getCurrentLocation = async () => {
    setIsLocating(true);
    setError(null);
    
    try {
      const location = await locationService.getLocationWithFallback();
      setUserLocation(location);
      
      // Get location info (city, country)
      try {
        const info = await locationService.reverseGeocode(location.lat, location.lng);
        setLocationInfo(info);
      } catch (geoError) {
        console.warn('Failed to get location info:', geoError.message);
      }
      
      setLastUpdateTime(new Date().toLocaleString());
    } catch (err) {
      setError(err.message);
      // Fallback to default location
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    } finally {
      setIsLocating(false);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (error && !userLocation) {
    return (
      <div className={cn(responsiveClasses.card, 'overflow-hidden')}>
        <div className={cn(responsiveClasses.cardHeader)}>
          <h2 className={cn(responsiveClasses.textBase, 'font-semibold text-gray-800 dark:text-white flex items-center')}>
            <MapPin className={cn(responsiveClasses.iconSm, 'mr-2 text-blue-600')} />
            Map View
          </h2>
          <span className={cn(responsiveClasses.textXs, 'text-gray-500 dark:text-gray-400')}>Last updated: {lastUpdateTime}</span>
        </div>
        <div className={cn(responsiveClasses.cardPadding, 'text-center py-8')}>
          <AlertTriangle className={cn(responsiveClasses.iconXl, 'text-red-500 mx-auto mb-4')} />
          <p className={cn(responsiveClasses.textSm, 'text-gray-600 dark:text-gray-400 mb-4')}>Location access denied or unavailable</p>
          <div className="space-y-2">
            <button 
              onClick={getCurrentLocation}
              disabled={isLocating}
              className={cn(
                responsiveClasses.btnMd,
                'flex items-center justify-center mx-auto bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
              )}
            >
              <RefreshCw className={cn(responsiveClasses.iconSm, `mr-2 ${isLocating ? 'animate-spin' : ''}`)} />
              {isLocating ? 'Getting Location...' : 'Try Again'}
            </button>
            <p className={cn(responsiveClasses.textXs, 'text-gray-500 dark:text-gray-400')}>
              Allow location access for real-time features
            </p>
          </div>
        </div>
      </div>
    );
  }

return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
          <button 
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Refresh location"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">Last updated: {lastUpdateTime}</span>
        </div>
      </div>
      
      <div className="relative h-96 md:h-[400px] lg:h-[450px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-750">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Getting your location...</p>
            </div>
          </div>
        ) : userLocation ? (
          <MapContainer 
            center={[userLocation.lat, userLocation.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User's current location marker */}
            <LocationMarker 
              position={userLocation} 
              onLocationFound={setUserLocation}
            />
            
            {/* Risk zones and emergency facilities markers */}
            <RiskZoneMarkers riskZones={locationService.riskZones} />
            <FacilityMarkers facilities={locationService.emergencyFacilities} />
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-750">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Unable to load map</p>
            </div>
          </div>
        )}
        
        {/* Location status indicator */}
        {userLocation && (
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-gray-700 dark:text-gray-300">Live Location</span>
            </div>
            {locationInfo && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {locationInfo.displayName}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCard;

