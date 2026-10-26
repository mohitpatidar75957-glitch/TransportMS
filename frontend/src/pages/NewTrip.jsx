import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MdMap, MdDirectionsCar, MdPerson, MdDateRange, 
  MdLocationOn, MdAdd, MdClose, MdLocalGasStation, 
  MdAttachMoney, MdSearch, MdCheckCircle, MdArrowForward, MdInventory,
  MdTrendingUp, MdAddRoad
} from 'react-icons/md';
import './NewTrip.css';
import { 
  isValidGST, 
  isValidPhone, 
  isValidName, 
  sanitizeNameInput, 
  sanitizeDigitsOnly, 
  sanitizeAlphaNumericUpper 
} from '../utils/validationUtils';

// Standard Indian logistics hub cities including key MP & Interstate transport junctions
const INDIAN_LOGISTICS_CITIES = [
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

// Interactive City Autocomplete Component with custom dropdown suggestions
const CitySearchInput = ({ value, onChange, placeholder, onBlur, hasError, errorBorderColor }) => {
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
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
          padding: '12px 0',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: 'none'
        }}
      />
      {isOpen && matchedCities.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: -12,
          right: -12,
          zIndex: 999999,
          background: '#1a2332',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
          maxHeight: '260px',
          overflowY: 'auto'
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
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#dfe6e9',
                fontSize: '0.9rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(9, 132, 227, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: '#0984e3' }}>📍</span>
              <span>{city}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom dropdown — always opens downward, scrollable, theme-safe
const CustomSelect = ({ options, value, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(p => !p)}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: `1.5px solid ${isOpen ? '#0984e3' : 'rgba(255, 255, 255, 0.1)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(9,132,227,0.12)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          userSelect: 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : <span style={{ opacity: 0.5 }}>{placeholder}</span>}
        </span>
        <span style={{
          fontSize: '0.75rem',
          opacity: 0.7,
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
          marginLeft: '8px',
          flexShrink: 0
        }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 99999,
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          maxHeight: '260px',
          overflowY: 'auto',
        }}>
          <div
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(9,132,227,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {placeholder}
          </div>
          {options.map(opt => {
            const isSel = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  color: isSel ? '#74b9ff' : '#dfe6e9',
                  background: isSel ? 'rgba(9,132,227,0.18)' : 'transparent',
                  fontWeight: isSel ? 600 : 400,
                  fontSize: '0.95rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >
                {isSel && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#74b9ff', flexShrink: 0 }} />}
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const VehicleSelect = ({ vehicles, value, onChange, placeholder = 'Select Vehicle', cargoWeight = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterSuitableOnly, setFilterSuitableOnly] = useState(false);
  const ref = useRef(null);
  const selected = vehicles.find(v => String(v.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parseCapacityNum = (cap) => {
    if (!cap) return 10.0;
    const num = parseFloat(String(cap).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 10.0 : num;
  };

  const getStatusText = (v) => {
    if (!v) return '';
    if ((v.status || 'Active') === 'Active' || (v.status || '').toLowerCase() === 'available') {
      return 'Available';
    }
    if (v.status === 'In Maintenance') {
      return 'In Maintenance';
    }
    if (v.returnDate) {
      return `Currently on a trip (back ${v.returnDate})`;
    }
    return v.status || 'Unavailable';
  };

  const formatCapacityText = (cap) => {
    if (!cap) return '10 Ton';
    const str = String(cap).trim();
    if (str.toLowerCase().includes('ton')) return str;
    return `${str} Ton`;
  };

  const formatSelectedText = (v) => {
    if (!v) return '';
    const cap = formatCapacityText(v.capacity);
    const status = getStatusText(v);
    const capNum = parseCapacityNum(v.capacity);
    let fitTag = '';
    if (cargoWeight && cargoWeight > 0) {
      if (capNum < cargoWeight) fitTag = ' ⚠️ Under Capacity';
      else {
        const util = Math.round((cargoWeight / capNum) * 100);
        fitTag = ` (${util}% utilized)`;
      }
    }
    return `${v.registrationNumber} — ${cap} — ${status}${fitTag}`;
  };

  // Sort and filter vehicles based on cargo weight
  const processedVehicles = useMemo(() => {
    let list = [...vehicles];
    const weightNum = parseFloat(cargoWeight);

    if (weightNum && weightNum > 0) {
      if (filterSuitableOnly) {
        list = list.filter(v => parseCapacityNum(v.capacity) >= weightNum);
      }

      // Sort: Best fit (smallest surplus capacity that can carry the load) first
      list.sort((a, b) => {
        const capA = parseCapacityNum(a.capacity);
        const capB = parseCapacityNum(b.capacity);
        const canCarryA = capA >= weightNum;
        const canCarryB = capB >= weightNum;

        if (canCarryA && !canCarryB) return -1;
        if (!canCarryA && canCarryB) return 1;

        if (canCarryA && canCarryB) {
          // Both can carry: prefer truck closest to cargo weight (e.g. 16T or 20T before 49T for a 15T load)
          return (capA - weightNum) - (capB - weightNum);
        }
        // Both under capacity: larger truck first
        return capB - capA;
      });
    }

    return list;
  }, [vehicles, cargoWeight, filterSuitableOnly]);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(p => !p)}
        style={{
          width: '100%', padding: '12px 16px', 
          backgroundColor: 'var(--bg-secondary)',
          border: `1.5px solid ${isOpen ? '#2563eb' : 'var(--border-color)'}`,
          borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s', userSelect: 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? formatSelectedText(selected) : <span style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>{placeholder}</span>}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 99999,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)', maxHeight: '360px', overflowY: 'auto',
        }}>
          {cargoWeight && parseFloat(cargoWeight) > 0 && (
            <div style={{
              padding: '10px 14px', background: 'rgba(37, 99, 235, 0.08)',
              borderBottom: '1px solid var(--border-color)', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                ⚖️ Cargo: {cargoWeight} Ton — Sorted by Capacity Fit
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFilterSuitableOnly(p => !p); }}
                style={{
                  fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px',
                  background: filterSuitableOnly ? '#2563eb' : 'var(--bg-surface)',
                  color: filterSuitableOnly ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 600
                }}
              >
                {filterSuitableOnly ? '✓ Only ≥ ' + cargoWeight + 'T' : 'Show All'}
              </button>
            </div>
          )}

          {processedVehicles.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No vehicles found matching {cargoWeight} Ton capacity.
            </div>
          ) : (
            processedVehicles.map((v, index) => {
              const isSel = String(v.id) === String(value);
              const isAvailable = (v.status || 'Active') === 'Active' || (v.status || '').toLowerCase() === 'available';
              const capacityText = formatCapacityText(v.capacity);
              const capNum = parseCapacityNum(v.capacity);
              const statusLabel = getStatusText(v);
              const statusColor = isAvailable ? '#10b981' : (v.status === 'In Maintenance' ? '#f59e0b' : '#ef4444');

              const weightNum = parseFloat(cargoWeight);
              const hasWeight = weightNum && weightNum > 0;
              const isUnderCapacity = hasWeight && capNum < weightNum;
              const utilPct = hasWeight ? Math.min(100, Math.round((weightNum / capNum) * 100)) : 0;
              const isBestFit = hasWeight && !isUnderCapacity && index === 0;

              return (
                <div
                  key={v.id}
                  onClick={() => { if(isAvailable) { onChange(v.id); setIsOpen(false); } }}
                  style={{
                    padding: '12px 16px', cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? (isUnderCapacity ? 0.7 : 1) : 0.5,
                    background: isSel ? 'rgba(37, 99, 235, 0.12)' : (isBestFit ? 'rgba(16, 185, 129, 0.08)' : 'transparent'),
                    borderTop: index === 0 ? 'none' : '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}
                  onMouseEnter={e => { if (isAvailable && !isSel) e.currentTarget.style.background = 'var(--hover-color)'; }}
                  onMouseLeave={e => { if (isAvailable && !isSel) e.currentTarget.style.background = isBestFit ? 'rgba(16, 185, 129, 0.08)' : 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: isSel ? '#2563eb' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {v.registrationNumber} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>— {capacityText}</span>
                      </span>
                      {isBestFit && (
                        <span style={{
                          fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700
                        }}>
                          🎯 BEST FIT
                        </span>
                      )}
                      {isUnderCapacity && (
                        <span style={{
                          fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 700
                        }}>
                          ⚠️ Too Small ({capNum}T &lt; {weightNum}T)
                        </span>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: statusColor, 
                      backgroundColor: `rgba(${isAvailable ? '16, 185, 129' : (v.status === 'In Maintenance' ? '245, 158, 11' : '239, 68, 68')}, 0.12)`, 
                      padding: '3px 9px', 
                      borderRadius: '12px',
                      border: `1px solid rgba(${isAvailable ? '16, 185, 129' : (v.status === 'In Maintenance' ? '245, 158, 11' : '239, 68, 68')}, 0.25)`
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>{v.name ? `${v.name} (${v.type || v.vehicleType || 'Truck'})` : (v.type || v.vehicleType || 'Truck')}</span>
                    {hasWeight && !isUnderCapacity ? (
                      <span style={{ color: utilPct >= 70 ? '#10b981' : '#2563eb', fontWeight: 600 }}>
                        {utilPct}% Load Capacity Utilized
                      </span>
                    ) : (
                      <span>Avg: {v.mileage ? `${v.mileage} KM/L` : '10 KM/L'}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const NewTrip = () => {
  // DB Data State
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Trip Details State
  const [vehicleId, setVehicleId] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleTelemetry, setVehicleTelemetry] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);

  // Inline Validation State
  const [errors, setErrors] = useState({});

  const getVehicleCapacityTons = (v) => {
    if (!v || !v.capacity) return null;
    const num = parseFloat(String(v.capacity).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  };

  const convertWeightToTons = (weightVal, unit) => {
    const w = parseFloat(weightVal);
    if (isNaN(w) || w <= 0) return 0;
    if (unit === 'Kg') return w / 1000;
    return w; // Ton or MT
  };

  const validateWeightField = (weightVal, unitVal, currentVehicle) => {
    if (!weightVal && weightVal !== 0 && weightVal !== '0') return '';
    const val = parseFloat(weightVal);
    if (isNaN(val) || val < 0) return '⚠️ Weight cannot be negative';

    const vehicleCap = getVehicleCapacityTons(currentVehicle || selectedVehicle);
    if (vehicleCap && vehicleCap > 0) {
      const weightInTons = convertWeightToTons(val, unitVal || weightUnit);
      if (weightInTons > vehicleCap) {
        return `⚠️ Cargo weight (${val} ${unitVal || weightUnit}) exceeds vehicle capacity (${vehicleCap} Ton)`;
      }
    }
    return '';
  };

  const validateField = (fieldName, fieldValue, optUnit = null, optVehicle = null) => {
    let errorMsg = '';
    
    if (fieldName === 'vehicleId') {
      if (!fieldValue) errorMsg = '⚠️ Please select an available vehicle';
    }
    if (fieldName === 'driverId') {
      if (!fieldValue) errorMsg = '⚠️ Please select a driver';
    }
    if (fieldName === 'startLocation') {
      if (!fieldValue || !fieldValue.trim()) errorMsg = '⚠️ Start location is required';
    }
    if (fieldName === 'destination') {
      if (!fieldValue || !fieldValue.trim()) errorMsg = '⚠️ Destination is required';
    }
    if (fieldName === 'mileage') {
      const val = parseFloat(fieldValue);
      if (!fieldValue && fieldValue !== 0 && fieldValue !== '0') {
        errorMsg = '⚠️ Mileage is required';
      } else if (isNaN(val) || val <= 0) {
        errorMsg = '⚠️ Mileage must be a positive number';
      } else if (val > 40) {
        errorMsg = '⚠️ Mileage seems too high — please enter a realistic number (e.g. 1–40 km/l)';
      }
    }
    if (fieldName === 'fuelPrice') {
      const val = parseFloat(fieldValue);
      if (!fieldValue && fieldValue !== 0 && fieldValue !== '0') {
        errorMsg = '⚠️ Fuel price is required';
      } else if (isNaN(val) || val <= 0) {
        errorMsg = '⚠️ Fuel price must be greater than 0';
      }
    }
    if (fieldName === 'manualFreightRate') {
      const val = parseFloat(fieldValue);
      if (!fieldValue && fieldValue !== 0 && fieldValue !== '0') {
        errorMsg = '⚠️ Freight rate / Expected earnings is required';
      } else if (isNaN(val) || val <= 0) {
        errorMsg = '⚠️ Freight rate must be greater than 0';
      }
    }
    if (fieldName === 'weight') {
      errorMsg = validateWeightField(fieldValue, optUnit, optVehicle);
    }

    setErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[fieldName] = errorMsg;
      } else {
        delete updated[fieldName];
      }
      return updated;
    });

    return errorMsg;
  };

  const validateAllFields = () => {
    const newErrors = {};

    if (!vehicleId) newErrors.vehicleId = '⚠️ Please select an available vehicle';
    if (!driverId) newErrors.driverId = '⚠️ Please select a driver';
    if (!startLocation || !startLocation.trim()) newErrors.startLocation = '⚠️ Start location is required';
    if (!destination || !destination.trim()) newErrors.destination = '⚠️ Destination is required';

    const mileageVal = parseFloat(mileage);
    if (!mileage && mileage !== 0 && mileage !== '0') {
      newErrors.mileage = '⚠️ Mileage is required';
    } else if (isNaN(mileageVal) || mileageVal <= 0) {
      newErrors.mileage = '⚠️ Mileage must be a positive number';
    } else if (mileageVal > 40) {
      newErrors.mileage = '⚠️ Mileage seems too high — please enter a realistic number (e.g. 1–40 km/l)';
    }

    const fuelPriceVal = parseFloat(fuelPrice);
    if (!fuelPrice && fuelPrice !== 0 && fuelPrice !== '0') {
      newErrors.fuelPrice = '⚠️ Fuel price is required';
    } else if (isNaN(fuelPriceVal) || fuelPriceVal <= 0) {
      newErrors.fuelPrice = '⚠️ Fuel price must be greater than 0';
    }

    const freightVal = parseFloat(manualFreightRate);
    if (!manualFreightRate && manualFreightRate !== 0 && manualFreightRate !== '0') {
      newErrors.manualFreightRate = '⚠️ Freight rate / Expected earnings is required';
    } else if (isNaN(freightVal) || freightVal <= 0) {
      newErrors.manualFreightRate = '⚠️ Freight rate must be greater than 0';
    }

    const weightErr = validateWeightField(weight, weightUnit, selectedVehicle);
    if (weightErr) {
      newErrors.weight = weightErr;
    }

    if (consignorName && !isValidName(consignorName)) {
      newErrors.consignorName = '⚠️ Consignor name must only contain letters and spaces';
    }

    if (consignorGST && !isValidGST(consignorGST)) {
      newErrors.consignorGST = '⚠️ Invalid Consignor GST (15 alphanumeric characters required)';
    }

    if (consignorContact && !isValidPhone(consignorContact, true)) {
      newErrors.consignorContact = '⚠️ Enter a valid 10-digit mobile number for Consignor';
    }

    if (consigneeName && !isValidName(consigneeName)) {
      newErrors.consigneeName = '⚠️ Consignee name must only contain letters and spaces';
    }

    if (consigneeGST && !isValidGST(consigneeGST)) {
      newErrors.consigneeGST = '⚠️ Invalid Consignee GST (15 alphanumeric characters required)';
    }

    if (consigneeContact && !isValidPhone(consigneeContact, true)) {
      newErrors.consigneeContact = '⚠️ Enter a valid 10-digit mobile number for Consignee';
    }

    setErrors(newErrors);
    return newErrors;
  };


  // Route Details State
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState([]);
  
  // Cargo Details State
  const [goodsType, setGoodsType] = useState('');
  const [selectedConsignorId, setSelectedConsignorId] = useState('');
  const [selectedConsigneeId, setSelectedConsigneeId] = useState('');
  const [clientName, setClientName] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // ETA & Past Trips Delivery Estimation State
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [estimatingDelivery, setEstimatingDelivery] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState(0);
  
  const handleConsignorSelect = (e) => {
    const id = e.target.value;
    setSelectedConsignorId(id);
    if (!id) return;
    
    const cust = customers.find(c => c.id.toString() === id);
    if (cust) {
      setClientName(cust.companyName || cust.name || ''); // Default Client is Sender
      setConsignorName(cust.companyName || cust.name || '');
      setConsignorContact(cust.phone || '');
      setConsignorGST(cust.gstNumber || '');
      setPickupAddress(cust.address || '');
    }
  };

  const handleConsigneeSelect = (e) => {
    const id = e.target.value;
    setSelectedConsigneeId(id);
    if (!id) return;
    
    const cust = customers.find(c => c.id.toString() === id);
    if (cust) {
      setConsigneeName(cust.companyName || cust.name || '');
      setConsigneeContact(cust.phone || '');
      setConsigneeGST(cust.gstNumber || '');
      setDeliveryAddress(cust.address || '');
    }
  };
  
  // Consignor / Consignee & LR Details
  const [consignorName, setConsignorName] = useState('');
  const [consignorGST, setConsignorGST] = useState('');
  const [consignorContact, setConsignorContact] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [consigneeGST, setConsigneeGST] = useState('');
  const [consigneeContact, setConsigneeContact] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('Ton');
  const [gstPercent, setGstPercent] = useState('');
  const [biltyCharge, setBiltyCharge] = useState('');
  const [loadingCharge, setLoadingCharge] = useState('');
  
  // Cost Estimation State
  const [fuelPrice, setFuelPrice] = useState(0); // Will be updated dynamically
  const [startFuelPrice, setStartFuelPrice] = useState(0);
  const [destFuelPrice, setDestFuelPrice] = useState(0);
  const [refuelRecommendation, setRefuelRecommendation] = useState(null);
  const [mileage, setMileage] = useState('');
  const [driverExpense, setDriverExpense] = useState(0);
  const [foodExpense, setFoodExpense] = useState(0);
  const [parkingExpense, setParkingExpense] = useState(0);
  const [otherExpense, setOtherExpense] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [manualFreightRate, setManualFreightRate] = useState('');

  // Results State
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [selectedRouteType, setSelectedRouteType] = useState(null);
  const [tripCreated, setTripCreated] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapRouteData, setMapRouteData] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [createdTripNum, setCreatedTripNum] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/v1/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to fetch vehicles:', err);
        setVehicles([]);
      });
      
    fetch('/api/v1/fleet/drivers')
      .then(res => res.json())
      .then(data => setDrivers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to fetch drivers:', err);
        setDrivers([]);
      });
      
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data.filter(u => u.role === 'CUSTOMER'));
        }
      })
      .catch(err => console.error('Failed to fetch customers:', err));
  }, []);

  // Update vehicle details and mileage when vehicle changes
  useEffect(() => {
    if (vehicleId) {
      const v = vehicles.find(v => String(v.id) === String(vehicleId));
      setSelectedVehicle(v);
      if (v) {
        setMileage(v.mileage != null && v.mileage > 0 ? v.mileage : 10);
      }

      // Fetch Telemetry Data
      setTelemetryLoading(true);
      fetch(`/api/v1/fleet/vehicles/${vehicleId}/telemetry`)
        .then(res => res.json())
        .then(data => {
          setVehicleTelemetry(data);
          setTelemetryLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch telemetry", err);
          setVehicleTelemetry(null);
          setTelemetryLoading(false);
        });

    } else {
      setSelectedVehicle(null);
      setVehicleTelemetry(null);
      setMileage('');
    }
  }, [vehicleId, vehicles]);

  // Autosave Draft functionality
  useEffect(() => {
    const draftData = {
      vehicleId, driverId, tripDate, startLocation, destination, stops,
      goodsType, clientName, dispatchDate, expectedDeliveryDate, pickupAddress, deliveryAddress,
      consignorName, consignorGST, consignorContact, consigneeName, consigneeGST, consigneeContact,
      weight, weightUnit, gstPercent, biltyCharge, loadingCharge,
      fuelPrice, mileage, driverExpense, foodExpense, parkingExpense, otherExpense, advanceAmount
    };
    
    // Don't save if everything is practically empty (to avoid overwriting with empty)
    if (vehicleId || startLocation || destination || goodsType) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('tms_new_trip_draft', JSON.stringify(draftData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    vehicleId, driverId, tripDate, startLocation, destination, stops,
    goodsType, clientName, dispatchDate, expectedDeliveryDate, pickupAddress, deliveryAddress,
    consignorName, consignorGST, consignorContact, consigneeName, consigneeGST, consigneeContact,
    weight, weightUnit, gstPercent, biltyCharge, loadingCharge,
    fuelPrice, mileage, driverExpense, foodExpense, parkingExpense, otherExpense, advanceAmount
  ]);

  // Load Draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('tms_new_trip_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.vehicleId) setVehicleId(parsed.vehicleId);
        if (parsed.driverId) setDriverId(parsed.driverId);
        if (parsed.tripDate) setTripDate(parsed.tripDate);
        if (parsed.startLocation) setStartLocation(parsed.startLocation);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.stops) setStops(parsed.stops);
        if (parsed.goodsType) setGoodsType(parsed.goodsType);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.dispatchDate) setDispatchDate(parsed.dispatchDate);
        if (parsed.expectedDeliveryDate) setExpectedDeliveryDate(parsed.expectedDeliveryDate);
        if (parsed.pickupAddress) setPickupAddress(parsed.pickupAddress);
        if (parsed.deliveryAddress) setDeliveryAddress(parsed.deliveryAddress);
        if (parsed.consignorName) setConsignorName(parsed.consignorName);
        if (parsed.consignorGST) setConsignorGST(parsed.consignorGST);
        if (parsed.consignorContact) setConsignorContact(parsed.consignorContact);
        if (parsed.consigneeName) setConsigneeName(parsed.consigneeName);
        if (parsed.consigneeGST) setConsigneeGST(parsed.consigneeGST);
        if (parsed.consigneeContact) setConsigneeContact(parsed.consigneeContact);
        if (parsed.weight) setWeight(parsed.weight);
        if (parsed.weightUnit) setWeightUnit(parsed.weightUnit);
        if (parsed.gstPercent) setGstPercent(parsed.gstPercent);
        if (parsed.biltyCharge) setBiltyCharge(parsed.biltyCharge);
        if (parsed.loadingCharge) setLoadingCharge(parsed.loadingCharge);
        if (parsed.fuelPrice) setFuelPrice(parsed.fuelPrice);
        if (parsed.mileage) setMileage(parsed.mileage);
        if (parsed.driverExpense) setDriverExpense(parsed.driverExpense);
        if (parsed.foodExpense) setFoodExpense(parsed.foodExpense);
        if (parsed.parkingExpense) setParkingExpense(parsed.parkingExpense);
        if (parsed.otherExpense) setOtherExpense(parsed.otherExpense);
        if (parsed.advanceAmount) setAdvanceAmount(parsed.advanceAmount);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Keyboard Shortcuts functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + S or Cmd + S to trigger Find Routes (Save/Calculate)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser save dialog
        if (!tripCreated && !loading) {
          document.getElementById('find-routes-btn')?.click(); // Safest way without complex dependency array
        }
      }
      
      // Escape to clear form / draft (if no modal is open)
      if (e.key === 'Escape' && !showMapModal && !tripCreated) {
        if (window.confirm("Are you sure you want to clear the form? All unsaved data will be lost.")) {
           localStorage.removeItem('tms_new_trip_draft');
           window.location.reload();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tripCreated, loading, showMapModal]);

  // Lock body scroll when map modal is open to prevent Google Maps "Ctrl+Scroll" overlay
  useEffect(() => {
    if (showMapModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showMapModal]);

  // Fetch fuel prices when locations change (Debounced)
  useEffect(() => {
    const fetchPrices = async () => {
      if (startLocation) {
        try {
          const res = await fetch(`/api/v1/fuel/price?city=${encodeURIComponent(startLocation)}`);
          const data = await res.json();
          setStartFuelPrice(data.price);
          // Set primary fuel price as start location by default
          setFuelPrice(data.price);
        } catch (e) {
          console.error("Failed to fetch start fuel price", e);
        }
      }
      if (destination) {
        try {
          const res = await fetch(`/api/v1/fuel/price?city=${encodeURIComponent(destination)}`);
          const data = await res.json();
          setDestFuelPrice(data.price);
        } catch (e) {
          console.error("Failed to fetch dest fuel price", e);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPrices();
    }, 1000); // 1s debounce

    return () => clearTimeout(timeoutId);
  }, [startLocation, destination]);

  // Fetch Delivery Time Estimate based on Past Trips data (Debounced)
  useEffect(() => {
    if (!startLocation || !destination) {
      setDeliveryEstimate(null);
      setLiveDistanceKm(0);
      return;
    }

    const timer = setTimeout(async () => {
      setEstimatingDelivery(true);
      const sDate = dispatchDate || tripDate || new Date().toISOString().split('T')[0];
      const vehQuery = vehicleId ? `&vehicleId=${vehicleId}` : '';
      
      let calculatedDist = 0;
      try {
        const getCoord = async (city) => {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
          const data = await res.json();
          return (data && data.length > 0) ? { lat: data[0].lat, lon: data[0].lon } : null;
        };
        const c1 = await getCoord(startLocation);
        const c2 = await getCoord(destination);
        if (c1 && c2) {
          const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${c1.lon},${c1.lat};${c2.lon},${c2.lat}?overview=false`);
          const osrmData = await osrmRes.json();
          if (osrmData?.routes?.[0]?.distance) {
            calculatedDist = Math.round(osrmData.routes[0].distance / 1000);
          }
        }
      } catch (err) {
        console.warn('Fast distance lookup error:', err);
      }

      if (calculatedDist > 0) {
        setLiveDistanceKm(calculatedDist);
      }

      const distParam = calculatedDist > 0 ? `&distanceKm=${calculatedDist}` : '';

      fetch(`/api/trips/estimate-delivery-time?origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(destination)}&startDate=${sDate}${vehQuery}${distParam}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.estimatedDeliveryDate) {
            setDeliveryEstimate(data);
            if (data.distanceKm && !calculatedDist) {
              setLiveDistanceKm(data.distanceKm);
            }
            // If user hasn't explicitly set expectedDeliveryDate or it is empty, pre-fill with smart suggestion
            if (!expectedDeliveryDate) {
              setExpectedDeliveryDate(data.estimatedDeliveryDate);
            }
          }
        })
        .catch(err => {
          console.error('Failed to estimate delivery time:', err);
        })
        .finally(() => setEstimatingDelivery(false));
    }, 800);

    return () => clearTimeout(timer);
  }, [startLocation, destination, dispatchDate, tripDate, vehicleId]);

  // Stop Handlers
  const addStop = () => {
    setStops([...stops, { id: Date.now(), location: '' }]);
  };

  const removeStop = (id) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const updateStopLocation = (id, location) => {
    setStops(stops.map(stop => stop.id === id ? { ...stop, location } : stop));
  };

  const handleFindRoutes = async () => {
    // Comprehensive field-level validation
    const fieldErrObj = validateAllFields();
    if (Object.keys(fieldErrObj).length > 0) {
      // Auto-scroll to the first field with an error
      const firstErrorKey = Object.keys(fieldErrObj)[0];
      setTimeout(() => {
        const errorElem = document.querySelector(`[data-field="${firstErrorKey}"]`);
        if (errorElem) {
          errorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setLoading(true);
    
    // Geocoding helper
    const getCoordinates = async (city) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (data && data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
      } catch (e) {
        console.error('Geocoding error:', e);
      }
      return null;
    };

    let distanceBase = 0;
    const startCoords = await getCoordinates(startLocation);
    const destCoords = await getCoordinates(destination);

    if (startCoords && destCoords) {
      try {
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords.lon},${startCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`);
        const osrmData = await osrmRes.json();
        if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
           distanceBase = Math.round(osrmData.routes[0].distance / 1000);
        }
      } catch (e) {
        console.error('OSRM error:', e);
      }
    }

    if (distanceBase === 0) {
      // Fallback
      const locationString = startLocation + destination;
      let hash = 0;
      for (let i = 0; i < locationString.length; i++) hash = ((hash << 5) - hash) + locationString.charCodeAt(i);
      distanceBase = Math.abs(hash) % 1500 + 50;
    }

    const baseMileage = parseFloat(mileage);
    const fPrice = parseFloat(fuelPrice); // Use start location's price as base calculation
    
    // Generate Refuel Recommendation
    if (distanceBase > 0 && baseMileage > 0 && startFuelPrice > 0 && destFuelPrice > 0) {
      const fuelNeededToReach = (distanceBase / baseMileage).toFixed(2);
      
      if (startFuelPrice < destFuelPrice) {
        const diff = (destFuelPrice - startFuelPrice).toFixed(2);
        setRefuelRecommendation({
          type: 'START_CHEAPER',
          message: `Fuel is cheaper at the start location by ₹${diff}/L. Recommend filling up the tank completely here.`,
          icon: <MdLocalGasStation style={{ color: '#2ecc71' }} />
        });
      } else if (destFuelPrice < startFuelPrice) {
         const diff = (startFuelPrice - destFuelPrice).toFixed(2);
         setRefuelRecommendation({
          type: 'DEST_CHEAPER',
          message: `Fuel is cheaper at destination by ₹${diff}/L. Recommend filling only ${fuelNeededToReach}L to reach there, and refuel the rest at destination.`,
          icon: <MdLocalGasStation style={{ color: '#f39c12' }} />
        });
      } else {
         setRefuelRecommendation({
          type: 'SAME',
          message: `Fuel prices are identical at both locations. Refuel wherever convenient.`,
          icon: <MdLocalGasStation style={{ color: '#3498db' }} />
        });
      }
    } else {
      setRefuelRecommendation(null);
    }
    
    const calcCost = (dist, mlg, tollLevel) => {
      const fReq = dist / mlg;
      const fCost = fReq * fPrice;
      
      let tolls = 0;
      if (tollLevel === 'HIGH') tolls = Math.max(150, Math.floor(dist / 100) * 150);
      else if (tollLevel === 'LOW') tolls = Math.max(80, Math.floor(dist / 100) * 80);
      else tolls = 0; // ECONOMY = no tolls

      const baseExtra = (parseFloat(driverExpense) || 0) + (parseFloat(foodExpense) || 0) + (parseFloat(parkingExpense) || 0) + (parseFloat(otherExpense) || 0) + (parseFloat(biltyCharge) || 0) + (parseFloat(loadingCharge) || 0);
      return {
        distance: dist,
        fuelReq: fReq.toFixed(2),
        fuelCost: Math.round(fCost),
        toll: tolls,
        total: Math.round(fCost + tolls + baseExtra)
      };
    };

    const best = calcCost(distanceBase, baseMileage, 'HIGH');
    const normal = calcCost(distanceBase + Math.floor(distanceBase * 0.05), baseMileage * 1.08, 'LOW');
    const economy = calcCost(distanceBase + Math.floor(distanceBase * 0.10), baseMileage * 1.15, 'NONE'); 

    // Fetch Auto Freight from Backend if manual rate not typed
    let autoFreight = parseFloat(manualFreightRate) || 0;
    if (autoFreight === 0) {
      try {
        const vType = selectedVehicle ? selectedVehicle.vehicleType : 'Truck';
        const res = await fetch(`/api/trips/auto-freight?origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(destination)}&vehicleType=${encodeURIComponent(vType)}`);
        if (res.ok) {
          const fetchedRate = await res.json();
          if (fetchedRate > 0) {
            autoFreight = fetchedRate;
            setManualFreightRate(fetchedRate.toString());
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (autoFreight === 0) {
      setValidationError("No Freight Rate set! Please enter Freight Rate (Trip Earnings) in the Cost Estimation section or create a Rate Card.");
      setLoading(false);
      return;
    }

    const gstPctRate = parseFloat(gstPercent) || 0;
    const calcGstAmt = (autoFreight * gstPctRate) / 100;

    const addMargin = (route) => {
      // Net In-Hand Margin = Freight - (All Expenses + Hamali + Bilty) - GST
      const margin = Math.round(autoFreight - route.total - calcGstAmt);
      const marginPct = autoFreight > 0 ? ((margin / autoFreight) * 100).toFixed(2) : '0.00';
      return {
        ...route,
        freightAmount: autoFreight,
        gstDeduction: calcGstAmt,
        expectedMargin: margin,
        marginPercentage: marginPct
      };
    };

    const generatedRoutes = [
      { type: 'BEST', title: 'BEST ROUTE', badge: '🥇', time: `${Math.floor(best.distance / 55)}h ${Math.floor((best.distance % 55) * (60/55))}m`, tolls: Math.floor(best.toll / 150), ...addMargin(best) },
      { type: 'NORMAL', title: 'NORMAL ROUTE', badge: '⚡', time: `${Math.floor(normal.distance / 50)}h ${Math.floor((normal.distance % 50) * (60/50))}m`, tolls: Math.floor(normal.toll / 80), ...addMargin(normal) },
      { type: 'ECONOMY', title: 'ECONOMY ROUTE', badge: '💰', time: `${Math.floor(economy.distance / 45)}h ${Math.floor((economy.distance % 45) * (60/45))}m`, tolls: 0, ...addMargin(economy) }
    ];

    // Rank routes by highest margin percentage (Point 5)
    generatedRoutes.sort((a, b) => b.marginPercentage - a.marginPercentage);

    setRoutes(generatedRoutes);
    setLoading(false);
  };

  const openMap = (route) => {
    setMapRouteData(route);
    setShowMapModal(true);
  };

  const handleCreateTrip = async () => {
    const tripNumber = `TRP-${Math.floor(10000 + Math.random() * 90000)}`;
    const selectedRoute = routes.find(r => r.type === selectedRouteType);
    const cost = selectedRoute ? selectedRoute.total : 0;
    const freightAmount = parseFloat(manualFreightRate) || (selectedRoute ? selectedRoute.freightAmount : 0);
    const expectedMargin = selectedRoute ? (freightAmount - cost) : 0;
    const gstPct = parseFloat(gstPercent) || 0;
    const gstAmt = (freightAmount * gstPct) / 100;

    const payload = {
      tripNumber: tripNumber,
      vehicle: { id: parseInt(vehicleId) },
      driver: { id: parseInt(driverId) },
      route: `${startLocation} → ${destination}`,
      startDate: tripDate,
      status: 'Scheduled',
      freightAmount: freightAmount,
      expectedRevenue: freightAmount,
      expectedMargin: expectedMargin,
      advanceAmount: advanceAmount,
      distance: selectedRoute ? selectedRoute.distance : 0,
      goodsType: goodsType,
      clientName: clientName || consignorName || 'Client',
      customerContact: consignorContact || consigneeContact || '',
      dispatchDate: dispatchDate || tripDate,
      expectedDeliveryDate: expectedDeliveryDate || '',
      pickupAddress: pickupAddress || (startLocation ? `${startLocation} Logistics Hub` : ''),
      deliveryAddress: deliveryAddress || (destination ? `${destination} Receiving Hub` : ''),
      consignorName: consignorName || clientName,
      consignorGST: consignorGST,
      consignorContact: consignorContact,
      consigneeName: consigneeName,
      consigneeGST: consigneeGST,
      consigneeContact: consigneeContact,
      weight: parseFloat(weight) || 0,
      weightUnit: weightUnit,
      gstPercent: gstPct,
      gstAmount: gstAmt,
      biltyCharge: parseFloat(biltyCharge) || 0,
      loadingCharge: parseFloat(loadingCharge) || 0
    };

    try {
      const response = await fetch('/api/v1/fleet/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        localStorage.removeItem('tms_new_trip_draft'); // Clear draft on successful creation
        setCreatedTripNum(tripNumber);
        setTripCreated(true);
      } else {
        setValidationError("Failed to create trip in database");
      }
    } catch (e) {
      console.error(e);
      setValidationError("Error connecting to backend");
    }
  };

  if (tripCreated) {
    return (
      <div className="new-trip-container">
        <div className="trip-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MdCheckCircle style={{ fontSize: '80px', color: '#2ecc71', marginBottom: '20px' }} />
          <h1 style={{ marginBottom: '10px' }}>Trip Created Successfully</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '30px' }}>
            Status: <strong style={{ color: '#f39c12' }}>PLANNED</strong>
          </p>
          <div style={{ display: 'inline-block', textAlign: 'left', backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '12px' }}>
            <p><strong>Trip Number:</strong> {createdTripNum}</p>
            <p><strong>Vehicle:</strong> {selectedVehicle?.registrationNumber || selectedVehicle?.number}</p>
            <p><strong>Route:</strong> {startLocation} → {destination}</p>
            <p><strong>Distance:</strong> {routes?.find(r => r.type === selectedRouteType)?.distance || 'N/A'} KM</p>
            <hr style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
            <p><strong>Freight Rate (Earnings):</strong> <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>₹{parseFloat(manualFreightRate || 0).toLocaleString('en-IN')}</span></p>
            <p><strong>Advance Received:</strong> ₹{parseFloat(advanceAmount || 0).toLocaleString('en-IN')}</p>
            <p><strong>Cargo:</strong> {goodsType || 'N/A'}</p>
            <p><strong>Client:</strong> {clientName || 'N/A'}</p>
            <p><strong>Pickup:</strong> {pickupAddress || 'N/A'}</p>
            <p><strong>Delivery:</strong> {deliveryAddress || 'N/A'}</p>
          </div>
          <br/>
          <button className="btn-primary" style={{ marginTop: '30px' }} onClick={() => window.location.reload()}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // Live Per-Kilometer & Profitability Calculations
  const effectiveDistance = (routes && selectedRouteType 
    ? routes.find(r => r.type === selectedRouteType)?.distance 
    : (routes?.[0]?.distance || deliveryEstimate?.distanceKm || liveDistanceKm || 0));

  const totalFreight = parseFloat(manualFreightRate) || 0;
  const currentFuelPrice = parseFloat(fuelPrice) || 0;
  const currentMileage = parseFloat(mileage) || 0;
  const directExpenses = (parseFloat(driverExpense) || 0) + (parseFloat(foodExpense) || 0) + (parseFloat(parkingExpense) || 0) + (parseFloat(otherExpense) || 0);

  // Additional Charges & Taxes (Hamali, Bilty, GST)
  const numBilty = parseFloat(biltyCharge) || 0;
  const numHamali = parseFloat(loadingCharge) || 0;
  const numGstPct = parseFloat(gstPercent) || 0;
  const gstAmount = totalFreight > 0 ? (totalFreight * numGstPct) / 100 : 0;

  const estFuelLiters = (effectiveDistance > 0 && currentMileage > 0) ? (effectiveDistance / currentMileage) : 0;
  const estFuelCost = estFuelLiters * currentFuelPrice;
  const estToll = effectiveDistance > 0 ? Math.max(120, Math.floor(effectiveDistance / 100) * 120) : 0;
  
  // Total Trip Operational Cost (Fuel + Toll + Driver/Food/Parking/Other + Hamali + Bilty)
  const totalTripCost = Math.round(estFuelCost + estToll + directExpenses + numHamali + numBilty);
  
  // All-over Kat-peet Net In-hand Profit (Freight - Total Cost - GST)
  const netTripProfit = totalFreight > 0 ? Math.round(totalFreight - totalTripCost - gstAmount) : 0;
  const profitMarginPercent = totalFreight > 0 ? ((netTripProfit / totalFreight) * 100).toFixed(1) : '0.0';

  const earningPerKm = effectiveDistance > 0 ? (totalFreight / effectiveDistance).toFixed(2) : '0.00';
  const costPerKm = effectiveDistance > 0 ? (totalTripCost / effectiveDistance).toFixed(2) : '0.00';
  const fuelCostPerKm = currentMileage > 0 ? (currentFuelPrice / currentMileage).toFixed(2) : '0.00';
  const profitPerKm = effectiveDistance > 0 ? (netTripProfit / effectiveDistance).toFixed(2) : '0.00';

  return (
    <div className="new-trip-container">
      {validationError && (
        <div className="modal-overlay" onClick={() => setValidationError('')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Missing Details</h3>
            <p style={{ color: '#e74c3c' }}>{validationError}</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setValidationError('')}>OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="new-trip-header">
        <h1><MdAddRoad /> New Trip</h1>
        <p>Create and plan a new trip with smart route recommendations</p>
      </div>

      <div className="new-trip-content">
        {/* LEFT COLUMN */}
        <div className="left-col">
          {/* Trip Details Card */}
          <div className="trip-card">
            <h2><MdDirectionsCar /> Trip Details</h2>
            
            <div className="form-group" data-field="vehicleId">
              <label>Vehicle</label>
              <div style={errors.vehicleId ? { border: '1.5px solid #ff4757', borderRadius: '8px' } : {}}>
                <VehicleSelect 
                  value={vehicleId} 
                  onChange={(val) => { 
                    setVehicleId(val); 
                    validateField('vehicleId', val); 
                    const selV = vehicles.find(v => String(v.id) === String(val));
                    if (weight) validateField('weight', weight, weightUnit, selV);
                  }} 
                  placeholder="Select Vehicle"
                  vehicles={vehicles}
                  cargoWeight={convertWeightToTons(weight, weightUnit)}
                />
              </div>
              {errors.vehicleId && <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}>{errors.vehicleId}</div>}
            </div>

            {selectedVehicle && (
              <div className="vehicle-info-preview">
                <div className="vehicle-info-grid">
                  <div className="info-item">
                    <span className="label">Vehicle Number</span>
                    <span className="val">{selectedVehicle.registrationNumber} {selectedVehicle.name ? `(${selectedVehicle.name})` : ''}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Type</span>
                    <span className="val">{selectedVehicle.type || selectedVehicle.vehicleType || 'Truck'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Fuel / Mileage</span>
                    <span className="val">{selectedVehicle.fuelType || 'Diesel'} ({selectedVehicle.mileage || mileage || 10} KM/L)</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Current Status</span>
                    <span className="val">{selectedVehicle.status || 'Available'}</span>
                  </div>
                </div>

                {/* LIVE TELEMETRY PANEL */}
                <div style={{
                  marginTop: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                      <MdDirectionsCar size={18} /> LIVE TELEMETRY
                    </h3>
                    <div className="live-indicator" style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', fontWeight: '700' 
                    }}>
                      <span className="pulsing-dot" style={{
                        width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)', animation: 'pulse 1.5s infinite'
                      }}></span> LIVE
                    </div>
                  </div>

                  {telemetryLoading ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Connecting to vehicle...
                    </div>
                  ) : vehicleTelemetry ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Last Trip</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{vehicleTelemetry.lastTripRoute}</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Previous Refill</div>
                        <div style={{ fontSize: '0.95rem', color: '#2563eb', fontWeight: '800' }}>{vehicleTelemetry.fuelFilledLastTime} L</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Current Fuel</div>
                        <div style={{ fontSize: '1.05rem', color: vehicleTelemetry.currentFuelRemaining < 20 ? '#ef4444' : '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MdLocalGasStation size={18} /> {vehicleTelemetry.currentFuelRemaining} L
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Estimated Range</div>
                        <div style={{ fontSize: '1.05rem', color: '#f59e0b', fontWeight: '800' }}>
                          {Math.round(vehicleTelemetry.currentFuelRemaining * (selectedVehicle.mileage || 10))} KM
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>Telemetry disconnected</div>
                  )}
                  
                  <style>{`
                    @keyframes pulse {
                      0% { opacity: 1; transform: scale(1); }
                      50% { opacity: 0.5; transform: scale(1.2); }
                      100% { opacity: 1; transform: scale(1); }
                    }
                  `}</style>
                </div>
              </div>
            )}

            <div className="form-group" data-field="driverId" style={{ marginTop: '16px' }}>
              <label>Driver</label>
              <div style={errors.driverId ? { border: '1.5px solid #ff4757', borderRadius: '8px' } : {}}>
                <CustomSelect 
                  value={driverId} 
                  onChange={(val) => { setDriverId(val); validateField('driverId', val); }} 
                  placeholder="Select Driver"
                  options={(drivers || []).map(d => ({ value: d.id.toString(), label: `${d.name}${d.phone ? ' (' + d.phone + ')' : ''}` }))}
                />
              </div>
              {errors.driverId && <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}>{errors.driverId}</div>}
            </div>

            <div className="form-group">
              <label>Trip Date</label>
              <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} />
            </div>
          </div>

          {/* Cost Estimation Card */}
          <div className="trip-card">
            <h2><MdAttachMoney /> Cost Estimation</h2>
            
            {/* Live Fuel Rates Display */}
            {(startLocation || destination) && (
              <div style={{
                background: 'var(--bg-secondary)', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdLocationOn style={{ color: '#2ecc71' }} />
                  <span><strong>{startLocation || 'Start'}:</strong> ₹{startFuelPrice || '...'} / L</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdLocationOn style={{ color: '#e74c3c' }} />
                  <span><strong>{destination || 'Destination'}:</strong> ₹{destFuelPrice || '...'} / L</span>
                </div>
              </div>
            )}

            <div className="vehicle-info-grid">
              <div className="form-group" data-field="manualFreightRate" style={{ gridColumn: '1 / -1', background: 'rgba(9, 132, 227, 0.1)', padding: '14px', borderRadius: '10px', border: errors.manualFreightRate ? '1.5px solid #ff4757' : '1px solid rgba(9, 132, 227, 0.35)' }}>
                <label style={{ color: '#74b9ff', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💰 Freight Rate / Expected Earnings (₹)
                </label>
                <input 
                  type="number" 
                  placeholder="₹ 0.00" 
                  value={manualFreightRate} 
                  onChange={e => { setManualFreightRate(e.target.value); validateField('manualFreightRate', e.target.value); }} 
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: errors.manualFreightRate ? '1.5px solid #ff4757' : '1px solid #0984e3', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', marginTop: '6px' }}
                />
                {errors.manualFreightRate ? (
                  <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}>
                    {errors.manualFreightRate}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                    Total earning for this trip. Auto-filled if Rate Card exists, or enter manually.
                  </span>
                )}
              </div>

              {/* Live Per-Kilometer Profitability & Cost Breakdown Card */}
              <div className={`km-profit-card ${totalFreight > 0 ? (netTripProfit >= 0 ? 'profitable' : 'loss') : ''}`}>
                <div className="km-profit-header">
                  <div className="km-profit-title">
                    <MdTrendingUp style={{ color: netTripProfit >= 0 ? '#34d399' : '#f87171', fontSize: '22px' }} />
                    <span>Live Profitability & Per-Kilometer (₹/KM) Calculator</span>
                  </div>
                  {effectiveDistance > 0 && (
                    <span className="km-profit-distance-pill">
                      📏 Distance: {effectiveDistance} KM
                    </span>
                  )}
                </div>

                {effectiveDistance > 0 && totalFreight > 0 ? (
                  <>
                    <div className="km-metrics-grid">
                      {/* Earning Per KM */}
                      <div className="km-metric-box earning">
                        <div className="km-metric-label">
                          <span>Earning / KM</span>
                          <span>📈</span>
                        </div>
                        <div className="km-metric-val blue">
                          ₹{earningPerKm} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>/ km</span>
                        </div>
                        <div className="km-metric-sub">
                          Gross Freight: ₹{totalFreight.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Cost Per KM */}
                      <div className="km-metric-box cost">
                        <div className="km-metric-label">
                          <span>Total Cost / KM</span>
                          <span>⛽</span>
                        </div>
                        <div className="km-metric-val orange">
                          ₹{costPerKm} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>/ km</span>
                        </div>
                        <div className="km-metric-sub">
                          Fuel ₹{fuelCostPerKm}/km + Ops & Charges
                        </div>
                      </div>

                      {/* Net In-Hand Profit Per KM */}
                      <div className={`km-metric-box ${netTripProfit >= 0 ? 'profit' : 'loss-box'}`}>
                        <div className="km-metric-label">
                          <span>Net Profit / KM</span>
                          <span>💰</span>
                        </div>
                        <div className={`km-metric-val ${netTripProfit >= 0 ? 'green' : 'red'}`}>
                          {netTripProfit >= 0 ? `+₹${profitPerKm}` : `-₹${Math.abs(profitPerKm)}`} 
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>/ km</span>
                        </div>
                        <div className="km-metric-sub">
                          {netTripProfit >= 0 ? 'Pure Net Return (Kat-Peet)' : 'Loss Per Kilometer'}
                        </div>
                      </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="km-profit-summary-bar">
                      <div className="km-summary-left">
                        <div className="km-summary-item">
                          <span>Total Expense:</span>
                          <strong>₹{totalTripCost.toLocaleString('en-IN')}</strong>
                        </div>
                        {gstAmount > 0 && (
                          <div className="km-summary-item">
                            <span>GST ({numGstPct}%):</span>
                            <strong style={{ color: '#fb923c' }}>-₹{Math.round(gstAmount).toLocaleString('en-IN')}</strong>
                          </div>
                        )}
                        <div className="km-summary-item">
                          <span>Net In-Hand Profit:</span>
                          <strong style={{ color: netTripProfit >= 0 ? '#34d399' : '#f87171', fontSize: '1.05rem' }}>
                            {netTripProfit >= 0 ? `₹${netTripProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(netTripProfit).toLocaleString('en-IN')}`}
                          </strong>
                        </div>
                        <div className="km-summary-item">
                          <span>Margin:</span>
                          <strong style={{ color: netTripProfit >= 0 ? '#38bdf8' : '#f87171' }}>
                            {profitMarginPercent}%
                          </strong>
                        </div>
                      </div>

                      <div>
                        {netTripProfit < 0 ? (
                          <span className="km-health-badge low">
                            ⚠️ Loss Alert (Expenses Exceed Freight)
                          </span>
                        ) : parseFloat(profitMarginPercent) >= 25 ? (
                          <span className="km-health-badge high">
                            ✓ Highly Profitable ({profitMarginPercent}% Margin)
                          </span>
                        ) : parseFloat(profitMarginPercent) >= 10 ? (
                          <span className="km-health-badge moderate">
                            ⚡ Healthy Profit ({profitMarginPercent}% Margin)
                          </span>
                        ) : (
                          <span className="km-health-badge low">
                            ⚠️ Low Margin ({profitMarginPercent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live Kat-Peet Deductions breakdown badges */}
                    <div className="km-breakdown-tags">
                      <span className="km-breakdown-tag">
                        ⛽ Fuel: <strong>₹{Math.round(estFuelCost).toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="km-breakdown-tag">
                        Tolls: <strong>₹{estToll.toLocaleString('en-IN')}</strong>
                      </span>
                      {directExpenses > 0 && (
                        <span className="km-breakdown-tag">
                          👨‍✈️ Driver & Food/Ops: <strong>₹{directExpenses.toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                      {numHamali > 0 && (
                        <span className="km-breakdown-tag">
                          📦 Hamali / Loading: <strong>₹{numHamali.toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                      {numBilty > 0 && (
                        <span className="km-breakdown-tag">
                          📄 Bilty / GR Charge: <strong>₹{numBilty.toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                      {gstAmount > 0 && (
                        <span className="km-breakdown-tag">
                          🏛️ GST Tax: <strong>₹{Math.round(gstAmount).toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="km-prompt-box">
                    <span>💡</span>
                    <span>
                      {!startLocation || !destination 
                        ? 'Enter starting location & destination to automatically fetch distance and activate live ₹/KM profit preview.'
                        : !totalFreight 
                          ? `Distance estimated at ${effectiveDistance || '~500'} KM. Enter Freight Rate above to see live Per-Kilometer Profit & Margins.`
                          : 'Enter Freight Rate & Route to calculate live ₹/KM Profit.'}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group" data-field="fuelPrice">
                <label>Avg Fuel Price (₹ / L)</label>
                <input 
                  type="number" 
                  value={fuelPrice} 
                  onChange={e => { setFuelPrice(e.target.value); validateField('fuelPrice', e.target.value); }} 
                  style={errors.fuelPrice ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.fuelPrice && <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '4px', fontWeight: '600' }}>{errors.fuelPrice}</div>}
              </div>

              <div className="form-group" data-field="mileage">
                <label>Vehicle Mileage (KM / L)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={mileage} 
                  onChange={e => { setMileage(e.target.value); validateField('mileage', e.target.value); }} 
                  style={errors.mileage ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.mileage && <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '4px', fontWeight: '600' }}>{errors.mileage}</div>}
              </div>

              <div className="form-group">
                <label>Driver Expense (₹)</label>
                <input type="number" value={driverExpense} onChange={e => setDriverExpense(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Food Expense (₹)</label>
                <input type="number" value={foodExpense} onChange={e => setFoodExpense(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Parking Expense (₹)</label>
                <input type="number" value={parkingExpense} onChange={e => setParkingExpense(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Other Expense (₹)</label>
                <input type="number" value={otherExpense} onChange={e => setOtherExpense(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Advance Received (₹)</label>
                <input type="number" placeholder="Enter advance amount" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-col">
          <div className="trip-card">
            <h2><MdLocationOn /> Route Details</h2>
            
            <div className="route-stops-container">
              {/* Start */}
              <div className="route-stop-item" data-field="startLocation" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <div className="route-stop-marker start"></div>
                  <div className="stop-input-group" style={{ width: '100%', borderColor: errors.startLocation ? '#ff4757' : '#2ecc71', borderWidth: errors.startLocation ? '1.5px' : '1px' }}>
                    <MdLocationOn style={{ color: '#2ecc71', marginRight: '8px', flexShrink: 0 }} />
                    <CitySearchInput
                      placeholder="Enter starting location"
                      value={startLocation}
                      onChange={val => { setStartLocation(val); validateField('startLocation', val); }}
                      onBlur={() => validateField('startLocation', startLocation)}
                    />
                  </div>
                </div>
                {errors.startLocation && (
                  <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '6px', marginLeft: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⚠️ {errors.startLocation}
                  </div>
                )}
              </div>

              {/* Stops */}
              {stops.map((stop, index) => (
                <div className="route-stop-item" key={stop.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    <div className="route-stop-marker"></div>
                    <div className="stop-input-group" style={{ width: '100%' }}>
                      <MdLocationOn style={{ color: 'var(--text-secondary)', marginRight: '8px', flexShrink: 0 }} />
                      <CitySearchInput
                        placeholder={`Enter stop location ${index + 1}`}
                        value={stop.location}
                        onChange={val => updateStopLocation(stop.id, val)}
                      />
                      <button className="icon-btn remove" onClick={() => removeStop(stop.id)}>
                        <MdClose />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="route-stop-item" style={{ borderLeftColor: 'transparent', paddingLeft: 0, marginLeft: 0, width: '100%' }}>
                 <button className="add-stop-btn" onClick={addStop}>
                  <MdAdd /> Add Stop
                 </button>
              </div>

              {/* Destination */}
              <div className="route-stop-item" data-field="destination" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <div className="route-stop-marker end"></div>
                  <div className="stop-input-group" style={{ width: '100%', borderColor: errors.destination ? '#ff4757' : '#e74c3c', borderWidth: errors.destination ? '1.5px' : '1px' }}>
                    <MdLocationOn style={{ color: '#e74c3c', marginRight: '8px', flexShrink: 0 }} />
                    <CitySearchInput
                      placeholder="Enter destination"
                      value={destination}
                      onChange={val => { setDestination(val); validateField('destination', val); }}
                      onBlur={() => validateField('destination', destination)}
                    />
                  </div>
                </div>
                {errors.destination && (
                  <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '6px', marginLeft: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⚠️ {errors.destination}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cargo & Dispatch Details */}
          <div className="trip-card">
            <h2><MdInventory /> Cargo & Dispatch Details</h2>
            
            <div className="vehicle-info-grid">
              <div className="form-group">
                <label>Cargo / Goods Type</label>
                <input type="text" placeholder="Enter Goods Type" value={goodsType} onChange={e => setGoodsType(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Dispatch Date</label>
                <input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Expected Delivery Date</span>
                  {estimatingDelivery && <span style={{ fontSize: '11px', color: '#38bdf8' }}>Predicting ETA...</span>}
                </label>
                <input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} />
              </div>

              {/* Smart Delivery Time Estimator Card (Past Trips Data & Speed Model) */}
              {deliveryEstimate && (
                <div className="smart-eta-card">
                  <div className="smart-eta-main">
                    <div className="smart-eta-info-wrap">
                      <div className="smart-eta-icon-badge">
                        ⏱️
                      </div>
                      <div>
                        <div className="smart-eta-title-row">
                          <span className="smart-eta-heading">
                            Estimated Running Time: <span className="highlight">~{deliveryEstimate.estimatedHours} hrs</span> ({deliveryEstimate.estimatedDays} Day{deliveryEstimate.estimatedDays > 1 ? 's' : ''})
                          </span>
                          <span className={`smart-eta-badge ${deliveryEstimate.confidence === 'HIGH' ? 'high' : 'medium'}`}>
                            {deliveryEstimate.confidence === 'HIGH' ? '🎯 Past Trips Match' : '⚡ Fleet Speed Model'}
                          </span>
                        </div>
                        
                        <div className="smart-eta-chips">
                          <span className="smart-eta-chip">
                            📏 <strong>{deliveryEstimate.distanceKm || liveDistanceKm || 500} KM</strong> Road Distance
                          </span>
                          <span className="smart-eta-chip">
                            📅 Target: <strong>{deliveryEstimate.estimatedDeliveryDate}</strong>
                          </span>
                          <span className="smart-eta-chip" style={{ color: '#94a3b8' }}>
                            {deliveryEstimate.basis}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpectedDeliveryDate(deliveryEstimate.estimatedDeliveryDate)}
                      className={`smart-eta-btn ${expectedDeliveryDate === deliveryEstimate.estimatedDeliveryDate ? 'applied' : 'unapplied'}`}
                    >
                      {expectedDeliveryDate === deliveryEstimate.estimatedDeliveryDate ? (
                        <>
                          <MdCheckCircle size={18} />
                          <span>Suggested Date Applied</span>
                        </>
                      ) : (
                        <>
                          <MdDateRange size={18} />
                          <span>Apply ({deliveryEstimate.estimatedDeliveryDate})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Pickup Address</label>
                <input type="text" placeholder="Enter full pickup address" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Delivery Address</label>
                <input type="text" placeholder="Enter full delivery address" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
              </div>

              {/* Added LR Details for Trip Generation */}
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>LR / Bilty Details</h3>
              </div>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Select Saved Client (Consignor / Sender Auto-fill)</label>
                <select value={selectedConsignorId} onChange={handleConsignorSelect} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                  <option value="">-- Manual Entry --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || c.name} ({c.phone || 'No Phone'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Client / Owner Name</label>
                <input 
                  type="text" 
                  placeholder="Client Name" 
                  value={clientName} 
                  onChange={e => setClientName(sanitizeNameInput(e.target.value))} 
                />
              </div>

              <div className="form-group">
                <label>Consignor (Sender) Name</label>
                <input 
                  type="text" 
                  placeholder="Sender Name" 
                  value={consignorName} 
                  onChange={e => setConsignorName(sanitizeNameInput(e.target.value))} 
                  style={errors.consignorName ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.consignorName && <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '4px' }}>{errors.consignorName}</div>}
              </div>
              <div className="form-group">
                <label>Consignor (Sender) GST</label>
                <input 
                  type="text" 
                  placeholder="15-digit GST (e.g. 23AADCR1234F1Z5)" 
                  value={consignorGST} 
                  maxLength={15}
                  onChange={e => setConsignorGST(sanitizeAlphaNumericUpper(e.target.value, 15))} 
                  style={errors.consignorGST ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.consignorGST && <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '4px' }}>{errors.consignorGST}</div>}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Consignor (Sender) Contact</label>
                <input 
                  type="text" 
                  placeholder="10-digit Mobile Number" 
                  value={consignorContact} 
                  maxLength={10}
                  onChange={e => setConsignorContact(sanitizeDigitsOnly(e.target.value, 10))} 
                  style={errors.consignorContact ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.consignorContact && <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '4px' }}>{errors.consignorContact}</div>}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '15px' }}>
                <label>Select Saved Client (Consignee / Receiver Auto-fill)</label>
                <select value={selectedConsigneeId} onChange={handleConsigneeSelect} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                  <option value="">-- Manual Entry --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || c.name} ({c.phone || 'No Phone'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Consignee (Receiver) Name</label>
                <input 
                  type="text" 
                  placeholder="Receiver Name" 
                  value={consigneeName} 
                  onChange={e => setConsigneeName(sanitizeNameInput(e.target.value))} 
                  style={errors.consigneeName ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.consigneeName && <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '4px' }}>{errors.consigneeName}</div>}
              </div>
              <div className="form-group">
                <label>Consignee (Receiver) GST</label>
                <input 
                  type="text" 
                  placeholder="15-digit GST (e.g. 23AADCR1234F1Z5)" 
                  value={consigneeGST} 
                  maxLength={15}
                  onChange={e => setConsigneeGST(sanitizeAlphaNumericUpper(e.target.value, 15))} 
                  style={errors.consigneeGST ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.consigneeGST && <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '4px' }}>{errors.consigneeGST}</div>}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Consignee (Receiver) Contact</label>
                <input 
                  type="text" 
                  placeholder="10-digit Mobile Number" 
                  value={consigneeContact} 
                  maxLength={10}
                  onChange={e => setConsigneeContact(sanitizeDigitsOnly(e.target.value, 10))} 
                  style={errors.consigneeContact ? { border: '1.5px solid #ff4757' } : {}}
                />
                {errors.consigneeContact && <div style={{ color: '#ff4757', fontSize: '0.82rem', marginTop: '4px' }}>{errors.consigneeContact}</div>}
              </div>
              
              <div className="form-group" data-field="weight">
                <label>Weight</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    placeholder="Actual Weight" 
                    value={weight} 
                    onChange={e => { 
                      setWeight(e.target.value); 
                      validateField('weight', e.target.value, weightUnit, selectedVehicle); 
                    }} 
                    style={{ flex: 2, border: errors.weight ? '1.5px solid #ff4757' : undefined }} 
                  />
                  <select 
                    value={weightUnit} 
                    onChange={e => { 
                      setWeightUnit(e.target.value); 
                      validateField('weight', weight, e.target.value, selectedVehicle); 
                    }} 
                    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="Kg">Kg</option>
                    <option value="Ton">Ton</option>
                    <option value="MT">MT</option>
                  </select>
                </div>
                {errors.weight && <div className="error-text" style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}>{errors.weight}</div>}
                
              </div>

              {/* Auto-suggest Best Fit Truck (Full-width sleek horizontal bar) */}
              {weight && parseFloat(weight) > 0 && (() => {
                const wTons = convertWeightToTons(weight, weightUnit);
                const candidates = vehicles.filter(v => {
                  const isAvail = (v.status || 'Active') === 'Active' || (v.status || '').toLowerCase() === 'available';
                  const cap = parseFloat(String(v.capacity).replace(/[^0-9.]/g, '')) || 0;
                  return isAvail && cap >= wTons;
                }).sort((a, b) => {
                  const capA = parseFloat(String(a.capacity).replace(/[^0-9.]/g, '')) || 0;
                  const capB = parseFloat(String(b.capacity).replace(/[^0-9.]/g, '')) || 0;
                  return capA - capB;
                });

                const bestTruck = candidates[0];
                if (!bestTruck) {
                  return (
                    <div style={{ gridColumn: '1 / -1', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', fontSize: '0.85rem' }}>
                      ⚠️ No available truck can carry {weight} {weightUnit}. Max fleet capacity exceeded.
                    </div>
                  );
                }

                const bestCap = parseFloat(String(bestTruck.capacity).replace(/[^0-9.]/g, '')) || 0;
                const util = Math.min(100, Math.round((wTons / bestCap) * 100));
                const isCurrentSelected = selectedVehicle && String(selectedVehicle.id) === String(bestTruck.id);

                return (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '6px 14px',
                    minHeight: '38px',
                    borderRadius: '8px',
                    background: isCurrentSelected 
                      ? 'rgba(46, 204, 113, 0.08)' 
                      : 'rgba(9, 132, 227, 0.08)',
                    border: `1px solid ${isCurrentSelected ? 'rgba(46, 204, 113, 0.3)' : 'rgba(9, 132, 227, 0.25)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    {/* Left: Compact single-row text */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.95rem' }}>🎯</span>
                      <span style={{ color: '#74b9ff', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Best Fit:
                      </span>
                      <strong style={{ color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {bestTruck.registrationNumber}
                      </strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        ({bestTruck.capacity || '10T'})
                      </span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '1px 7px', 
                        borderRadius: '10px', 
                        background: util >= 70 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: util >= 70 ? '#4ade80' : '#38bdf8',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}>
                        {util}% load
                      </span>
                    </div>

                    {/* Right: Perfect Compact Button / Badge */}
                    {!isCurrentSelected ? (
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleId(String(bestTruck.id));
                          validateField('vehicleId', String(bestTruck.id));
                          validateField('weight', weight, weightUnit, bestTruck);
                        }}
                        style={{
                          height: '28px',
                          padding: '0 14px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#0984e3',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0070c0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#0984e3'}
                      >
                        ⚡ Auto-Select
                      </button>
                    ) : (
                      <div style={{
                        height: '26px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(46, 204, 113, 0.15)',
                        color: '#2ecc71',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(46, 204, 113, 0.4)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}>
                        <MdCheckCircle size={14} color="#2ecc71" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="form-group">
                <label>Bilty/GR Charge (₹)</label>
                <input type="number" placeholder="0" value={biltyCharge} onChange={e => setBiltyCharge(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hamali/Loading (₹)</label>
                <input type="number" placeholder="0" value={loadingCharge} onChange={e => setLoadingCharge(e.target.value)} />
              </div>
              <div className="form-group">
                <label>GST Rate (%)</label>
                <input type="number" placeholder="e.g. 5, 12, 18" value={gstPercent} onChange={e => setGstPercent(e.target.value)} />
              </div>
            </div>
          </div>

          <button 
            id="find-routes-btn"
            className="btn-primary find-routes-btn" 
            onClick={handleFindRoutes}
            disabled={loading}
          >
            {loading ? 'Calculating Best Routes...' : <><MdSearch size={20}/> Find Best Routes</>}
          </button>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {routes && (
        <div className="recommended-routes-section" id="results">
          
          {/* Refuel Recommendation Alert */}
          {refuelRecommendation && (
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${refuelRecommendation.type === 'START_CHEAPER' ? '#2ecc71' : refuelRecommendation.type === 'DEST_CHEAPER' ? '#f39c12' : '#3498db'}`,
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{ fontSize: '32px' }}>
                {refuelRecommendation.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Smart Refuel Strategy
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {refuelRecommendation.message}
                </p>
              </div>
            </div>
          )}

          <h2>Recommended Routes</h2>
          
          <div className="routes-grid">
            {routes.map((route, idx) => (
              <div className={`route-option-card ${route.type.toLowerCase()} ${selectedRouteType === route.type ? 'selected' : ''}`} key={idx}>
                <div className="route-badge">
                  {route.badge} {route.title}
                </div>
                
                <div className="route-card-content">
                  <div className="route-path-summary">
                    <strong>{startLocation || 'Start'}</strong> → {stops.length} Stops → <strong>{destination || 'Destination'}</strong>
                  </div>

                  <div className="route-stats-grid">
                    <div className="stat-box">
                      <span className="label">Distance</span>
                      <span className="val">{route.distance} KM</span>
                    </div>
                    <div className="stat-box">
                      <span className="label">Est. Time</span>
                      <span className="val">{route.time}</span>
                    </div>
                    <div className="stat-box">
                      <span className="label">Earning / KM</span>
                      <span className="val" style={{ color: '#38bdf8' }}>₹{(route.freightAmount / route.distance).toFixed(2)}</span>
                    </div>
                    <div className="stat-box">
                      <span className="label">Cost / KM</span>
                      <span className="val" style={{ color: '#fb923c' }}>₹{(route.total / route.distance).toFixed(2)}</span>
                    </div>
                    <div className="stat-box" style={{ gridColumn: 'span 2', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                      <span className="label" style={{ color: '#34d399' }}>Net Profit / KM</span>
                      <span className="val" style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 800 }}>
                        +₹{(route.expectedMargin / route.distance).toFixed(2)} / km ({route.marginPercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="route-cost-breakdown">
                    <div className="cost-row">
                      <span className="label">Fuel Cost</span>
                      <span className="val">₹{route.fuelCost} ({route.fuelReq} L)</span>
                    </div>
                    <div className="cost-row">
                      <span className="label">Tolls</span>
                      <span className="val">₹{route.toll}</span>
                    </div>
                    {((parseFloat(driverExpense) || 0) + (parseFloat(foodExpense) || 0) + (parseFloat(parkingExpense) || 0) + (parseFloat(otherExpense) || 0)) > 0 && (
                      <div className="cost-row">
                        <span className="label">Driver & Ops Expenses</span>
                        <span className="val">₹{(parseFloat(driverExpense) || 0) + (parseFloat(foodExpense) || 0) + (parseFloat(parkingExpense) || 0) + (parseFloat(otherExpense) || 0)}</span>
                      </div>
                    )}
                    {((parseFloat(loadingCharge) || 0) + (parseFloat(biltyCharge) || 0)) > 0 && (
                      <div className="cost-row">
                        <span className="label">Hamali & Bilty Charges</span>
                        <span className="val">₹{(parseFloat(loadingCharge) || 0) + (parseFloat(biltyCharge) || 0)}</span>
                      </div>
                    )}
                    {route.gstDeduction > 0 && (
                      <div className="cost-row" style={{ color: '#fb923c' }}>
                        <span className="label">GST ({gstPercent}%)</span>
                        <span className="val">-₹{Math.round(route.gstDeduction)}</span>
                      </div>
                    )}
                    <div className="cost-row total">
                      <span className="label">Net In-Hand Profit</span>
                      <span className="val" style={{ color: '#34d399', fontWeight: 800 }}>₹{route.expectedMargin}</span>
                    </div>
                  </div>
                </div>

                <div className="route-card-actions">
                  <button className="btn-secondary" onClick={() => openMap(route)}>
                    View Full Route
                  </button>
                  
                  {selectedRouteType === route.type ? (
                    <div className="selected-indicator">
                      <MdCheckCircle size={20} /> Selected Route
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={() => setSelectedRouteType(route.type)}>
                      Select Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Comparison</th>
                  {routes.map(r => <th key={r.type}>{r.title}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Distance</td>
                  {routes.map(r => <td key={r.type}>{r.distance} KM</td>)}
                </tr>
                <tr>
                  <td>Time</td>
                  {routes.map(r => <td key={r.type}>{r.time}</td>)}
                </tr>
                <tr>
                  <td>Toll</td>
                  {routes.map(r => <td key={r.type}>₹{r.toll}</td>)}
                </tr>
                <tr>
                  <td>Fuel</td>
                  {routes.map(r => <td key={r.type}>₹{r.fuelCost}</td>)}
                </tr>
                <tr className="total-row">
                  <td>Total Cost</td>
                  {routes.map(r => <td key={r.type}>₹{r.total}</td>)}
                </tr>
                <tr style={{ background: 'rgba(56, 189, 248, 0.08)', fontWeight: 600 }}>
                  <td>Rate / KM</td>
                  {routes.map(r => <td key={r.type} style={{ color: '#38bdf8' }}>₹{(r.freightAmount / r.distance).toFixed(2)}/km</td>)}
                </tr>
                <tr style={{ background: 'rgba(251, 146, 60, 0.08)', fontWeight: 600 }}>
                  <td>Cost / KM</td>
                  {routes.map(r => <td key={r.type} style={{ color: '#fb923c' }}>₹{(r.total / r.distance).toFixed(2)}/km</td>)}
                </tr>
                <tr style={{ background: 'rgba(16, 185, 129, 0.12)', fontWeight: 700 }}>
                  <td style={{ color: '#34d399' }}>Profit / KM</td>
                  {routes.map(r => <td key={r.type} style={{ color: '#34d399' }}>+₹{(r.expectedMargin / r.distance).toFixed(2)}/km ({r.marginPercentage}%)</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          {selectedRouteType && (
            <div className="create-trip-section">
              <button className="btn-primary create-trip-btn" onClick={handleCreateTrip}>
                CREATE TRIP <MdArrowForward />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (() => {
        // d = force driving (prevents train routes on long distances)
        let mapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(startLocation)}&daddr=${encodeURIComponent(destination)}&dirflg=d&output=embed`;
        
        if (mapRouteData?.type === 'NORMAL') {
          // Avoid Highways (inherently forces driving)
          mapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(startLocation)}&daddr=${encodeURIComponent(destination)}&dirflg=h&output=embed`;
        } else if (mapRouteData?.type === 'ECONOMY') {
          // Avoid Tolls (inherently forces driving)
          mapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(startLocation)}&daddr=${encodeURIComponent(destination)}&dirflg=t&output=embed`;
        }

        return (
          <div className="modal-overlay" style={{ padding: 0 }} onClick={() => setShowMapModal(false)}>
          <div className="modal-content" style={{ width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none', borderRadius: 0, border: 'none' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <h2>{mapRouteData?.badge} {mapRouteData?.title} - Route Map</h2>
                <button className="close-btn" onClick={() => setShowMapModal(false)}><MdClose /></button>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <strong>Distance:</strong> <span style={{ color: 'var(--text-primary)', marginRight: '16px' }}>{mapRouteData?.distance} KM</span>
                <strong>Toll Plazas:</strong> <span style={{ color: 'var(--text-primary)', marginRight: '16px' }}>{mapRouteData?.tolls} (₹{mapRouteData?.toll})</span>
                <strong>Est. Time:</strong> <span style={{ color: 'var(--text-primary)' }}>{mapRouteData?.time}</span>
              </div>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <div className="map-placeholder" style={{ height: '100%', maxHeight: 'none', border: 'none', borderRadius: 0 }}>
                <div className="map-placeholder-content" style={{ width: '100%', height: '100%' }}>
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={mapUrl}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
};

export default NewTrip;


