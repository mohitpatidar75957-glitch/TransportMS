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
  'Omkareshwar', 'Omkara',
  'Panipat', 'Patna', 'Pithampur', 'Pune',
  'Raipur', 'Rajkot', 'Ranchi', 'Ratlam', 'Rewa', 'Rohtak', 'Rourkela',
  'Sagar', 'Saharanpur', 'Salem', 'Satna', 'Sehore', 'Solapur', 'Surat',
  'Thane', 'Tiruchirappalli', 'Udaipur', 'Ujjain', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam'
];

/**
 * Reusable City Auto-Suggest Component with responsive dropdown,
 * dynamic live OpenStreetMap / Photon geocoding for all India locations,
 * and keyboard support.
 */
export const CitySearchInput = ({
  value,
  onChange,
  placeholder = '',
  onBlur,
  style = {},
  inputStyle = {},
  dropdownStyle = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  const query = (value || '').trim();

  // 1. Static fast match
  const staticMatches = useMemo(() => {
    if (!query) return INDIAN_LOGISTICS_CITIES.slice(0, 10);
    const q = query.toLowerCase();
    return INDIAN_LOGISTICS_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  // 2. Dynamic live geocoding for all India locations (cities, towns, villages, tehsils)
  useEffect(() => {
    if (!query || query.length < 2) {
      setLiveResults([]);
      setIsSearchingLive(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.features) {
            const indiaLocations = data.features
              .filter(f => f.properties && f.properties.countrycode === 'IN')
              .map(f => {
                const p = f.properties;
                const parts = [];
                if (p.name) parts.push(p.name);
                if (p.city && p.city !== p.name) parts.push(p.city);
                else if (p.county && p.county !== p.name) parts.push(p.county);
                if (p.state) parts.push(p.state);
                return parts.join(', ');
              })
              .filter(Boolean);

            // Deduplicate
            const unique = Array.from(new Set(indiaLocations)).slice(0, 8);
            setLiveResults(unique);
          }
        }
      } catch (err) {
        console.warn('Live location lookup error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Combine static and live suggestions seamlessly
  const allSuggestions = useMemo(() => {
    const list = [...staticMatches];
    liveResults.forEach(item => {
      if (!list.includes(item)) {
        list.push(item);
      }
    });
    return list;
  }, [staticMatches, liveResults]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          const val = e.target.value.replace(/(^|\s|[.\-\/])([a-z])/g, (_, boundary, char) => boundary + char.toUpperCase());
          onChange(val);
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
      {isOpen && allSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 999999,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
          maxHeight: '260px',
          overflowY: 'auto',
          ...dropdownStyle
        }}>
          {allSuggestions.map((loc) => (
            <div
              key={loc}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(loc);
                setIsOpen(false);
              }}
              style={{
                padding: '11px 14px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-color)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: '#0984e3', fontSize: '13px' }}>📍</span>
              <span style={{ fontWeight: 500 }}>{loc}</span>
            </div>
          ))}
          {isSearchingLive && (
            <div style={{ padding: '8px 14px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)' }}>
              Searching All India locations...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySearchInput;
