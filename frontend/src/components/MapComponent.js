import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create custom icons for different marker types
const currentLocationIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const historyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 6.9 12.5 28.5 12.5 28.5s12.5-21.6 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#ff6b6b"/>
      <circle cx="12.5" cy="12.5" r="8" fill="#fff"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = ({ qrCodes, onLocationUpdate }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [center, setCenter] = useState([51.505, -0.09]); // Default to London

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, []);

  // Update center when QR codes have valid locations
  useEffect(() => {
    if (qrCodes && qrCodes.length > 0) {
      const validQRs = qrCodes.filter(qr => 
        qr.location && 
        qr.location.latitude && 
        qr.location.longitude &&
        !isNaN(qr.location.latitude) &&
        !isNaN(qr.location.longitude)
      );
      
      if (validQRs.length > 0) {
        const lastQR = validQRs[validQRs.length - 1];
        setCenter([lastQR.location.latitude, lastQR.location.longitude]);
      }
    }
  }, [qrCodes]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setSelectedPosition(e.latlng);
        if (onLocationUpdate) {
          onLocationUpdate(e.latlng.lat, e.latlng.lng);
        }
      },
    });

    return selectedPosition === null ? null : (
      <Marker position={selectedPosition}>
        <Popup>
          Selected Location: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
        </Popup>
      </Marker>
    );
  };

  // Component to update map center when locations change
  const MapUpdater = ({ center }) => {
    const map = useMap();
    
    useEffect(() => {
      if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
        map.setView(center, 13);
      }
    }, [center, map]);
    
    return null;
  };

  return (
    <div className="map-container" style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} />
        <LocationMarker />
        
        {qrCodes && qrCodes.map(qr => (
          <React.Fragment key={qr._id}>
            {/* Current location marker */}
            {qr.location && 
             qr.location.latitude && 
             qr.location.longitude && 
             !isNaN(qr.location.latitude) && 
             !isNaN(qr.location.longitude) && (
              <Marker
                position={[parseFloat(qr.location.latitude), parseFloat(qr.location.longitude)]}
                icon={currentLocationIcon}
              >
                <Popup>
                  <div>
                    <strong>QR Code: {qr.code}</strong><br />
                    <strong>Current Location</strong><br />
                    Status: {qr.isActive ? 'Active' : 'Inactive'}<br />
                    Tracking: {qr.isTracking ? 'On' : 'Off'}<br />
                    Coordinates: {parseFloat(qr.location.latitude).toFixed(6)}, {parseFloat(qr.location.longitude).toFixed(6)}
                    {qr.lastTracked && (
                      <><br />Last tracked: {new Date(qr.lastTracked).toLocaleString()}</>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Historical location markers */}
            {qr.trackingHistory && qr.trackingHistory.length > 0 && qr.trackingHistory.map((historyPoint, index) => (
              historyPoint.latitude && 
              historyPoint.longitude && 
              !isNaN(historyPoint.latitude) && 
              !isNaN(historyPoint.longitude) && (
                <Marker
                  key={`${qr._id}-history-${index}`}
                  position={[parseFloat(historyPoint.latitude), parseFloat(historyPoint.longitude)]}
                  icon={historyIcon}
                >
                  <Popup>
                    <div>
                      <strong>QR Code: {qr.code}</strong><br />
                      <strong>Historical Location #{index + 1}</strong><br />
                      Recorded: {new Date(historyPoint.timestamp).toLocaleString()}<br />
                      Location: {parseFloat(historyPoint.latitude).toFixed(6)}, {parseFloat(historyPoint.longitude).toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
