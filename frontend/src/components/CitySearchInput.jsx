import React, { useState, useEffect, useMemo, useRef } from 'react';

// Comprehensive Indian logistics hub cities and industrial transit clusters
export const INDIAN_LOGISTICS_CITIES = [
  'Ahmedabad', 'Agra', 'Ajmer', 'Aligarh', 'Ambala', 'Amravati', 'Amritsar', 'Asansol', 'Aurangabad',
  'Bangalore', 'Bareilly', 'Belgaum', 'Betul', 'Bhilai', 'Bhopal', 'Bhubaneswar', 'Bikaner', 'Burhanpur',
  'Chandigarh', 'Chennai', 'Chhindwara', 'Coimbatore', 'Cuttack',
  'Dehradun', 'Delhi', 'Dewas', 'Dhanbad', 'Dhar', 'Durg',
  'Faridabad', 'Ghaziabad', 'Gwalior', 'Gurugram', 'Guwahati',
  'Haridwar', 'Hoshangabad', 'Hubli', 'Hyderabad',
  'Indore', 'Itarsi', 'Jabalpur', 'Jaipur', 'Jalandhar', 'Jalgaon', 'Jamshedpur', 'Jhansi', 'Jodhpur',
  'Kanpur', 'Khandwa', 'Khargone', 'Kochi', 'Kolhapur', 'Kolkata', 'Kota',
  'Lucknow', 'Ludhiana', 'Madurai', 'Mangalore', 'Mathura', 'Meerut', 'Moradabad', 'Mumbai', 'Muzaffarnagar', 'Muzaffarpur',
  'Nagpur', 'Nanded', 'Nashik', 'Neemuch', 'Noida',
  'Panipat', 'Patna', 'Pithampur', 'Pune',
  'Raipur', 'Rajkot', 'Ranchi', 'Ratlam', 'Rewa', 'Rohtak', 'Rourkela',
  'Sagar', 'Saharanpur', 'Salem', 'Satna', 'Sehore', 'Solapur', 'Surat',
  'Thane', 'Tiruchirappalli', 'Udaipur', 'Ujjain', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam'
];

/**
 * Reusable City Auto-Suggest Component with responsive dropdown,
 * keyboard support and clean styling.
 */
export const CitySearchInput = ({
  value,
  onChange,
  placeholder = 'Type city name...',
  onBlur,
  style = {},
  inputStyle = {},
  dropdownStyle = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = (value || '').trim().toLowerCase();
  const matchedCities = useMemo(() => {
    if (!query) return INDIAN_LOGISTICS_CITIES.slice(0, 15);
    return INDIAN_LOGISTICS_CITIES.filter(c => c.toLowerCase().includes(query)).slice(0, 20);
  }, [query]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onBlur={onBlur}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '10px 0',
          color: 'var(--text-primary, #f1f5f9)',
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: 'none',
          ...inputStyle
        }}
      />
      {isOpen && matchedCities.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 999999,
          background: '#1a2332',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
          maxHeight: '240px',
          overflowY: 'auto',
          ...dropdownStyle
        }}>
          {matchedCities.map((city) => (
            <div
              key={city}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(city);
                setIsOpen(false);
              }}
              style={{
                padding: '9px 14px',
                cursor: 'pointer',
                color: '#dfe6e9',
                fontSize: '0.88rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(9, 132, 227, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: '#0984e3', fontSize: '13px' }}>📍</span>
              <span style={{ fontWeight: 500 }}>{city}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearchInput;
