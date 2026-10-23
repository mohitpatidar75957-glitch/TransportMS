import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdPersonAdd, MdEdit } from 'react-icons/md';
import './AddVehicle.css'; // Reusing form styles
import { useModal } from '../context/ModalContext';
import { 
  isValidPAN, 
  isValidPhone, 
  isValidName, 
  isValidAadhar,
  sanitizeNameInput, 
  sanitizeDigitsOnly, 
  sanitizeAlphaNumericUpper 
} from '../utils/validationUtils';

const DriverForm = () => {
  const { showAlert, showConfirm } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [errors, setErrors] = useState({});

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
                name: data.customer || data.name || prev.name,
                joinDate: data.date || prev.joinDate,
                licenseNo: data.licenseNo || prev.licenseNo,
                licenseExpiry: data.licenseExpiry || prev.licenseExpiry,
                aadharNo: data.aadharNo || prev.aadharNo,
                panNo: data.panNo || prev.panNo
              };
              return updated;
            });

            if (data.confidence) {
              const doubtful = Object.keys(data.confidence).filter(key => data.confidence[key] < 0.8);
              const mappedDoubtful = doubtful.map(k => {
                if (k === 'customer' || k === 'name') return 'name';
                if (k === 'date') return 'joinDate';
                return k; // licenseNo, licenseExpiry, aadharNo, panNo
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
    name: '',
    mobile: '',
    altMobile: '',
    licenseNo: '',
    licenseExpiry: '',
    aadharNo: '',
    panNo: '',
    address: '',
    bloodGroup: '',
    assignedVehicle: '',
    status: 'Active',
    salaryType: 'Monthly',
    salaryAmount: '',
    joinDate: ''
  });

  const [vehiclesList, setVehiclesList] = useState([]);

  useEffect(() => {
    fetch('/api/v1/fleet/vehicles')
      .then(res => res.json())
      .then(data => setVehiclesList(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to fetch vehicles:', err);
        setVehiclesList([]);
      });
  }, []);

  useEffect(() => {
    if (isEdit) {
      if (id.startsWith('db-')) {
        const dbId = id.replace('db-', '');
        fetch('/api/v1/fleet/drivers')
          .then(res => res.json())
          .then(data => {
            const driver = data.find(d => String(d.id) === dbId);
            if (driver) {
              setFormData(prev => ({
                ...prev,
                name: driver.name || '',
                mobile: driver.phone || '',
                altMobile: driver.altPhone || '',
                licenseNo: driver.licenseNumber || '',
                licenseExpiry: driver.licenseExpiry || '',
                aadharNo: driver.aadharNumber || '',
                panNo: driver.panNumber || '',
                bloodGroup: driver.bloodGroup || '',
                address: driver.address || '',
                assignedVehicle: driver.assignedVehicle ? String(driver.assignedVehicle.id) : '',
                status: driver.status || 'Active',
                salaryType: driver.salaryType || 'Monthly',
                salaryAmount: driver.salaryAmount != null ? String(driver.salaryAmount) : '',
                joinDate: driver.joinedDate || ''
              }));
            }
          })
          .catch(err => console.error("Error fetching driver:", err));
      }
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;

    if (name === 'name') {
      finalVal = sanitizeNameInput(value);
    } else if (name === 'mobile' || name === 'altMobile') {
      finalVal = sanitizeDigitsOnly(value, 10);
    } else if (name === 'licenseNo') {
      finalVal = sanitizeAlphaNumericUpper(value, 20);
    } else if (name === 'panNo') {
      finalVal = sanitizeAlphaNumericUpper(value, 10);
    } else if (name === 'aadharNo') {
      finalVal = sanitizeDigitsOnly(value, 12);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalVal
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateDriverForm = () => {
    const errs = {};

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Driver full name is required';
    } else if (!isValidName(formData.name)) {
      errs.name = 'Driver name should contain only letters and spaces';
    }

    if (!formData.mobile || !formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!isValidPhone(formData.mobile, true)) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (formData.altMobile && formData.altMobile.trim()) {
      if (!isValidPhone(formData.altMobile, true)) {
        errs.altMobile = 'Enter a valid 10-digit alternate mobile number';
      }
    }

    if (!formData.licenseNo || !formData.licenseNo.trim()) {
      errs.licenseNo = 'Driving License number is required';
    }

    if (formData.aadharNo && formData.aadharNo.trim()) {
      if (!isValidAadhar(formData.aadharNo)) {
        errs.aadharNo = 'Aadhar number must be exactly 12 digits';
      }
    }

    if (formData.panNo && formData.panNo.trim()) {
      if (!isValidPAN(formData.panNo)) {
        errs.panNo = 'PAN number must be 10 characters (e.g. ABCDE1234F)';
      }
    }

    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrs = validateDriverForm();
    if (Object.keys(formErrs).length > 0) {
      const firstMsg = Object.values(formErrs)[0];
      showAlert(`⚠️ Please correct the error:\n${firstMsg}`);
      return;
    }
    
    const payload = {
      name: formData.name.trim(),
      phone: formData.mobile.trim(),
      altPhone: formData.altMobile ? formData.altMobile.trim() : null,
      licenseNumber: formData.licenseNo.trim(),
      licenseExpiry: formData.licenseExpiry || null,
      aadharNumber: formData.aadharNo ? formData.aadharNo.trim() : null,
      panNumber: formData.panNo ? formData.panNo.trim() : null,
      bloodGroup: formData.bloodGroup || null,
      address: formData.address || null,
      assignedVehicle: formData.assignedVehicle ? { id: Number(formData.assignedVehicle) } : null,
      status: formData.status,
      salaryType: formData.salaryType || 'Monthly',
      salaryAmount: formData.salaryAmount ? Number(formData.salaryAmount) : null,
      joinedDate: formData.joinDate || null
    };

    let method = 'POST';
    let url = '/api/v1/fleet/drivers';
    
    if (isEdit && String(id).startsWith('db-')) {
      method = 'PUT';
      url = `/api/v1/fleet/drivers/${id.replace('db-', '')}`;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Driver saved to database successfully');
        navigate('/drivers');
      } else {
        console.error('Failed to save driver');
        showAlert('Failed to save driver to database.');
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isEdit ? <MdEdit size={24} className="form-icon" /> : <MdPersonAdd size={24} className="form-icon" />}
            <h3 style={{ margin: 0 }}>{isEdit ? `Edit Driver — ${formData.name}` : 'Add New Driver'}</h3>
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
            <h4>Personal Information</h4>
          </div>
          
          <div className="form-grid-3">
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Mukesh Kumar"
                style={{ ...getFieldStyle('name'), ...(errors.name ? { borderColor: '#ef4444' } : {}) }}
                required
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label>Mobile Number <span className="required">*</span></label>
              <input 
                type="text" 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                style={errors.mobile ? { borderColor: '#ef4444' } : {}}
                required
              />
              {errors.mobile && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.mobile}</span>}
            </div>

            <div className="form-group">
              <label>Alternate Mobile</label>
              <input 
                type="text" 
                name="altMobile"
                value={formData.altMobile}
                onChange={handleChange}
                placeholder="10-digit alternate mobile"
                maxLength="10"
                style={errors.altMobile ? { borderColor: '#ef4444' } : {}}
              />
              {errors.altMobile && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.altMobile}</span>}
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Join Date</label>
              <input 
                type="date" 
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                style={getFieldStyle('joinDate')}
              />
            </div>
          </div>
          
          <div className="form-group full-width" style={{marginTop: '16px'}}>
            <label>Complete Address</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              placeholder="Residential address"
            ></textarea>
          </div>

          <div className="section-divider">
            <h4>Documentation</h4>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>License Number <span className="required">*</span></label>
              <input 
                type="text" 
                name="licenseNo"
                value={formData.licenseNo}
                onChange={handleChange}
                placeholder="e.g. DL-0420110012345"
                maxLength="20"
                style={{ ...getFieldStyle('licenseNo'), ...(errors.licenseNo ? { borderColor: '#ef4444' } : {}) }}
                required
              />
              {errors.licenseNo && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.licenseNo}</span>}
            </div>
            <div className="form-group">
              <label>License Expiry</label>
              <input 
                type="date" 
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                style={getFieldStyle('licenseExpiry')}
              />
            </div>
            <div className="form-group">
              <label>Aadhar Number</label>
              <input 
                type="text" 
                name="aadharNo"
                value={formData.aadharNo}
                onChange={handleChange}
                placeholder="12-digit Aadhar number"
                maxLength="12"
                style={{ ...getFieldStyle('aadharNo'), ...(errors.aadharNo ? { borderColor: '#ef4444' } : {}) }}
              />
              {errors.aadharNo && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.aadharNo}</span>}
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input 
                type="text" 
                name="panNo"
                value={formData.panNo}
                onChange={handleChange}
                placeholder="10-digit PAN (e.g. ABCDE1234F)"
                maxLength="10"
                style={{ ...getFieldStyle('panNo'), ...(errors.panNo ? { borderColor: '#ef4444' } : {}) }}
              />
              {errors.panNo && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.panNo}</span>}
            </div>
          </div>

          <div className="section-divider">
            <h4>Employment Details</h4>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Assigned Vehicle</label>
              <select name="assignedVehicle" value={formData.assignedVehicle} onChange={handleChange}>
                <option value="">None</option>
                {(vehiclesList || []).map(v => {
                  const regNo = v.registrationNumber || v.vehicleNumber || v.name || `Vehicle #${v.id}`;
                  const extraName = (v.name && v.registrationNumber && v.name !== v.registrationNumber) ? ` (${v.name})` : '';
                  return (
                    <option key={v.id} value={v.id}>
                      {regNo}{extraName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Trip">On Trip</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Salary / Payment Type</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'Monthly', label: 'Monthly Fixed', unit: '₹ / Month' },
                { id: 'Per Trip', label: 'Per Trip / KM', unit: '₹ / Trip or KM' },
                { id: 'Percentage', label: 'Percentage (%)', unit: '% Commission' }
              ].map(opt => {
                const isSelected = formData.salaryType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, salaryType: opt.id }))}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #8e44ad' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isSelected ? 'linear-gradient(135deg, #8e44ad, #6c5ce7)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #a0a0b0)',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? '0 4px 12px rgba(142, 68, 173, 0.35)' : 'none'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>
                {formData.salaryType === 'Monthly' && 'Monthly Salary (₹)'}
                {formData.salaryType === 'Per Trip' && 'Rate per Trip / KM (₹)'}
                {formData.salaryType === 'Percentage' && 'Commission Percentage (%)'}
              </label>
              <input 
                type="number" 
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleChange}
                placeholder={
                  formData.salaryType === 'Monthly' ? 'e.g. 18000' :
                  formData.salaryType === 'Per Trip' ? 'e.g. 500 or 5' : 'e.g. 10'
                }
              />
            </div>
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
              {isEdit ? 'Update Driver' : 'Save Driver'}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/drivers')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;


