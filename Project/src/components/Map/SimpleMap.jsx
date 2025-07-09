import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle } from 'lucide-react';

// Fix default icon issue with better error handling
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
} catch (error) {
  console.warn('Leaflet default icon fix failed:', error);
}

// Custom icons for different facility types
const createFacilityIcon = (type, status = 'active') => {
  const color = status === 'active' ? '#10B981' : '#EF4444';
  const emoji = {
    hospital: '🏥',
    fire_station: '🚒',
    police_station: '👮',
    shelter: '🏠',
    emergency_center: '🚨'
  }[type] || '📍';
  
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    ">${emoji}</div>`,
    className: 'facility-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const SimpleMap = ({ 
  height = '400px', 
  center = [37.7749, -122.4194], 
  zoom = 13,
  alertLocation = null,
  showUserLocation = true,
  userLocation = null,
  nearbyFacilities = [] 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [detectedUserLocation, setDetectedUserLocation] = useState(null);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Ensure container has proper dimensions
    mapRef.current.style.height = height;
    mapRef.current.style.width = '100%';

    try {
      const map = L.map(mapRef.current, {
        center: alertLocation ? [alertLocation.lat, alertLocation.lng] : center,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
        preferCanvas: false
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force map to invalidate size after DOM is ready
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 100);

      // Get user location if requested
      if (showUserLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setDetectedUserLocation(userPos);
            
            // Add user location marker
            const userMarker = L.marker([userPos.lat, userPos.lng])
              .addTo(map)
              .bindPopup('Your Location')
              .openPopup();
            
            markersRef.current.push(userMarker);
            
            // Center map on user location if no alert location
            if (!alertLocation) {
              map.setView([userPos.lat, userPos.lng], 15);
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
            setError('Could not get your location');
          }
        );
      }

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
    }
  }, []);

  // Add alert location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !alertLocation) return;

    const map = mapInstanceRef.current;
    
    // Create custom alert icon
    const alertIcon = L.divIcon({
      html: `<div style="
        background: #EF4444;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">⚠️</div>`,
      className: 'alert-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const alertMarker = L.marker([alertLocation.lat, alertLocation.lng], { icon: alertIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center;">
          <h3 style="color: #EF4444; margin: 0 0 8px 0;">🚨 Alert Location</h3>
          <p style="margin: 4px 0;"><strong>Coordinates:</strong><br/>${alertLocation.lat.toFixed(6)}, ${alertLocation.lng.toFixed(6)}</p>
          ${alertLocation.name ? `<p style="margin: 4px 0;"><strong>Location:</strong><br/>${alertLocation.name}</p>` : ''}
          ${alertLocation.alertId ? `<p style="margin: 4px 0;"><strong>Alert ID:</strong> ${alertLocation.alertId}</p>` : ''}
        </div>
      `)
      .openPopup();

    markersRef.current.push(alertMarker);
    
    // Center map on alert location
    map.setView([alertLocation.lat, alertLocation.lng], 15);

    return () => {
      map.removeLayer(alertMarker);
      markersRef.current = markersRef.current.filter(m => m !== alertMarker);
    };
  }, [alertLocation]);

  // Add nearby facilities markers
  useEffect(() => {
    if (!mapInstanceRef.current || nearbyFacilities.length === 0) return;
    
    const map = mapInstanceRef.current;
    
    nearbyFacilities.forEach(facility => {
      const facilityIcon = createFacilityIcon(facility.type, facility.status);
      
      const facilityMarker = L.marker([facility.lat, facility.lng], { icon: facilityIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <h3 style="color: #3B82F6; margin: 0 0 8px 0;">${facility.name}</h3>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${facility.type.replace('_', ' ')}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${facility.status}</p>
            <p style="margin: 4px 0;"><strong>Distance:</strong> ${facility.distance?.toFixed(1) || 'N/A'}km</p>
            ${facility.contact ? `<p style="margin: 4px 0;"><strong>Contact:</strong> ${facility.contact}</p>` : ''}
          </div>
        `);
      
      markersRef.current.push(facilityMarker);
    });
    
    return () => {
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [nearbyFacilities]);

  // Show error state
  if (error) {
    return (
      <div 
        style={{ height }} 
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border"
      >
        <div className="text-center p-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 dark:border-gray-700"
      />
      
      {/* Loading indicator */}
      {!mapInstanceRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map controls */}
      <div className="absolute top-2 right-2 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
        <button
          onClick={() => {
            if (mapInstanceRef.current && userLocation) {
              mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
            }
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Center on my location"
        >
          <MapPin className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default SimpleMap;
