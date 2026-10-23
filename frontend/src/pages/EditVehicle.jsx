import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit } from 'react-icons/md';
import './AddVehicle.css'; // Reusing AddVehicle styles
import { useModal } from '../context/ModalContext';
import { normalizeRegistrationNumber } from '../utils/registrationUtils';


const EditVehicle = () => {
  const { showAlert, showConfirm } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const realId = id.startsWith('db-') ? id.replace('db-', '') : id;
        const response = await fetch(`/api/v1/fleet/vehicles/${realId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            vehicleNumber: data.registrationNumber || '',
            vehicleName: data.name || '',
            vehicleType: data.type || 'Truck',
            model: data.model || '',
            chassisNumber: data.chassisNumber || '',
            engineNumber: data.engineNumber || '',
            ownerName: data.ownership || 'Owned',
            capacity: data.capacity ? data.capacity.replace(' Tons', '') : '',
            fuelType: 'Diesel',
            average: data.mileage ? data.mileage.toString() : '',
            insuranceExpiry: data.insuranceExpiry ? data.insuranceExpiry.substring(0, 10) : '',
            pucExpiry: data.pucExpiry ? data.pucExpiry.substring(0, 10) : '',
            permitExpiry: data.permitExpiry ? data.permitExpiry.substring(0, 10) : '',
            fitnessExpiry: data.fitnessExpiry ? data.fitnessExpiry.substring(0, 10) : '',
            status: data.status || 'Active',
            fuelType: data.fuelType || 'Diesel',
            notes: data.notes || ''
          });
        } else {
          setFormData(prev => ({ ...prev, vehicleNumber: `TEST-VEH-${id}` }));
        }
      } catch (err) {
        console.error('Failed to fetch vehicle details:', err);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Extract real ID if it has 'db-' prefix
    const realId = id.startsWith('db-') ? id.replace('db-', '') : id;

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
      const response = await fetch(`/api/v1/fleet/vehicles/${realId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Vehicle updated successfully');
        navigate('/vehicles');
      } else {
        showAlert('Failed to update vehicle.');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      showAlert('Error connecting to backend.');
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header">
          <MdEdit size={24} className="form-icon" />
          <h3>Edit Vehicle — {formData.vehicleNumber}</h3>
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
              />
            </div>

            <div className="form-group">
              <label>Capacity (Ton)</label>
              <input 
                type="number" 
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
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
              <span className="file-help-text">Choose File (No file chosen)</span>
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

          <div className="form-actions">
            <button type="submit" className="save-btn">
              Update Vehicle
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

export default EditVehicle;
