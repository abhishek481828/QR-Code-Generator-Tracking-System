import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const LocationDebugger = ({ qrCode }) => {
  const [debugInfo, setDebugInfo] = useState({
    hasLocation: false,
    latitude: null,
    longitude: null,
    isTracking: false,
    lastTracked: null,
    historyCount: 0,
    errors: []
  });

  useEffect(() => {
    if (qrCode) {
      const errors = [];
      
      // Check if location exists
      const hasLocation = qrCode.location && 
                         qrCode.location.latitude !== null && 
                         qrCode.location.longitude !== null;
      
      if (!hasLocation) {
        errors.push('No location set for this QR code');
      } else {
        // Validate coordinates
        const lat = parseFloat(qrCode.location.latitude);
        const lng = parseFloat(qrCode.location.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          errors.push('Invalid coordinates: not valid numbers');
        } else {
          if (lat < -90 || lat > 90) {
            errors.push('Invalid latitude: must be between -90 and 90');
          }
          if (lng < -180 || lng > 180) {
            errors.push('Invalid longitude: must be between -180 and 180');
          }
        }
      }
      
      setDebugInfo({
        hasLocation,
        latitude: qrCode.location?.latitude,
        longitude: qrCode.location?.longitude,
        isTracking: qrCode.isTracking,
        lastTracked: qrCode.lastTracked,
        historyCount: qrCode.trackingHistory?.length || 0,
        errors
      });
    }
  }, [qrCode]);

  const testCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success(`Current location: ${position.coords.latitude}, ${position.coords.longitude}`);
          console.log('Current location:', position);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Error getting location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  if (!qrCode) return null;

  return (
    <div style={{ 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '5px', 
      padding: '15px', 
      margin: '10px 0',
      fontSize: '14px'
    }}>
      <h4>Debug Information for QR Code: {qrCode.code}</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <strong>Location Status:</strong>
          <ul>
            <li>Has Location: {debugInfo.hasLocation ? '✅' : '❌'}</li>
            <li>Latitude: {debugInfo.latitude || 'Not set'}</li>
            <li>Longitude: {debugInfo.longitude || 'Not set'}</li>
            <li>Tracking: {debugInfo.isTracking ? '✅ Enabled' : '❌ Disabled'}</li>
            <li>Last Tracked: {debugInfo.lastTracked ? new Date(debugInfo.lastTracked).toLocaleString() : 'Never'}</li>
            <li>History Count: {debugInfo.historyCount}</li>
          </ul>
        </div>
        
        <div>
          <strong>Errors:</strong>
          {debugInfo.errors.length > 0 ? (
            <ul style={{ color: 'red' }}>
              {debugInfo.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'green' }}>No errors found</p>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={testCurrentLocation}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test Current Location
        </button>
      </div>
    </div>
  );
};

export default LocationDebugger;
