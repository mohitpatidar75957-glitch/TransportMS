import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit, MdLocalShipping } from 'react-icons/md';
import './AddVehicle.css'; // Reusing form styles
import { useModal } from '../context/ModalContext';
import CitySearchInput from '../components/CitySearchInput';


const TripForm = () => {
  const { showAlert, showConfirm } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    tripId: isEdit ? id : `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    customer: '',
    customerContact: '',
    fromLocation: '',
    toLocation: '',
    vehicle: '',
    driver: '',
    freightAmount: '',
    advanceAmount: '',
    gstPercent: '',
    gstAmount: '',
    biltyCharge: '',
    loadingCharge: '',
    materialDescription: '',
    weight: '',
    weightUnit: 'Kg',
    consignorName: '',
    consignorGST: '',
    consignorContact: '',
    consigneeName: '',
    consigneeGST: '',
    consigneeContact: '',
    distance: '',
    status: 'Pending',
    notes: '',
    pickupAddress: '',
    deliveryAddress: '',
    ewayBillNumber: '',
    ewayBillExpiry: '',
    dbId: null
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    // Fetch options
    fetch('/api/v1/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setVehicles([]);
      });

    fetch('/api/v1/fleet/drivers')
      .then(res => res.json())
      .then(data => setDrivers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setDrivers([]);
      });

    // Fetch trip data if edit
    if (isEdit) {
      fetch('/api/v1/fleet/trips')
        .then(res => res.json())
        .then(data => {
          const trip = data.find(t => t.tripNumber === id);
          if (trip) {
            let fromLoc = '';
            let toLoc = '';
            if (trip.route) {
              if (trip.route.includes('→')) {
                const parts = trip.route.split('→');
                fromLoc = parts[0]?.trim();
                toLoc = parts[1]?.trim();
              } else if (trip.route.includes('to')) {
                const parts = trip.route.split('to');
                fromLoc = parts[0]?.trim();
                toLoc = parts[1]?.trim();
              } else {
                fromLoc = trip.route;
              }
            }

            setFormData(prev => ({
              ...prev,
              dbId: trip.id,
              customer: trip.clientName || trip.customer || 'Unknown',
              customerContact: trip.customerContact || '',
              fromLocation: fromLoc,
              toLocation: toLoc,
              vehicle: trip.vehicle ? trip.vehicle.id : '',
              driver: trip.driver ? trip.driver.id : '',
              freightAmount: trip.freightAmount || '',
              advanceAmount: trip.advanceAmount || '',
              gstPercent: trip.gstPercent || '',
              gstAmount: trip.gstAmount || '',
              biltyCharge: trip.biltyCharge || '',
              loadingCharge: trip.loadingCharge || '',
              materialDescription: trip.goodsType || trip.materialDescription || '',
              weight: trip.weight || '',
              weightUnit: trip.weightUnit || 'Kg',
              consignorName: trip.consignorName || trip.clientName || trip.customer || '',
              consignorGST: trip.consignorGST || '',
              consignorContact: trip.consignorContact || '',
              consigneeName: trip.consigneeName || '',
              consigneeGST: trip.consigneeGST || '',
              consigneeContact: trip.consigneeContact || '',
              distance: trip.distance || '',
              status: trip.status || 'Pending',
              notes: trip.notes || '',
              pickupAddress: trip.pickupAddress || '',
              deliveryAddress: trip.deliveryAddress || '',
              ewayBillNumber: trip.ewayBillNumber || '',
              ewayBillExpiry: trip.ewayBillExpiry ? trip.ewayBillExpiry.split('T')[0] : '',
              date: trip.startDate || prev.date
            }));
          }
        })
        .catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      tripNumber: formData.tripId,
      clientName: formData.customer,
      customerContact: formData.customerContact,
      route: `${formData.fromLocation} to ${formData.toLocation}`,
      startDate: formData.date,
      freightAmount: formData.freightAmount,
      advanceAmount: formData.advanceAmount,
      gstPercent: formData.gstPercent,
      gstAmount: formData.gstAmount,
      biltyCharge: formData.biltyCharge,
      loadingCharge: formData.loadingCharge,
      goodsType: formData.materialDescription,
      weight: formData.weight,
      weightUnit: formData.weightUnit,
      consignorName: formData.consignorName,
      consignorGST: formData.consignorGST,
      consignorContact: formData.consignorContact,
      consigneeName: formData.consigneeName,
      consigneeGST: formData.consigneeGST,
      consigneeContact: formData.consigneeContact,
      distance: formData.distance,
      status: formData.status,
      notes: formData.notes,
      pickupAddress: formData.pickupAddress,
      deliveryAddress: formData.deliveryAddress,
      ewayBillNumber: formData.ewayBillNumber,
      ewayBillExpiry: formData.ewayBillExpiry || null
    };

    if (formData.vehicle) payload.vehicle = { id: parseInt(formData.vehicle) };
    if (formData.driver) payload.driver = { id: parseInt(formData.driver) };

    const url = isEdit && formData.dbId 
      ? `/api/v1/fleet/trips/${formData.dbId}`
      : '/api/v1/fleet/trips';
    
    const method = isEdit && formData.dbId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Trip saved to database successfully');
        navigate('/trips');
      } else {
        console.error('Failed to save trip');
        showAlert('Failed to save trip to database.');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      showAlert('Error connecting to backend database.');
    }
  }; // Restored this missing closing brace

  const fileInputRef = React.useRef(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [doubtfulFields, setDoubtfulFields] = useState([]);
  const [ocrUsed, setOcrUsed] = useState(false);
  const [ocrVerified, setOcrVerified] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setOcrLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/v1/ocr/extract', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Update form with extracted data
            setFormData(prev => ({
              ...prev,
              customer: data.customer || prev.customer,
              weight: data.weight || prev.weight,
              freightAmount: data.freightAmount || prev.freightAmount,
              date: data.date || prev.date
            }));

            // Check for doubtful fields (confidence < 0.8)
            if (data.confidence) {
              const doubtful = Object.keys(data.confidence).filter(key => data.confidence[key] < 0.8);
              setDoubtfulFields(doubtful);
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

  // Helper to add yellow background if field is doubtful
  const getFieldStyle = (fieldName) => {
    return doubtfulFields.includes(fieldName) ? { backgroundColor: '#fef08a' } : {};
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isEdit ? <MdEdit size={24} className="form-icon" /> : <MdLocalShipping size={24} className="form-icon" />}
            <h3 style={{ margin: 0 }}>{isEdit ? `Edit Trip — ${formData.tripId}` : 'Create New Trip'}</h3>
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
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#6366f1', fontSize: '14px' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={ocrLoading}
          >
            <span style={{ fontSize: '16px' }}>📸</span> {ocrLoading ? 'Processing...' : 'Auto-fill via OCR'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="section-divider" style={{marginTop: 0}}>
            <h4>Trip Details</h4>
          </div>
          
          <div className="form-grid-4">
            <div className="form-group">
              <label>Trip ID</label>
              <input 
                type="text" 
                name="tripId"
                value={formData.tripId}
                disabled
                style={{opacity: 0.7, cursor: 'not-allowed'}}
              />
            </div>
            
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={getFieldStyle('date')}
                required
              />
            </div>

          </div>

          <div className="section-divider">
            <h4>Customer & Consignment Details</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
              <label>Customer (Billed To) <span className="required">*</span></label>
              <input 
                type="text" 
                name="customer"
                placeholder="e.g. Reliance Industries"
                value={formData.customer}
                onChange={handleChange}
                style={getFieldStyle('customer')}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Customer Contact (Phone)</label>
              <input 
                type="text" 
                name="customerContact"
                placeholder="Phone / Mobile"
                value={formData.customerContact}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Consignor (Sender) Name</label>
              <input 
                type="text" 
                name="consignorName"
                placeholder="Sender Name"
                value={formData.consignorName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Consignor (Sender) GST</label>
              <input 
                type="text" 
                name="consignorGST"
                placeholder="Sender GST (Optional)"
                value={formData.consignorGST}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Consignor (Sender) Contact</label>
              <input 
                type="text" 
                name="consignorContact"
                placeholder="Sender Phone / Mobile"
                value={formData.consignorContact}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Consignee (Receiver) Name</label>
              <input 
                type="text" 
                name="consigneeName"
                placeholder="Receiver Name"
                value={formData.consigneeName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Consignee (Receiver) GST</label>
              <input 
                type="text" 
                name="consigneeGST"
                placeholder="Receiver GST (Optional)"
                value={formData.consigneeGST}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Consignee (Receiver) Contact</label>
              <input 
                type="text" 
                name="consigneeContact"
                placeholder="Receiver Phone / Mobile"
                value={formData.consigneeContact}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-grid-2-mixed" style={{marginTop: '16px'}}>
             <div className="form-group">
              <label>From (Origin / Starting location) <span className="required">*</span></label>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CitySearchInput 
                  placeholder="Select or type Starting location..."
                  value={formData.fromLocation}
                  onChange={val => setFormData({ ...formData, fromLocation: val })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>To (Destination) <span className="required">*</span></label>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CitySearchInput 
                  placeholder="Select or type Destination..."
                  value={formData.toLocation}
                  onChange={val => setFormData({ ...formData, toLocation: val })}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / 2' }}>
              <label>Pickup Full Address</label>
              <textarea 
                name="pickupAddress"
                placeholder="Detailed Pickup Address"
                value={formData.pickupAddress}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
            <div className="form-group" style={{ gridColumn: '2 / 3' }}>
              <label>Delivery Full Address</label>
              <textarea 
                name="deliveryAddress"
                placeholder="Detailed Delivery Address"
                value={formData.deliveryAddress}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
          </div>

          <div className="section-divider">
            <h4>Resource Assignment</h4>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Vehicle <span className="required">*</span></label>
              <select name="vehicle" value={formData.vehicle} onChange={handleChange} required>
                <option value="">Select Vehicle</option>
                {(vehicles || []).map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} ({v.vehicleType})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Driver <span className="required">*</span></label>
              <select name="driver" value={formData.driver} onChange={handleChange} required>
                <option value="">Select Driver</option>
                {(drivers || []).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status <span className="required">*</span></label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Pending">Pending</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="section-divider">
            <h4>Commercials & Load Info</h4>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Freight Amount (₹) <span className="required">*</span></label>
              <input 
                type="number" 
                name="freightAmount"
                value={formData.freightAmount}
                onChange={(e) => {
                  handleChange(e);
                  const fr = parseFloat(e.target.value);
                  const pct = parseFloat(formData.gstPercent);
                  if (!isNaN(pct) && !isNaN(fr)) {
                    setFormData(prev => ({ ...prev, gstAmount: (fr * pct / 100).toFixed(2), freightAmount: e.target.value }));
                  } else {
                    setFormData(prev => ({ ...prev, freightAmount: e.target.value }));
                  }
                }}
                style={getFieldStyle('freightAmount')}
                required
              />
            </div>
            <div className="form-group">
              <label>Advance Received (₹)</label>
              <input 
                type="number" 
                name="advanceAmount"
                value={formData.advanceAmount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>GST Rate (%)</label>
              <input 
                type="number" 
                step="0.01"
                name="gstPercent"
                value={formData.gstPercent}
                onChange={(e) => {
                  handleChange(e);
                  const pct = parseFloat(e.target.value);
                  const fr = parseFloat(formData.freightAmount);
                  if (!isNaN(pct) && !isNaN(fr)) {
                    setFormData(prev => ({ ...prev, gstAmount: (fr * pct / 100).toFixed(2), gstPercent: e.target.value }));
                  } else {
                    setFormData(prev => ({ ...prev, gstPercent: e.target.value }));
                  }
                }}
                placeholder="e.g. 5 or 12"
              />
            </div>
            <div className="form-group">
              <label>GST Amount (₹)</label>
              <input 
                type="number" 
                name="gstAmount"
                value={formData.gstAmount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Bilty/GR Charge (₹)</label>
              <input 
                type="number" 
                name="biltyCharge"
                value={formData.biltyCharge}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Hamali/Loading (₹)</label>
              <input 
                type="number" 
                name="loadingCharge"
                value={formData.loadingCharge}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Material</label>
              <input 
                type="text" 
                name="materialDescription"
                placeholder="e.g. Steel Pipes"
                value={formData.materialDescription}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  style={{ flex: 2, ...getFieldStyle('weight') }}
                />
                <select 
                  name="weightUnit" 
                  value={formData.weightUnit} 
                  onChange={handleChange}
                  style={{ flex: 1 }}
                >
                  <option value="Kg">Kg</option>
                  <option value="Ton">Ton</option>
                  <option value="MT">MT</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Distance (km)</label>
              <input 
                type="number" 
                step="0.1"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Total Amount (₹)</label>
              <input 
                type="text" 
                value={
                  (parseFloat(formData.freightAmount || 0) + parseFloat(formData.gstAmount || 0)).toFixed(2)
                }
                disabled
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#20c997', fontWeight: 'bold' }}
              />
            </div>
          </div>

          <div className="form-group full-width" style={{marginTop: '16px'}}>
            <label>Notes / Instructions</label>
            <textarea 
              name="notes"
              placeholder="Any specific delivery instructions..." 
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            ></textarea>
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

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={ocrUsed && !ocrVerified} style={ocrUsed && !ocrVerified ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
              {isEdit ? 'Update Trip' : 'Create Trip'}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/trips')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;


