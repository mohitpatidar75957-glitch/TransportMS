import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete, MdEventAvailable } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';


import { isValidName, sanitizeNameInput } from '../utils/validationUtils';

const AttendanceForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '',
    checkOut: '',
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;
    if (name === 'employee') {
      finalVal = sanitizeNameInput(value);
    }
    setFormData(prev => ({ ...prev, [name]: finalVal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee || !formData.employee.trim()) {
      showAlert('⚠️ Please enter employee name');
      return;
    }
    if (!isValidName(formData.employee)) {
      showAlert('⚠️ Employee name must only contain letters and spaces');
      return;
    }
    
    const payload = {
      date: formData.date,
      status: formData.status,
      employeeType: 'Staff', // Defaulting for now
      employeeId: 1, // Default dummy ID since no dropdown exists
      employeeName: formData.employee // newly added
    };

    try {
      const response = await fetch('/api/v1/hr/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Attendance saved to database successfully');
        navigate('/attendance');
      } else {
        console.error('Failed to save attendance');
        showAlert('Failed to save attendance to database.');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <div className="form-header" style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ color: '#e67e22', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MdEventAvailable size={24} /> Add Attendance
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Employee <span className="required">*</span></label>
              <input type="text" name="employee" value={formData.employee} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Status <span className="required">*</span></label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
            <div className="form-group">
              <label>Check‑In</label>
              <input type="time" name="checkIn" value={formData.checkIn} onChange={handleChange} />
            </div>
          </div>
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Check‑Out</label>
              <input type="time" name="checkOut" value={formData.checkOut} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#e67e22', color: '#fff' }}>Save Attendance</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/attendance')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
