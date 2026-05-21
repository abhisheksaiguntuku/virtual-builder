import React, { useState } from 'react';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';

export default function StepLocation({ data, update }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Comprehensive list of major Indian cities
  const cities = [
    'Agra', 'Ahmedabad', 'Ajmer', 'Allahabad', 'Amritsar', 'Aurangabad',
    'Bengaluru', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai', 'Coimbatore',
    'Dehradun', 'Delhi NCR', 'Faridabad', 'Ghaziabad', 'Guwahati', 'Gwalior',
    'Hyderabad', 'Indore', 'Jabalpur', 'Jaipur', 'Jodhpur', 'Kanpur',
    'Kochi', 'Kolkata', 'Kozhikode', 'Lucknow', 'Ludhiana', 'Madurai',
    'Mangaluru', 'Meerut', 'Mumbai', 'Mysuru', 'Nagpur', 'Nashik',
    'Patna', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Surat',
    'Thiruvananthapuram', 'Tiruchirappalli', 'Udaipur', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam', 'Vizianagaram'
  ].sort();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await response.json();
          
          // Extract city/town/district from the address object
          const detectedCity = geoData.address.city || geoData.address.town || geoData.address.district || geoData.address.state_district;
          
          if (detectedCity) {
            // Clean up city name if it contains "City" or "District"
            let cleanCityName = detectedCity.replace(/ City| District/g, '');
            update('city', cleanCityName);
          } else {
            setErrorMsg('Could not determine city from location');
          }
        } catch (error) {
          setErrorMsg('Failed to fetch location details');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setErrorMsg('Location permission denied or unavailable');
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div style={{ textAlign: 'center' }}>
        <MapPin size={48} color="var(--accent-color)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Where are you building?</h3>
        <p>This helps us fetch accurate local material prices and connect you with nearby contractors.</p>
      </div>

      <div className="input-group">
        <label className="input-label">Select your City</label>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            className="input-field" 
            style={{ flex: 1 }}
            value={data.city} 
            onChange={(e) => update('city', e.target.value)}
          >
            <option value="" disabled>Choose a city...</option>
            {/* If detected city is not in the hardcoded list, add it dynamically */}
            {data.city && !cities.includes(data.city) && (
              <option value={data.city}>{data.city} (Detected)</option>
            )}
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          
          <button 
            className="btn btn-outline" 
            onClick={detectLocation}
            disabled={isDetecting}
            style={{ padding: '12px', flexShrink: 0 }}
            title="Detect My Location"
          >
            {isDetecting ? <Loader2 size={20} className="animate-spin" /> : <LocateFixed size={20} color="var(--accent-color)" />}
          </button>
        </div>
        
        {errorMsg && (
          <span style={{ fontSize: '0.875rem', color: 'var(--danger-color)', marginTop: '4px' }}>
            {errorMsg}
          </span>
        )}
      </div>
      
      {data.city && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--success-color)', fontSize: '0.875rem' }}>
          ✓ Local vendor data and material rates optimized for <strong>{data.city}</strong>.
        </div>
      )}
    </div>
  );
}
