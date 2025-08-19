
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import QRScanner from './QRScanner';
import MapComponent from './MapComponent';
import LocationDebugger from './LocationDebugger';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('scan');
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [defaultLocation, setDefaultLocation] = useState({ latitude: '', longitude: '' });
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [manualLocation, setManualLocation] = useState({ latitude: '', longitude: '' });
  const [selectedQRHistory, setSelectedQRHistory] = useState(null);

  useEffect(() => {
    fetchMyQRCodes();
  }, []);

  const fetchMyQRCodes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/qrcode/my-codes');
      setQrCodes(response.data);
    } catch (error) {
      toast.error('Error fetching QR codes');
    }
  };

  const handleQRScan = async (code) => {
    try {
      const response = await axios.post('http://localhost:5000/api/qrcode/scan', { code });
      toast.success(response.data.message);
      fetchMyQRCodes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error scanning QR code');
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('qrImage', file);
      
      const response = await axios.post('http://localhost:5000/api/qrcode/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(response.data.message);
      fetchMyQRCodes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing image');
    }
  };

  const updateQRLocation = async (qrId, lat, lng) => {
    try {
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        toast.error('Invalid coordinates provided');
        return;
      }
      
      if (latitude < -90 || latitude > 90) {
        toast.error('Latitude must be between -90 and 90');
        return;
      }
      
      if (longitude < -180 || longitude > 180) {
        toast.error('Longitude must be between -180 and 180');
        return;
      }
      
      await axios.patch(`http://localhost:5000/api/qrcode/${qrId}/location`, {
        latitude: latitude,
        longitude: longitude
      });
      toast.success('Location updated successfully');
      fetchMyQRCodes();
    } catch (error) {
      console.error('Location update error:', error);
      toast.error(error.response?.data?.message || 'Error updating location');
    }
  };

  const toggleTracking = async (qrId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/qrcode/${qrId}/toggle-tracking`);
      toast.success(response.data.message);
      fetchMyQRCodes();
    } catch (error) {
      toast.error('Error toggling tracking');
    }
  };

  const setDefaultLocationHandler = async () => {
    try {
      await axios.post('http://localhost:5000/api/qrcode/set-default-location', defaultLocation);
      toast.success('Default location set successfully');
    } catch (error) {
      toast.error('Error setting default location');
    }
  };

  const handleManualLocationSubmit = async () => {
    if (!selectedQR || !manualLocation.latitude || !manualLocation.longitude) {
      toast.error('Please enter both latitude and longitude');
      return;
    }
    
    const latitude = parseFloat(manualLocation.latitude);
    const longitude = parseFloat(manualLocation.longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error('Please enter valid numeric coordinates');
      return;
    }
    
    if (latitude < -90 || latitude > 90) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }
    
    if (longitude < -180 || longitude > 180) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }
    
    try {
      await updateQRLocation(selectedQR._id, latitude, longitude);
      setShowLocationForm(false);
      setManualLocation({ latitude: '', longitude: '' });
    } catch (error) {
      toast.error('Error setting manual location');
    }
  };

  const useDefaultLocation = () => {
    if (!defaultLocation.latitude || !defaultLocation.longitude) {
      toast.error('Please set default location first in Settings');
      return;
    }
    setManualLocation({
      latitude: defaultLocation.latitude,
      longitude: defaultLocation.longitude
    });
  };

  const handleSetLocationClick = (qr) => {
    setSelectedQR(qr);
    setShowLocationForm(true);
    setActiveTab('my-codes');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>User Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'scan' ? 'active' : ''}
          onClick={() => setActiveTab('scan')}
        >
          Scan QR Code
        </button>
        <button 
          className={activeTab === 'my-codes' ? 'active' : ''}
          onClick={() => setActiveTab('my-codes')}
        >
          My QR Codes
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Tracking History
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'scan' && (
          <div className="scan-section">
            <h2>Scan QR Code</h2>
            <div className="scan-options">
              <div className="scan-option">
                <h3>Camera Scanner</h3>
                <QRScanner onScan={handleQRScan} />
              </div>
              
              <div className="scan-option">
                <h3>Manual Entry</h3>
                <div className="manual-entry">
                  <input
                    type="text"
                    placeholder="Enter QR code manually"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleQRScan(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="scan-option">
                <h3>Upload Image</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-codes' && (
          <div className="my-codes-section">
            <h2>My QR Codes</h2>
            <div className="qr-codes-grid">
              {qrCodes.map(qr => (
                <div key={qr._id} className="qr-code-card">
                  <div className="qr-image">
                    <img src={qr.qrImage} alt="QR Code" />
                  </div>
                  <div className="qr-info">
                    <h3>{qr.code}</h3>
                    <p>Status: {qr.isActive ? 'Active' : 'Inactive'}</p>
                    <p>Tracking: {qr.isTracking ? 'On' : 'Off'}</p>
                    {qr.location.latitude && (
                      <p>Location: {qr.location.latitude.toFixed(6)}, {qr.location.longitude.toFixed(6)}</p>
                    )}
                  </div>
                  <div className="qr-actions">
                    <button 
                      className="btn btn-small"
                      onClick={() => setSelectedQR(qr)}
                    >
                      Track
                    </button>
                    <button 
                      className="btn btn-small"
                      onClick={() => handleSetLocationClick(qr)}
                    >
                      Set Location
                    </button>
                    <button 
                      className="btn btn-small"
                      onClick={() => toggleTracking(qr._id)}
                    >
                      {qr.isTracking ? 'Stop' : 'Start'} Tracking
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {showLocationForm && selectedQR && (
              <div className="location-form-container">
                <h3>Set Location for: {selectedQR.code}</h3>
                <div className="location-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Latitude</label>
                      <input
                        type="number"
                        placeholder="Enter latitude"
                        value={manualLocation.latitude}
                        onChange={(e) => setManualLocation({
                          ...manualLocation,
                          latitude: e.target.value
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude</label>
                      <input
                        type="number"
                        placeholder="Enter longitude"
                        value={manualLocation.longitude}
                        onChange={(e) => setManualLocation({
                          ...manualLocation,
                          longitude: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={handleManualLocationSubmit}
                    >
                      Set Location
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={useDefaultLocation}
                    >
                      Use Default Location
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setManualLocation({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                              });
                              toast.success('Current location retrieved successfully');
                            },
                            (error) => {
                              console.error('Geolocation error:', error);
                              let errorMessage = 'Error getting current location';                          switch(error.code) {
                            case error.PERMISSION_DENIED:
                              errorMessage = 'Location access denied. Please enable location permissions.';
                              break;
                            case error.POSITION_UNAVAILABLE:
                              errorMessage = 'Location information unavailable.';
                              break;
                            case error.TIMEOUT:
                              errorMessage = 'Location request timed out.';
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
                          toast.error('Geolocation is not supported by this browser');
                        }
                      }}
                    >
                      Use Current Location
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        setShowLocationForm(false);
                        setManualLocation({ latitude: '', longitude: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedQR && !showLocationForm && (
              <div className="map-container">
                <h3>Tracking: {selectedQR.code}</h3>
                <LocationDebugger qrCode={selectedQR} />
                <MapComponent 
                  qrCodes={[selectedQR]}
                  onLocationUpdate={(lat, lng) => updateQRLocation(selectedQR._id, lat, lng)}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h2>Tracking History</h2>
            
            {qrCodes.length === 0 ? (
              <p>No QR codes found. Scan or get assigned a QR code to view tracking history.</p>
            ) : (
              <div className="history-content">
                <div className="qr-selector">
                  <h3>Select QR Code to View History</h3>
                  <div className="qr-codes-grid">
                    {qrCodes.map((qr) => (
                      <div 
                        key={qr._id} 
                        className={`qr-code-card ${selectedQRHistory?._id === qr._id ? 'selected' : ''}`}
                        onClick={() => setSelectedQRHistory(qr)}
                      >
                        <div className="qr-code-info">
                          <h4>{qr.code}</h4>
                          <p>Status: {qr.isActive ? 'Active' : 'Inactive'}</p>
                          <p>Tracking: {qr.isTracking ? 'On' : 'Off'}</p>
                          {qr.lastTracked && (
                            <p>Last tracked: {new Date(qr.lastTracked).toLocaleDateString()}</p>
                          )}
                          {qr.location.latitude && qr.location.longitude && (
                            <p>Current Location: {qr.location.latitude.toFixed(4)}, {qr.location.longitude.toFixed(4)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedQRHistory && (
                  <div className="history-details">
                    <h3>History for QR Code: {selectedQRHistory.code}</h3>
                    
                    <div className="history-stats">
                      <div className="stat-card">
                        <h4>Current Status</h4>
                        <p>Active: {selectedQRHistory.isActive ? 'Yes' : 'No'}</p>
                        <p>Tracking: {selectedQRHistory.isTracking ? 'Enabled' : 'Disabled'}</p>
                        {selectedQRHistory.lastTracked && (
                          <p>Last Update: {new Date(selectedQRHistory.lastTracked).toLocaleString()}</p>
                        )}
                      </div>
                      
                      <div className="stat-card">
                        <h4>Current Location</h4>
                        {selectedQRHistory.location.latitude && selectedQRHistory.location.longitude ? (
                          <div>
                            <p>Latitude: {selectedQRHistory.location.latitude}</p>
                            <p>Longitude: {selectedQRHistory.location.longitude}</p>
                          </div>
                        ) : (
                          <p>No location set</p>
                        )}
                      </div>
                      
                      <div className="stat-card">
                        <h4>Tracking Statistics</h4>
                        <p>Total Updates: {selectedQRHistory.trackingHistory ? selectedQRHistory.trackingHistory.length : 0}</p>
                        <p>Created: {new Date(selectedQRHistory.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {selectedQRHistory.trackingHistory && selectedQRHistory.trackingHistory.length > 0 ? (
                      <div className="tracking-history">
                        <h4>Location History</h4>
                        <div className="history-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Date & Time</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedQRHistory.trackingHistory
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((entry, index) => (
                                <tr key={index}>
                                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                  <td>{entry.latitude}</td>
                                  <td>{entry.longitude}</td>
                                  <td>
                                    <button 
                                      className="btn btn-sm btn-primary"
                                      onClick={() => {
                                        const googleMapsUrl = `https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`;
                                        window.open(googleMapsUrl, '_blank');
                                      }}
                                    >
                                      View on Map
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="no-history">
                        <p>No tracking history available for this QR code.</p>
                        <p>Start by setting a location and enabling tracking.</p>
                      </div>
                    )}

                    {selectedQRHistory.trackingHistory && selectedQRHistory.trackingHistory.length > 0 && (
                      <div className="history-map">
                        <h4>Historical Locations Map</h4>
                        <MapComponent
                          qrCodes={[selectedQRHistory]}
                          onLocationUpdate={() => {}}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Settings</h2>
            <div className="settings-form">
              <div className="form-group">
                <label>Default Location</label>
                <div className="location-inputs">
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={defaultLocation.latitude}
                    onChange={(e) => setDefaultLocation({
                      ...defaultLocation,
                      latitude: e.target.value
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={defaultLocation.longitude}
                    onChange={(e) => setDefaultLocation({
                      ...defaultLocation,
                      longitude: e.target.value
                    })}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={setDefaultLocationHandler}
                  >
                    Set Default
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Get Current Location</label>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setDefaultLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                          });
                          toast.success('Current location retrieved successfully');
                        },
                        (error) => {
                          console.error('Geolocation error:', error);
                          let errorMessage = 'Error getting current location';
                          switch(error.code) {
                            case error.PERMISSION_DENIED:
                              errorMessage = 'Location access denied. Please enable location permissions.';
                              break;
                            case error.POSITION_UNAVAILABLE:
                              errorMessage = 'Location information unavailable.';
                              break;
                            case error.TIMEOUT:
                              errorMessage = 'Location request timed out.';
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
                      toast.error('Geolocation is not supported by this browser');
                    }
                  }}
                >
                  Use Current Location
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
