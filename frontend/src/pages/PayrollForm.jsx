import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdPayments } from 'react-icons/md';
import './AddVehicle.css';
import { useModal } from '../context/ModalContext';


const PayrollForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeType: 'Driver',
    month: '',
    year: '2026',
    basicSalary: '',
    allowances: '0',
    deductions: '0',
    netPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [employeeOptions, setEmployeeOptions] = useState([]);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/v1/fleet/drivers').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ])
    .then(([driversData, usersData]) => {
      const drivers = driversData.map(d => ({
        id: `D-${d.id}`,
        name: d.name,
        type: 'Driver',
        salaryAmount: d.salaryAmount || '',
        joinedDate: d.joinedDate || ''
      }));

      const staff = usersData
        .filter(u => u.role !== 'DRIVER')
        .map(u => ({
          id: `U-${u.id}`,
          name: u.name,
          type: u.role === 'SUPER_ADMIN' ? 'Admin' : 'Manager',
          salaryAmount: '',
          joinedDate: u.joinDate || ''
        }));

      setEmployeeOptions([...drivers, ...staff]);
    })
    .catch(err => console.error("Failed to load employees", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-fill salary and join date when employee is selected
      if (name === 'employeeId') {
        const selectedEmp = employeeOptions.find(emp => String(emp.id) === value);
        if (selectedEmp) {
          updated.basicSalary = selectedEmp.salaryAmount || '';
          if (selectedEmp.joinedDate) {
            updated.notes = `${selectedEmp.type} Joined: ${selectedEmp.joinedDate}`;
          } else {
            updated.notes = '';
          }
        }
      }

      if (name === 'basicSalary' || name === 'allowances' || name === 'deductions' || name === 'employeeId') {
        const basic = parseFloat(updated.basicSalary) || 0;
        const allowances = parseFloat(updated.allowances) || 0;
        const deductions = parseFloat(updated.deductions) || 0;
        updated.netPaid = (basic + allowances - deductions).toString();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Example: "August/2026"
    const monthYearStr = `${formData.month}/${formData.year}`;
    
    const selectedEmployee = employeeOptions.find(e => String(e.id) === String(formData.employeeId));
    
    // Extract real ID by stripping the prefix (e.g., "D-5" -> 5)
    const rawId = String(formData.employeeId);
    const realId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
    
    const payload = {
      employeeId: Number(realId) || 0,
      employeeType: selectedEmployee ? selectedEmployee.type : 'Driver',
      monthYear: monthYearStr,
      baseSalary: parseFloat(formData.basicSalary) || 0,
      deductions: parseFloat(formData.deductions) || 0,
      netPayable: parseFloat(formData.netPaid) || 0,
      status: 'Paid'
    };

    try {
      const response = await fetch('/api/v1/hr/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Payroll saved to database successfully');
        navigate('/payroll');
      } else {
        console.error('Failed to save payroll');
        showAlert('Failed to save payroll to database.');
      }
    } catch (error) {
      console.error('Error saving payroll:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <div className="form-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ color: '#e67e22', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MdPayments size={24} /> {isEdit ? 'Edit Salary' : 'Process Salary'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Employee <span className="required">*</span></label>
              <select name="employeeId" value={formData.employeeId} onChange={handleChange} required>
                <option value="">Select Employee</option>
                {employeeOptions.map(emp => (
                  <option key={`${emp.type}-${emp.id}`} value={emp.id}>
                    {emp.name} ({emp.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Month <span className="required">*</span></label>
              <select name="month" value={formData.month} onChange={handleChange} required>
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Year <span className="required">*</span></label>
              <select name="year" value={formData.year} onChange={handleChange} required>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div className="form-group">
              <label>Basic Salary (₹) <span className="required">*</span></label>
              <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} placeholder="e.g. 18000" required />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Allowances (₹)</label>
              <input type="number" name="allowances" value={formData.allowances} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Deductions (₹)</label>
              <input type="number" name="deductions" value={formData.deductions} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Net Paid (₹)</label>
              <input type="number" name="netPaid" value={formData.netPaid} readOnly style={{ backgroundColor: 'rgba(46, 213, 115, 0.08)', color: '#2ed573', fontWeight: 600 }} />
            </div>
          </div>

          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Payment Date <span className="required">*</span></label>
              <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional notes..." />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#e67e22', color: '#fff' }}>{isEdit ? 'Update Salary' : 'Process Salary'}</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/payroll')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollForm;


