import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLocalShipping } from 'react-icons/md';
import './AddVehicle.css';
import { useModal } from '../context/ModalContext';
import { normalizeRegistrationNumber } from '../utils/registrationUtils';


const AddVehicle = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();

  const fileInputRef = React.useRef(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [doubtfulFields, setDoubtfulFields] = useState([]);
  const [ocrUsed, setOcrUsed] = useState(false);
  const [ocrVerified, setOcrVerified] = useState(false);

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
              const updated = {
                ...prev,
                ownerName: data.customer || prev.ownerName,
                capacity: data.weight || prev.capacity
              };
              return updated;
            });

            if (data.confidence) {
              const doubtful = Object.keys(data.confidence).filter(key => data.confidence[key] < 0.8);
              const mappedDoubtful = doubtful.map(k => k === 'customer' ? 'ownerName' : k === 'weight' ? 'capacity' : k);
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
    vehicleNumber: '',
    vehicleName: '',
    vehicleType: 'Truck',
    model: '',
    chassisNumber: '',
    engineNumber: '',
    ownerName: '',
    capacity: '',
    fuelType: 'Diesel',
    average: '',
    insuranceExpiry: '',
    pucExpiry: '',
    permitExpiry: '',
    fitnessExpiry: '',
    status: 'Active',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedRegNumber = normalizeRegistrationNumber(formData.vehicleNumber);
    
    const payload = {
      registrationNumber: formattedRegNumber,
      name: formData.vehicleName,
      type: formData.vehicleType,
      capacity: formData.capacity,
      status: formData.status,
      ownership: formData.ownerName || 'Owned',
      mileage: formData.average ? parseFloat(formData.average) : 10.0,
      model: formData.model,
      chassisNumber: formData.chassisNumber,
      engineNumber: formData.engineNumber,
      fuelType: formData.fuelType || 'Diesel',
      notes: formData.notes || null,
      insuranceExpiry: formData.insuranceExpiry,
      pucExpiry: formData.pucExpiry,
      permitExpiry: formData.permitExpiry,
      fitnessExpiry: formData.fitnessExpiry
    };

    try {
      const response = await fetch('/api/v1/fleet/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Vehicle saved to database successfully');
        navigate('/vehicles');
      } else {
        console.error('Failed to save vehicle');
        showAlert('Failed to save vehicle to database.');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdLocalShipping size={24} className="form-icon" />
            <h3 style={{ margin: 0 }}>Add New Vehicle</h3>
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
          <div className="form-grid-3">
            <div className="form-group">
              <label>Vehicle Number <span className="required">*</span></label>
              <input 
                type="text" 
                name="vehicleNumber"
                placeholder="MH-01-AB-1234" 
                value={formData.vehicleNumber}
                onChange={handleChange}
                onBlur={(e) => {
                  const formatted = normalizeRegistrationNumber(e.target.value);
                  if (formatted !== e.target.value) {
                    setFormData(prev => ({ ...prev, vehicleNumber: formatted }));
                  }
                }}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Vehicle Name <span className="required">*</span></label>
              <input 
                type="text" 
                name="vehicleName"
                placeholder="e.g. Tata 407" 
                value={formData.vehicleName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type <span className="required">*</span></label>
              <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
                <option value="Truck">Truck</option>
                <option value="Tempo">Tempo</option>
                <option value="Pickup">Pickup</option>
                <option value="Bolero">Bolero</option>
                <option value="Tata 1512">Tata 1512</option>
                <option value="Trailer">Trailer</option>
                <option value="Container">Container</option>
                <option value="Mini Truck">Mini Truck</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Model</label>
              <input 
                type="text" 
                name="model"
                placeholder="e.g. 2022" 
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Chassis Number</label>
              <input 
                type="text" 
                name="chassisNumber"
                value={formData.chassisNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Engine Number</label>
              <input 
                type="text" 
                name="engineNumber"
                value={formData.engineNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Owner Name</label>
              <input 
                type="text" 
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                style={getFieldStyle('ownerName')}
              />
            </div>

            <div className="form-group">
              <label>Capacity (Ton)</label>
              <input 
                type="number" 
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                style={getFieldStyle('capacity')}
              />
            </div>

            <div className="form-group">
              <label>Fuel Type</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div className="form-group">
              <label>Average (KM/L) <span className="required">*</span></label>
              <input 
                type="number" 
                name="average"
                step="0.1"
                placeholder="e.g. 10.5" 
                value={formData.average}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="section-divider">
            <h4>Document Expiry Dates</h4>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Insurance Expiry</label>
              <input 
                type="date" 
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>PUC Expiry</label>
              <input 
                type="date" 
                name="pucExpiry"
                value={formData.pucExpiry}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Permit Expiry</label>
              <input 
                type="date" 
                name="permitExpiry"
                value={formData.permitExpiry}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Fitness Expiry</label>
              <input 
                type="date" 
                name="fitnessExpiry"
                value={formData.fitnessExpiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Status <span className="required">*</span></label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
            <div className="form-group">
              <label>RC Document</label>
              <input 
                type="file" 
                className="file-input"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <span className="file-help-text">PDF, JPG, PNG (max 5MB)</span>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea 
              name="notes"
              placeholder="Any notes..." 
              value={formData.notes}
              onChange={handleChange}
              rows="4"
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
              Save Vehicle
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
