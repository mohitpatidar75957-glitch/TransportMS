import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCloudUpload, MdKeyboardArrowDown, MdDescription, MdDirectionsCar, MdPerson, MdCalendarToday, MdAttachFile } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';

// Same CustomSelect style as NewTrip page
const CustomSelect = ({ name, value, onChange, options, placeholder = '-- None --' }) => {
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
            onClick={() => { onChange({ target: { name, value: '' } }); setIsOpen(false); }}
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
                onClick={() => { onChange({ target: { name, value: opt.value } }); setIsOpen(false); }}
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


const DocumentUpload = () => {
  const { showAlert } = useModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    type: 'RC',
    expiryDate: '',
    vehicleId: '',
    driverId: '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/fleet/vehicles').then(res => res.json()),
      fetch('/api/v1/fleet/drivers').then(res => res.json())
    ])
      .then(([vData, dData]) => {
        setVehicles(Array.isArray(vData) ? vData : []);
        setDrivers(Array.isArray(dData) ? dData : []);
      })
      .catch(err => console.error('Failed to load options', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type) {
      showAlert('Title and Type are required.');
      return;
    }
    if (!selectedFile) {
      showAlert('Please select a file to upload.');
      return;
    }
    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);

      const uploadRes = await fetch('/api/v1/management/documents/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!uploadRes.ok) {
        showAlert('Failed to upload file to server.');
        setLoading(false);
        return;
      }

      const { fileUrl } = await uploadRes.json();
      const payload = {
        title: formData.title,
        type: formData.type,
        expiryDate: formData.expiryDate || null,
        fileUrl
      };

      if (formData.vehicleId) payload.vehicle = { id: parseInt(formData.vehicleId) };
      if (formData.driverId) payload.driver = { id: parseInt(formData.driverId) };

      const response = await fetch('/api/v1/management/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showAlert('Document uploaded successfully!');
        navigate('/documents');
      } else {
        showAlert('Failed to save document.');
      }
    } catch (error) {
      console.error(error);
      showAlert('Network error saving document.');
    }
    setLoading(false);
  };

  const vehicleOptions = vehicles.map(v => ({
    value: v.id,
    label: `${v.registrationNumber}${v.name ? ` — ${v.name}` : ''}`
  }));

  const driverOptions = drivers.map(d => ({
    value: d.id,
    label: d.name
  }));

  const docTypeOptions = [
    { value: 'RC', label: 'RC' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'PUC', label: 'PUC' },
    { value: 'Permit', label: 'Permit' },
    { value: 'Fitness', label: 'Fitness' },
    { value: 'Tax', label: 'Tax' },
    { value: 'License', label: 'License' },
    { value: 'Aadhar', label: 'Aadhar' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Other', label: 'Other' },
  ];

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    marginBottom: '8px',
  };

  const sectionStyle = {
    marginBottom: '20px',
  };

  return (
    <div className="vehicles-container">
      <div className="panel" style={{ padding: '0', overflow: 'visible' }}>

        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(9,132,227,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MdCloudUpload size={20} style={{ color: '#0984e3' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Upload Document
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Attach documents to vehicles or drivers
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px' }}>

          {/* Document Title */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              <MdDescription size={14} />
              Document Title <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Vehicle Insurance 2024"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#0984e3'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Row: Document Type + Expiry Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Document Type <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <CustomSelect
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={docTypeOptions}
                placeholder="Select Type"
              />
            </div>
            <div>
              <label style={labelStyle}>
                <MdCalendarToday size={14} />
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = '#0984e3'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          {/* Row: Link to Vehicle + Link to Driver */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                <MdDirectionsCar size={14} />
                Link to Vehicle
              </label>
              <CustomSelect
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                options={vehicleOptions}
              />
            </div>
            <div>
              <label style={labelStyle}>
                <MdPerson size={14} />
                Link to Driver
              </label>
              <CustomSelect
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                options={driverOptions}
              />
            </div>
          </div>

          {/* Select File */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              <MdAttachFile size={14} />
              Select File <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <div style={{
              border: '1.5px dashed var(--border-color)',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              background: selectedFile ? 'rgba(9,132,227,0.04)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                id="file-upload"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>📄</div>
                    <div style={{ color: '#0984e3', fontWeight: 600, fontSize: '14px' }}>{selectedFile.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>☁️</div>
                    <div style={{ color: '#0984e3', fontWeight: 600, fontSize: '14px' }}>Click to choose file</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                      PDF, JPG, PNG (Max 10MB)
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#666' : '#c0392b',
                color: 'white',
                border: 'none',
                padding: '11px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
            >
              <MdCloudUpload size={18} />
              {loading ? 'Uploading...' : 'Upload Now'}
            </button>
            <button
              onClick={() => navigate('/documents')}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-color)',
                padding: '11px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
