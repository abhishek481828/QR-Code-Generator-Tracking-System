// Test script to validate location tracking fixes
const testLocationFunctionality = () => {
  console.log('Testing location tracking functionality...');
  
  // Test 1: Validate coordinates
  const testCoordinates = [
    { lat: 40.7128, lng: -74.0060, valid: true, desc: 'New York City' },
    { lat: 91, lng: 0, valid: false, desc: 'Invalid latitude > 90' },
    { lat: -91, lng: 0, valid: false, desc: 'Invalid latitude < -90' },
    { lat: 0, lng: 181, valid: false, desc: 'Invalid longitude > 180' },
    { lat: 0, lng: -181, valid: false, desc: 'Invalid longitude < -180' },
    { lat: 'invalid', lng: 'invalid', valid: false, desc: 'Non-numeric coordinates' }
  ];
  
  testCoordinates.forEach(coord => {
    const lat = parseFloat(coord.lat);
    const lng = parseFloat(coord.lng);
    
    const isValid = !isNaN(lat) && !isNaN(lng) && 
                   lat >= -90 && lat <= 90 && 
                   lng >= -180 && lng <= 180;
    
    console.log(`${coord.desc}: ${isValid === coord.valid ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  // Test 2: Check geolocation API
  if (navigator.geolocation) {
    console.log('✅ Geolocation API is supported');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Current location retrieved:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.log('❌ Geolocation error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    );
  } else {
    console.log('❌ Geolocation API not supported');
  }
};

// Export for use in browser console
window.testLocationFunctionality = testLocationFunctionality;

console.log('Location tracking test script loaded. Run testLocationFunctionality() to test.');
