import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdStore } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';

import { 
  isValidGST, 
  isValidPAN, 
  isValidPhone, 
  isValidName, 
  sanitizeNameInput, 
  sanitizeDigitsOnly, 
  sanitizeAlphaNumericUpper 
} from '../utils/validationUtils';

const VendorForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { showAlert } = useModal();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    commissionType: 'None',
    commissionValue: '0',
    openingBalance: '0',
    balanceType: 'Credit',
    city: '',
    gstNumber: '',
    pan: '',
    bankDetails: '',
    address: '',
    status: 'Active',
    services: []
  });

  const availableServices = ['Transport', 'Vehicle', 'Maintenance', 'Fuel', 'Parking', 'Other'];

  useEffect(() => {
    if (isEditMode) {
      const fetchVendor = async () => {
        try {
          const response = await fetch(`/api/v1/resources/vendors/${id}`);
          if (response.ok) {
            const data = await response.json();
            
            let cityVal = '';
            let addrVal = data.address || '';
            if (addrVal.includes(',')) {
              const parts = addrVal.split(',');
              cityVal = parts[0].trim();
              addrVal = parts.slice(1).join(',').trim();
            } else {
              cityVal = addrVal;
            }

            const rawBal = data.balance != null ? data.balance : 0;
            const balType = rawBal < 0 ? 'Debit' : 'Credit';

            setFormData({
              companyName: data.name || '',
              contactPerson: data.contactPerson || '',
              mobile: data.mobileNumber || '',
              email: data.email || '',
              commissionType: 'None',
              commissionValue: '0',
              openingBalance: String(Math.abs(rawBal)),
              balanceType: balType,
              city: cityVal,
              gstNumber: data.gstin || '',
              pan: data.pan || '',
              bankDetails: data.bankDetails || '',
              address: addrVal,
              status: data.status || 'Active',
              services: data.services || []
            });
          } else {
            showAlert('Failed to load vendor details.');
          }
        } catch (error) {
          console.error('Error fetching vendor for edit:', error);
          showAlert('Network error loading vendor details.');
        }
      };
      fetchVendor();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => {
        let newServices = [...prev.services];
        if (checked) {
          newServices.push(value);
        } else {
          newServices = newServices.filter(s => s !== value);
        }
        return { ...prev, services: newServices };
      });
    } else {
      let finalVal = value;
      if (name === 'contactPerson') {
        finalVal = sanitizeNameInput(value);
      } else if (name === 'mobile') {
        finalVal = sanitizeDigitsOnly(value, 10);
      } else if (name === 'gstNumber') {
        finalVal = sanitizeAlphaNumericUpper(value, 15);
      } else if (name === 'pan') {
        finalVal = sanitizeAlphaNumericUpper(value, 10);
      }

      setFormData(prev => ({
        ...prev,
        [name]: finalVal
      }));

      // Clear field error on change
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const validateForm = () => {
    const errs = {};

    if (!formData.companyName || !formData.companyName.trim()) {
      errs.companyName = 'Company name is required';
    }

    if (!formData.contactPerson || !formData.contactPerson.trim()) {
      errs.contactPerson = 'Contact person name is required';
    } else if (!isValidName(formData.contactPerson)) {
      errs.contactPerson = 'Contact person should contain only alphabets and spaces';
    }

    if (!formData.mobile || !formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!isValidPhone(formData.mobile, true)) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (formData.gstNumber && formData.gstNumber.trim()) {
      if (!isValidGST(formData.gstNumber)) {
        errs.gstNumber = 'Invalid GST format! Must be 15 alphanumeric characters (e.g. 23AADCR1234F1Z5)';
      }
    }

    if (formData.pan && formData.pan.trim()) {
      if (!isValidPAN(formData.pan)) {
        errs.pan = 'Invalid PAN format! Must be 10 characters (e.g. ABCDE1234F)';
      }
    }

    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      const firstError = Object.values(formErrors)[0];
      showAlert(`⚠️ Please correct the errors:\n${firstError}`);
      return;
    }
    
    let parsedBal = Math.abs(parseFloat(formData.openingBalance) || 0);
    let bal = formData.balanceType === 'Debit' ? -parsedBal : parsedBal;

    const payload = {
      name: formData.companyName,
      contactPerson: formData.contactPerson,
      mobileNumber: formData.mobile,
      email: formData.email,
      address: formData.address ? `${formData.city}, ${formData.address}` : formData.city,
      gstin: formData.gstNumber,
      pan: formData.pan,
      bankDetails: formData.bankDetails,
      status: formData.status,
      services: formData.services,
      balance: bal
    };

    try {
      const url = isEditMode ? `/api/v1/resources/vendors/${id}` : '/api/v1/resources/vendors';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`Vendor ${isEditMode ? 'updated' : 'saved'} successfully`);
        navigate('/vendors');
      } else {
        const errorText = await response.text();
        console.error('Failed to save vendor:', errorText);
        showAlert(errorText || `Failed to ${isEditMode ? 'update' : 'save'} vendor.`);
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', padding: '8px', borderRadius: '8px', background: 'rgba(142, 68, 173, 0.12)', color: '#8e44ad' }}>
              <MdStore size={22} />
            </span>
            {isEditMode ? 'Edit Vendor' : 'Add New Vendor'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Company / Shop Name <span className="required">*</span></label>
              <input 
                type="text" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange} 
                placeholder="e.g. Agarwal Motors"
                required 
              />
              {errors.companyName && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.companyName}</span>}
            </div>
            <div className="form-group">
              <label>Contact Person <span className="required">*</span></label>
              <input 
                type="text" 
                name="contactPerson" 
                value={formData.contactPerson} 
                onChange={handleChange} 
                placeholder="e.g. Ramesh Sharma"
                required 
              />
              {errors.contactPerson && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.contactPerson}</span>}
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Mobile Number <span className="required">*</span></label>
              <input 
                type="text" 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
                placeholder="10-digit mobile number"
                maxLength="10"
                required 
              />
              {errors.mobile && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="vendor@example.com" />
            </div>
          </div>

          <div className="section-divider" style={{ marginTop: '16px' }}>
            <h4>Vendor Services</h4>
          </div>
          <div className="form-group full-width">
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {availableServices.map(service => (
                <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'normal' }}>
                  <input 
                    type="checkbox" 
                    name="services" 
                    value={service} 
                    checked={formData.services.includes(service)}
                    onChange={handleChange}
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          <div className="section-divider" style={{ marginTop: '16px' }}>
            <h4>Financial & Bank Details</h4>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Opening Balance (₹)</label>
              <input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Balance Type</label>
              <select name="balanceType" value={formData.balanceType} onChange={handleChange}>
                <option value="Credit">Payable</option>
                <option value="Debit">Receivable</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>Bank Details</label>
            <textarea name="bankDetails" value={formData.bankDetails} onChange={handleChange} rows="2" placeholder="Account No, IFSC Code, Bank Name"></textarea>
          </div>

          <div className="section-divider" style={{ marginTop: '16px' }}>
            <h4>Location & Compliance</h4>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>City <span className="required">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input 
                type="text" 
                name="gstNumber" 
                value={formData.gstNumber} 
                onChange={handleChange} 
                placeholder="15-digit GST (e.g. 23AADCR1234F1Z5)" 
                maxLength="15"
                style={errors.gstNumber ? { borderColor: '#ef4444' } : {}}
              />
              {errors.gstNumber && <span style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px' }}>{errors.gstNumber}</span>}
            </div>
            <div className="form-group">
              <label>PAN</label>
              <input 
                type="text" 
                name="pan" 
                value={formData.pan} 
                onChange={handleChange} 
                placeholder="10-digit PAN (e.g. ABCDE1234F)" 
                maxLength="10"
                style={errors.pan ? { borderColor: '#ef4444' } : {}}
              />
              {errors.pan && <span style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px' }}>{errors.pan}</span>}
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>Complete Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="2"></textarea>
          </div>

          <div className="form-group" style={{ marginTop: '16px', maxWidth: '200px' }}>
            <label>Status <span className="required">*</span></label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#8e44ad', color: '#fff' }}>
              {isEditMode ? 'Update Vendor' : 'Save Vendor'}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/vendors')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;




