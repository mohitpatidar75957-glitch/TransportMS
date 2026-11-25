import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { 
  MdPayments, 
  MdArrowBack, 
  MdCheckCircle, 
  MdAccountBalance, 
  MdAttachMoney, 
  MdPerson,
  MdCreditCard
} from 'react-icons/md';
import './AddVehicle.css';

const PayrollForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeType: 'Driver',
    month: 'January',
    year: '2026',
    basicSalary: '',
    allowances: '0',
    deductions: '0',
    netPaid: '0',
    paymentMode: 'Bank Transfer',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [driversRes, staffRes] = await Promise.all([
        fetch('/api/v1/drivers').catch(() => null),
        fetch('/api/v1/staff').catch(() => null)
      ]);

      const drivers = driversRes && driversRes.ok ? await driversRes.json() : [];
      const staff = staffRes && staffRes.ok ? await staffRes.json() : [];

      const driverList = Array.isArray(drivers) ? drivers : (drivers.content || []);
      const staffList = Array.isArray(staff) ? staff : (staff.content || []);

      const formattedDrivers = driverList.map(d => ({
        id: d.id,
        name: d.name,
        type: 'Driver',
        salary: d.salary || 25000,
        phone: d.phone,
        joinedDate: d.joinedDate
      }));

      const formattedStaff = staffList.map(s => ({
        id: s.id,
        name: s.name,
        type: s.role || 'Staff',
        salary: s.salary || 30000,
        phone: s.phone,
        joinedDate: s.joiningDate
      }));

      const allEmps = [...formattedDrivers, ...formattedStaff];
      setEmployeeOptions(allEmps);

      if (isEdit) {
        const res = await fetch(`/api/v1/hr/payroll/${id}`);
        if (res.ok) {
          const data = await res.json();
          let parsedMonth = 'January';
          let parsedYear = '2026';
          if (data.monthYear) {
            const parts = data.monthYear.split(' ');
            if (parts.length >= 2) {
              parsedMonth = parts[0];
              parsedYear = parts[1];
            } else {
              parsedMonth = data.monthYear;
            }
          }

          setFormData({
            employeeId: data.employeeId || '',
            employeeType: data.employeeType || 'Driver',
            month: parsedMonth,
            year: parsedYear,
            basicSalary: data.baseSalary || '',
            allowances: data.allowances || '0',
            deductions: data.deductions || '0',
            netPaid: data.netPayable || '',
            paymentMode: data.paymentMode || 'Bank Transfer',
            bankName: data.bankName || '',
            accountNumber: data.accountNumber || '',
            ifscCode: data.ifscCode || '',
            transactionRef: data.transactionRef || '',
            paymentDate: data.paymentDate ? data.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
            status: data.status || 'Pending'
          });
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      showAlert('Failed to load employee & payroll details');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetPaid = (basic, allow, ded) => {
    const b = parseFloat(basic) || 0;
    const a = parseFloat(allow) || 0;
    const d = parseFloat(ded) || 0;
    return Math.max(0, b + a - d);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'employeeId') {
      const selectedEmp = employeeOptions.find(emp => String(emp.id) === String(value));
      if (selectedEmp) {
        updated.employeeType = selectedEmp.type;
        if (!updated.basicSalary || updated.basicSalary === '0') {
          updated.basicSalary = selectedEmp.salary || '';
        }
      }
    }

    if (['basicSalary', 'allowances', 'deductions'].includes(name)) {
      const b = name === 'basicSalary' ? value : updated.basicSalary;
      const a = name === 'allowances' ? value : updated.allowances;
      const d = name === 'deductions' ? value : updated.deductions;
      updated.netPaid = calculateNetPaid(b, a, d);
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      showAlert('Please select an employee.');
      return;
    }

    const selectedEmployee = employeeOptions.find(emp => String(emp.id) === String(formData.employeeId));
    const realId = selectedEmployee ? selectedEmployee.id : formData.employeeId;
    const monthYearStr = `${formData.month} ${formData.year}`;

    const payload = {
      employeeId: Number(realId) || 0,
      employeeType: selectedEmployee ? selectedEmployee.type : formData.employeeType,
      monthYear: monthYearStr,
      baseSalary: parseFloat(formData.basicSalary) || 0,
      allowances: parseFloat(formData.allowances) || 0,
      deductions: parseFloat(formData.deductions) || 0,
      netPayable: parseFloat(formData.netPaid) || 0,
      status: formData.status || 'Pending'
    };

    try {
      let response;
      if (isEdit) {
        response = await fetch(`/api/v1/hr/payroll/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/v1/hr/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        showAlert(`Salary record ${isEdit ? 'updated' : 'processed'} successfully!`);
        navigate('/payroll');
      } else {
        showAlert('Failed to save salary details to database.');
      }
    } catch (error) {
      showAlert('Error connecting to backend database: ' + error.message);
    }
  };

  const selectedEmpObj = employeeOptions.find(e => String(e.id) === String(formData.employeeId));

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading salary details...</div>;
  }

  return (
    <div className="add-vehicle-container" style={{ maxWidth: '100%', width: '100%', padding: '24px 32px' }}>
      <div className="form-panel" style={{ maxWidth: '100%', width: '100%', margin: 0, padding: '24px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/payroll')} 
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
            >
              <MdArrowBack size={20} />
            </button>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MdPayments size={24} style={{ color: '#0984e3' }} /> 
                {isEdit ? 'Edit Salary Details' : 'Process Employee Salary'}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Full employee payroll breakdown, payment mode, bank accounts & transaction status
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontWeight: 700, 
              fontSize: '13px',
              background: formData.status === 'Paid' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(251, 197, 49, 0.15)',
              color: formData.status === 'Paid' ? '#2ed573' : '#f39c12',
              border: `1px solid ${formData.status === 'Paid' ? '#2ed573' : 'rgba(251, 197, 49, 0.6)'}`
            }}>
              Status: {formData.status}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form" style={{ width: '100%' }}>
          {/* 2-Column Full Width Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', width: '100%' }}>
            
            {/* LEFT COLUMN: Employee Info & Salary Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Employee & Month Card */}
              <div style={{ background: 'var(--bg-surface-elevated, rgba(255,255,255,0.02))', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#0984e3', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdPerson size={18} /> Employee & Period Details
                </h4>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontWeight: 600 }}>Employee <span className="required">*</span></label>
                  <select name="employeeId" value={formData.employeeId} onChange={handleChange} required disabled={isEdit} style={{ width: '100%', padding: '10px 12px' }}>
                    <option value="">Select Employee</option>
                    {employeeOptions.map(emp => (
                      <option key={`${emp.type}-${emp.id}`} value={emp.id}>
                        {emp.name} ({emp.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 600 }}>Salary Month <span className="required">*</span></label>
                    <select name="month" value={formData.month} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px' }}>
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

                  <div className="form-group">
                    <label style={{ fontWeight: 600 }}>Year <span className="required">*</span></label>
                    <select name="year" value={formData.year} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px' }}>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>

                {selectedEmpObj && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                    <span><strong>Role:</strong> {selectedEmpObj.type}</span>
                    <span><strong>Phone:</strong> {selectedEmpObj.phone || 'N/A'}</span>
                    <span><strong>Joined:</strong> {selectedEmpObj.joinedDate || 'Active'}</span>
                  </div>
                )}
              </div>

              {/* Salary Breakdown Card */}
              <div style={{ background: 'var(--bg-surface-elevated, rgba(255,255,255,0.02))', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#2ed573', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdAttachMoney size={18} /> Salary & Allowances Breakdown
                </h4>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontWeight: 600 }}>Basic Salary (₹) <span className="required">*</span></label>
                  <input 
                    type="number" 
                    name="basicSalary" 
                    value={formData.basicSalary} 
                    onChange={handleChange} 
                    placeholder="25000" 
                    required 
                    style={{ width: '100%', padding: '10px 12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#2ed573' }}>+ Allowances / Bonus (₹)</label>
                    <input 
                      type="number" 
                      name="allowances" 
                      value={formData.allowances} 
                      onChange={handleChange} 
                      placeholder="0" 
                      style={{ width: '100%', padding: '10px 12px', borderColor: '#2ed573' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#ff4757' }}>- Deductions / Advance (₹)</label>
                    <input 
                      type="number" 
                      name="deductions" 
                      value={formData.deductions} 
                      onChange={handleChange} 
                      placeholder="0" 
                      style={{ width: '100%', padding: '10px 12px', borderColor: '#ff4757' }}
                    />
                  </div>
                </div>

                {/* Net Total Highlight Box */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(46, 213, 115, 0.08)',
                  border: '1px solid rgba(46, 213, 115, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Total Net Payable Salary:</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Basic + Allowances - Deductions</p>
                  </div>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#2ed573' }}>
                    ₹{Number(formData.netPaid || 0).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Payment Mode, Bank Account & Status Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ background: 'var(--bg-surface-elevated, rgba(255,255,255,0.02))', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#a29bfe', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdAccountBalance size={18} /> Payment & Bank Account Details
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Payment Mode <span className="required">*</span></label>
                      <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px' }}>
                        <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                        <option value="Cash">Cash in Hand</option>
                        <option value="UPI">UPI / GooglePay / PhonePe</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Payment Status <span className="required">*</span></label>
                      <select name="status" value={formData.status} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px' }}>
                        <option value="Paid">Paid (Processed)</option>
                        <option value="Pending">Pending (Unpaid)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontWeight: 600 }}>Payment / Payout Date</label>
                    <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required style={{ width: '100%', padding: '10px 12px' }} />
                  </div>

                  {formData.paymentMode !== 'Cash' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MdCreditCard size={16} /> Bank Name
                        </label>
                        <input 
                          type="text" 
                          name="bankName" 
                          value={formData.bankName} 
                          onChange={handleChange} 
                          placeholder="e.g. State Bank of India, HDFC Bank" 
                          style={{ width: '100%', padding: '10px 12px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label style={{ fontWeight: 600 }}>Account No / UPI ID</label>
                          <input 
                            type="text" 
                            name="accountNumber" 
                            value={formData.accountNumber} 
                            onChange={handleChange} 
                            placeholder="Account Number or UPI ID" 
                            style={{ width: '100%', padding: '10px 12px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontWeight: 600 }}>IFSC Code / Branch</label>
                          <input 
                            type="text" 
                            name="ifscCode" 
                            value={formData.ifscCode} 
                            onChange={handleChange} 
                            placeholder="e.g. SBIN0001234" 
                            style={{ width: '100%', padding: '10px 12px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label style={{ fontWeight: 600 }}>Transaction Ref / Cheque No / Notes</label>
                    <input 
                      type="text" 
                      name="transactionRef" 
                      value={formData.transactionRef} 
                      onChange={handleChange} 
                      placeholder="UTR Number / Cheque No / Cash Voucher ref..." 
                      style={{ width: '100%', padding: '10px 12px' }}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{ marginTop: '32px', display: 'flex', gap: '14px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => navigate('/payroll')}
                    style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn" 
                    style={{ backgroundColor: '#0984e3', color: '#fff', padding: '11px 28px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', fontSize: '14px' }}
                  >
                    <MdCheckCircle size={18} />
                    {isEdit ? 'Save & Update Salary' : 'Confirm & Process Salary'}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollForm;
