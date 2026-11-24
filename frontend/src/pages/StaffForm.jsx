import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdGroups } from 'react-icons/md';
import './AddVehicle.css';
import { useModal } from '../context/ModalContext';


import { 
  isValidPhone, 
  isValidName, 
  sanitizeNameInput, 
  sanitizeDigitsOnly 
} from '../utils/validationUtils';

const StaffForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    role: 'Labor',
    mobile: '',
    salary: '',
    advance: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;
    if (name === 'name') {
      finalVal = sanitizeNameInput(value);
    } else if (name === 'mobile') {
      finalVal = sanitizeDigitsOnly(value, 10);
    }
    setFormData(prev => ({ ...prev, [name]: finalVal }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.name.trim()) {
      showAlert('⚠️ Please enter employee name');
      return;
    }
    if (!isValidName(formData.name)) {
      showAlert('⚠️ Employee name should contain only letters and spaces');
      return;
    }

    if (formData.mobile && !isValidPhone(formData.mobile, true)) {
      showAlert('⚠️ Please enter a valid 10-digit mobile number');
      return;
    }
    
    const payload = {
      name: formData.name.trim(),
      role: formData.role,
      phone: formData.mobile ? formData.mobile.trim() : null,
      salary: parseFloat(formData.salary) || 0
      // Advance and Status are not currently in the Staff entity, but can be managed if added later
    };

    try {
      const response = await fetch('/api/v1/hr/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Staff saved to database successfully');
        navigate('/staff');
      } else {
        console.error('Failed to save staff');
        showAlert('Failed to save staff to database.');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ color: '#8e44ad', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MdGroups size={24} /> {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter employee name" required />
            </div>
            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="Labor">Labor</option>
                <option value="Office Staff">Office Staff</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Mobile</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter mobile number" />
            </div>
            <div className="form-group">
              <label>Monthly Salary (₹) <span className="required">*</span></label>
              <input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. 18000" required />
            </div>
          </div>
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Advance (₹)</label>
              <input type="number" name="advance" value={formData.advance} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Status <span className="required">*</span></label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#8e44ad', color: '#fff' }}>{isEdit ? 'Update Employee' : 'Save Employee'}</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/staff')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
