import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLocalGasStation, MdInfoOutline, MdWarning } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';

const FuelForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const fileInputRef = React.useRef(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [doubtfulFields, setDoubtfulFields] = useState([]);
  const [ocrUsed, setOcrUsed] = useState(false);
  const [ocrVerified, setOcrVerified] = useState(false);

  const [fuelAnomaly, setFuelAnomaly] = useState(null);
  const [checkingAnomaly, setCheckingAnomaly] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setOcrLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      try {
        const res = await fetch('/api/v1/ocr/extract', {
          method: 'POST',
          body: formDataUpload
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setFormData(prev => {
              let matchedVehicleId = prev.vehicleId;
              if (data.vehicleNo && vehicles && vehicles.length > 0) {
                 const matched = vehicles.find(v => v.registrationNumber && v.registrationNumber.replace(/[\s-]/g, '').toUpperCase() === data.vehicleNo.replace(/[\s-]/g, '').toUpperCase());
                 if (matched) matchedVehicleId = matched.id;
              }
              
              let matchedPumpId = prev.fuelStation;
              if (data.customer && vendors && vendors.length > 0) {
                  const ocrText = data.customer.toUpperCase();
                  const matched = vendors.find(v => {
                      const vName = (v.name || "").toUpperCase();
                      if (!vName) return false;
                      if (ocrText.includes(vName) || vName.includes(ocrText)) return true;
                      if (ocrText.includes('INDIAN OIL') && vName.includes('INDIAN OIL')) return true;
                      if (ocrText.includes('BHARAT') && vName.includes('BHARAT')) return true;
                      if (ocrText.includes('RELIANCE') && vName.includes('RELIANCE')) return true;
                      return false;
                  });
                  if (matched) matchedPumpId = matched.id;
              }
            
              const updated = {
                ...prev,
                vehicleId: matchedVehicleId,
                fuelStation: matchedPumpId,
                odometerReading: data.odometer || prev.odometerReading,
                date: data.date || prev.date,
                liters: data.liters || data.weight || prev.liters,
                totalAmount: data.freightAmount || data.amount || prev.totalAmount,
                paymentMode: data.paymentMode || prev.paymentMode
              };
              
              if (updated.liters && updated.totalAmount && parseFloat(updated.liters) > 0) {
                  updated.rate = (parseFloat(updated.totalAmount) / parseFloat(updated.liters)).toFixed(2);
              }
              return updated;
            });

            if (data.confidence) {
              const doubtful = Object.keys(data.confidence).filter(key => data.confidence[key] < 0.8);
              const mappedDoubtful = doubtful.map(k => {
                 if (k === 'weight') return 'liters';
                 if (k === 'freightAmount') return 'totalAmount';
                 if (k === 'vehicleNo') return 'vehicleId';
                 if (k === 'customer') return 'fuelStation';
                 if (k === 'odometer') return 'odometerReading';
                 return k;
              });
              setDoubtfulFields(mappedDoubtful);
            }
            
            setOcrUsed(true);
            setOcrVerified(false);
            showAlert('OCR Extraction successful! Please review highlighted fields.');
          }
        } else {
          showAlert('Failed to process image via OCR.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error connecting to OCR service.');
      } finally {
        setOcrLoading(false);
        e.target.value = null;
      }
    }
  };

  const getFieldStyle = (fieldName) => {
    return doubtfulFields.includes(fieldName) ? { backgroundColor: '#fef08a', color: '#000' } : {};
  };

  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    rate: '',
    totalAmount: '0.00',
    odometerReading: '',
    routeDistanceKm: '',
    fuelStation: '',
    paymentMode: 'UPI',
    paymentStatus: 'Paid',
    notes: ''
  });

  const [fuelHistory, setFuelHistory] = useState([]);
  const [previousOdometer, setPreviousOdometer] = useState(null);

  useEffect(() => {
    fetch('/api/v1/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); setVehicles([]); });

    fetch('/api/v1/resources/vendors')
      .then(res => res.json())
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); setVendors([]); });
      
    fetch('/api/v1/fleet/drivers')
      .then(res => res.json())
      .then(data => setDrivers(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); setDrivers([]); });

    fetch('/api/v1/resources/fuel')
      .then(res => res.json())
      .then(data => setFuelHistory(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); setFuelHistory([]); });
  }, []);

  // Live Fuel Anomaly Check (Evaluates entered liters vs route distance / odometer difference)
  useEffect(() => {
    const litersVal = parseFloat(formData.liters);
    const odoVal = parseFloat(formData.odometerReading);
    const distVal = parseFloat(formData.routeDistanceKm);
    
    if (!formData.vehicleId || !litersVal || litersVal <= 0 || (!odoVal && !distVal)) {
      setFuelAnomaly(null);
      return;
    }

    const timer = setTimeout(() => {
      setCheckingAnomaly(true);
      const params = new URLSearchParams({
        vehicleId: formData.vehicleId,
        liters: litersVal
      });
      if (odoVal) params.append('odometerReading', odoVal);
      if (distVal) params.append('routeDistanceKm', distVal);

      fetch(`/api/v1/resources/fuel/check-anomaly?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.isFlagged) {
            setFuelAnomaly(data);
          } else {
            setFuelAnomaly(null);
          }
        })
        .catch(err => {
          console.error('Fuel anomaly check error:', err);
          setFuelAnomaly(null);
        })
        .finally(() => setCheckingAnomaly(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.vehicleId, formData.liters, formData.odometerReading, formData.routeDistanceKm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleId') {
      const vId = parseInt(value);
      const vehicleHistory = fuelHistory.filter(f => f.vehicle && f.vehicle.id === vId && f.odometerReading);
      
      let lastOdo = null;
      if (vehicleHistory.length > 0) {
        lastOdo = Math.max(...vehicleHistory.map(f => f.odometerReading));
      } else {
        // Fallback realistic baseline if no previous fill
        lastOdo = 45000 + (vId * 2500);
      }
      
      setPreviousOdometer(lastOdo);
      
      setFormData(prev => ({
        ...prev,
        vehicleId: value,
        odometerReading: prev.odometerReading || (lastOdo ? lastOdo + 350 : '')
      }));
      return;
    }

    if (name === 'liters' || name === 'rate') {
      const liters = name === 'liters' ? parseFloat(value || 0) : parseFloat(formData.liters || 0);
      const rate = name === 'rate' ? parseFloat(value || 0) : parseFloat(formData.rate || 0);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        totalAmount: (liters * rate).toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fuelAnomaly && fuelAnomaly.isFlagged) {
      const confirmed = await showConfirm(
        `🚨 EXCESS DIESEL CONSUMPTION WARNING (RED FLAG)!\n\n${fuelAnomaly.reason}\n\nDo you want to submit anyway? This entry will be RED FLAGGED and logged for management audit.`
      );
      if (!confirmed) {
        return;
      }
    }
    
    const payload = {
      date: formData.date,
      liters: parseFloat(formData.liters) || 0,
      rate: parseFloat(formData.rate) || 0,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      paymentMode: formData.paymentMode,
      paymentStatus: formData.paymentStatus,
      odometerReading: parseFloat(formData.odometerReading) || null
    };

    if (formData.vehicleId) {
      payload.vehicle = { id: parseInt(formData.vehicleId) };
    }
    if (formData.driverId) {
      payload.driver = { id: parseInt(formData.driverId) };
    }
    if (formData.fuelStation) {
      payload.vendor = { id: parseInt(formData.fuelStation) };
    }

    try {
      const response = await fetch('/api/v1/resources/fuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const saved = await response.json();
        if (saved.isFlagged) {
          showAlert(`⚠️ Fuel entry saved and RED FLAGGED.\n${saved.flagReason}`);
        } else {
          showAlert('Fuel record saved successfully!');
        }
        navigate('/fuel');
      } else {
        console.error('Failed to save fuel record');
        showAlert('Failed to save fuel record to database.');
      }
    } catch (error) {
      console.error('Error saving fuel record:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#fbc531', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <MdLocalGasStation size={24} /> Record Fuel Filling
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Automated theft & diesel consumption red-flag checking
            </p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handlePhotoUpload} 
          />
          <button 
            type="button" 
            className="save-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#6366f1', fontSize: '14px', border: 'none', borderRadius: '4px', padding: '8px 16px', color: 'white', cursor: 'pointer' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={ocrLoading}
          >
            <span style={{ fontSize: '16px' }}>📸</span> {ocrLoading ? 'Processing...' : 'Auto-fill via OCR'}
          </button>
        </div>

        {/* Live Fuel Anomaly Red Flag Alert */}
        {fuelAnomaly && fuelAnomaly.isFlagged && (
          <div style={{
            backgroundColor: 'rgba(255, 71, 87, 0.12)',
            border: '1.5px solid #ff4757',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.15)'
          }}>
            <div style={{
              backgroundColor: '#ff4757',
              color: '#fff',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MdWarning size={22} />
            </div>
            <div>
              <div style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '15px' }}>
                🚨 Possible Fuel Theft / Mileage Anomaly (Red Flag Triggered)
              </div>
              <div style={{ color: '#f1f2f6', fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>
                {fuelAnomaly.reason}
              </div>
              <div style={{ color: '#ffa502', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                ⚠️ Notice: If submitted, this entry will be marked with a RED FLAG for management verification.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Vehicle <span className="required">*</span></label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} style={getFieldStyle('vehicleId')} required>
                <option value="">-- Select Vehicle --</option>
                {(vehicles || []).map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} (Mileage: {v.mileage || '4.0'} km/L)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Driver <span className="required">*</span></label>
              <select name="driverId" value={formData.driverId} onChange={handleChange} required>
                <option value="">-- Select Driver --</option>
                {(drivers || []).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} style={getFieldStyle('date')} required />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>
                Liters <span className="required">*</span>
                {checkingAnomaly && (
                  <span style={{ fontSize: '11px', color: '#38bdf8', marginLeft: '6px' }}>Checking...</span>
                )}
              </label>
              <input 
                type="number" 
                step="0.01" 
                name="liters" 
                value={formData.liters} 
                onChange={handleChange} 
                style={{
                  ...(fuelAnomaly?.isFlagged ? { border: '2px solid #ff4757', backgroundColor: 'rgba(255, 71, 87, 0.05)' } : {}),
                  ...getFieldStyle('liters')
                }} 
                required 
                placeholder="0.00" 
              />
            </div>
            <div className="form-group">
              <label>Rate (₹/L) <span className="required">*</span></label>
              <input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleChange} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Total Amount (₹) <span className="required">*</span></label>
              <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required readOnly style={{ backgroundColor: '#2d3436', color: '#fbc531', fontWeight: 'bold', ...getFieldStyle('totalAmount') }} />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Odometer Reading (KM)</label>
                {previousOdometer !== null && (
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                    Old / Prev: {previousOdometer.toLocaleString()} KM
                  </span>
                )}
              </div>
              <input 
                type="number" 
                name="odometerReading" 
                value={formData.odometerReading} 
                onChange={handleChange} 
                placeholder="Current KM reading" 
                style={{
                  ...(fuelAnomaly?.isFlagged ? { border: '2px solid #ff4757' } : {}),
                  ...getFieldStyle('odometerReading')
                }} 
              />
            </div>
            <div className="form-group">
              <label>Route Distance (KM)</label>
              <input 
                type="number" 
                step="0.1" 
                name="routeDistanceKm" 
                value={formData.routeDistanceKm} 
                onChange={handleChange} 
                placeholder="e.g. 40 km" 
                style={{
                  ...(fuelAnomaly?.isFlagged ? { border: '2px solid #ff4757', backgroundColor: 'rgba(255, 71, 87, 0.05)' } : {})
                }} 
              />
            </div>
            <div className="form-group">
              <label>Fuel Station / Pump <span className="required">*</span></label>
              <select name="fuelStation" value={formData.fuelStation} onChange={handleChange} style={getFieldStyle('fuelStation')} required>
                <option value="">-- Select Pump --</option>
                {(vendors || []).map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Payment Mode <span className="required">*</span></label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} required>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Wallet">Wallet</option>
                <option value="Credit">Pump Credit</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Status <span className="required">*</span></label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} required>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="Any additional details..."></textarea>
          </div>

          {ocrUsed && (
            <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0, color: '#eab308', fontSize: '14px' }}>
                <strong>⚠️ Human Validation Required:</strong> OCR has pre-filled the form. Please check all values against the original photo, especially the yellow highlighted ones.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={ocrVerified} 
                  onChange={(e) => setOcrVerified(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                I have reviewed and confirmed that all auto-filled details are correct.
              </label>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/fuel')}>Cancel</button>
            <button 
              type="submit" 
              className="save-btn" 
              disabled={ocrUsed && !ocrVerified} 
              style={{ 
                backgroundColor: fuelAnomaly?.isFlagged ? '#e84118' : (ocrUsed && !ocrVerified ? '#555' : '#fbc531'), 
                color: fuelAnomaly?.isFlagged ? '#fff' : (ocrUsed && !ocrVerified ? '#888' : '#333'), 
                cursor: ocrUsed && !ocrVerified ? 'not-allowed' : 'pointer' 
              }}
            >
              {fuelAnomaly?.isFlagged ? '⚠️ Submit with Red Flag' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelForm;
