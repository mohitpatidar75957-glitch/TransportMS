import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  MdPayments, MdArrowBack, MdPerson, MdAccountBalance, 
  MdAttachMoney, MdNotes, MdCheckCircle, MdDateRange 
} from 'react-icons/md';
import './AddVehicle.css';
import { useModal } from '../context/ModalContext';

const PayrollForm = () => {
  const { showAlert } = useModal();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  const preEmpId = searchParams.get('empId');
  const preType = searchParams.get('type') || 'Driver';

  const [formData, setFormData] = useState({
    employeeId: preEmpId ? (preType === 'Driver' ? `D-${preEmpId}` : `U-${preEmpId}`) : '',
    employeeType: preType,
    month: 'October',
    year: '2026',
    basicSalary: '',
    allowances: '0',
    deductions: '0',
    netPaid: '',
    status: 'Pending',
    paymentMode: 'Bank Transfer', // 'Bank Transfer' | 'Cash' | 'UPI' | 'Cheque'
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/fleet/drivers').then(res => res.json()),
      fetch('/api/users').then(res => res.json()),
      isEdit ? fetch('/api/v1/hr/payroll').then(res => res.json()) : Promise.resolve(null)
    ])
    .then(([driversData, usersData, payrollData]) => {
      const drivers = (driversData || []).map(d => ({
        id: `D-${d.id}`,
        rawId: d.id,
        name: d.name,
        type: 'Driver',
        phone: d.phone || '',
        salaryAmount: d.salaryAmount || 25000,
        joinedDate: d.joinedDate || '',
        bankName: d.bankName || 'State Bank of India',
        accountNumber: d.accountNumber || `98765432${d.id}01`,
        ifscCode: d.ifscCode || 'SBIN0001234'
      }));

      const staff = (usersData || [])
        .filter(u => u.role !== 'DRIVER')
        .map(u => ({
          id: `U-${u.id}`,
          rawId: u.id,
          name: u.name,
          type: u.role === 'SUPER_ADMIN' ? 'Admin' : 'Manager',
          phone: u.phone || '',
          salaryAmount: 45000,
          joinedDate: u.joinDate || '',
          bankName: 'HDFC Bank',
          accountNumber: `50100234${u.id}78`,
          ifscCode: 'HDFC0001020'
        }));

      const allEmps = [...drivers, ...staff];
      setEmployeeOptions(allEmps);

      if (isEdit && payrollData) {
        const current = payrollData.find(p => String(p.id) === String(id));
        if (current) {
          const empKey = current.employeeType === 'Driver' ? `D-${current.employeeId}` : `U-${current.employeeId}`;
          const matchingEmp = allEmps.find(e => e.id === empKey);

          const [m, y] = (current.monthYear || 'October/2026').split('/');
          const basic = current.baseSalary || 0;
          const allowances = current.allowances || 0;
          const deductions = current.deductions || 0;
          const net = current.netPayable || (basic + allowances - deductions);

          setFormData({
            employeeId: empKey,
            employeeType: current.employeeType || 'Driver',
            month: m || 'October',
            year: y || '2026',
            basicSalary: basic.toString(),
            allowances: allowances.toString(),
            deductions: deductions.toString(),
            netPaid: net.toString(),
            status: current.status || 'Pending',
            paymentMode: 'Bank Transfer',
            bankName: matchingEmp?.bankName || 'State Bank of India',
            accountNumber: matchingEmp?.accountNumber || '',
            ifscCode: matchingEmp?.ifscCode || '',
            transactionRef: `TXN-${id}-2026`,
            paymentDate: new Date().toISOString().split('T')[0],
            notes: ''
          });
        }
      } else if (preEmpId) {
        const empKey = preType === 'Driver' ? `D-${preEmpId}` : `U-${preEmpId}`;
        const selected = allEmps.find(e => e.id === empKey);
        if (selected) {
          setFormData(prev => ({
            ...prev,
            employeeId: empKey,
            employeeType: selected.type,
            basicSalary: selected.salaryAmount.toString(),
            netPaid: selected.salaryAmount.toString(),
            bankName: selected.bankName,
            accountNumber: selected.accountNumber,
            ifscCode: selected.ifscCode
          }));
        }
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to load payroll form data", err);
      setLoading(false);
    });
  }, [id, isEdit, preEmpId, preType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'employeeId') {
        const selectedEmp = employeeOptions.find(emp => String(emp.id) === value);
        if (selectedEmp) {
          updated.employeeType = selectedEmp.type;
          updated.basicSalary = (selectedEmp.salaryAmount || 25000).toString();
          updated.bankName = selectedEmp.bankName;
          updated.accountNumber = selectedEmp.accountNumber;
          updated.ifscCode = selectedEmp.ifscCode;
        }
      }

      if (name === 'basicSalary' || name === 'allowances' || name === 'deductions' || name === 'employeeId') {
        const basic = parseFloat(updated.basicSalary) || 0;
        const allowances = parseFloat(updated.allowances) || 0;
        const deductions = parseFloat(updated.deductions) || 0;
        updated.netPaid = Math.max(0, basic + allowances - deductions).toString();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const monthYearStr = `${formData.month}/${formData.year}`;
    const selectedEmployee = employeeOptions.find(e => String(e.id) === String(formData.employeeId));
    
    const rawId = String(formData.employeeId);
    const realId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
    
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
    <div className="add-vehicle-container">
      <div className="form-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/payroll')} 
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
            >
              <MdArrowBack size={18} />
            </button>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdPayments size={22} style={{ color: '#0984e3' }} /> 
                {isEdit ? 'Edit Salary Details' : 'Process Employee Salary'}
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                Manage salary breakdown, payment mode, bank accounts & status
              </p>
            </div>
          </div>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontWeight: 'bold', 
            fontSize: '12px',
            background: formData.status === 'Paid' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(251, 197, 49, 0.15)',
            color: formData.status === 'Paid' ? '#2ed573' : '#f39c12',
            border: `1px solid ${formData.status === 'Paid' ? '#2ed573' : 'rgba(251, 197, 49, 0.6)'}`
          }}>
            Status: {formData.status}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          {/* Section 1: Employee & Month Details */}
          <div style={{ background: 'var(--bg-surface-elevated, rgba(255,255,255,0.02))', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdPerson size={16} /> Employee Information
            </h4>
            
            <div className="form-grid-3">
              <div className="form-group">
                <label>Employee <span className="required">*</span></label>
                <select name="employeeId" value={formData.employeeId} onChange={handleChange} required disabled={isEdit}>
                  <option value="">Select Employee</option>
                  {employeeOptions.map(emp => (
                    <option key={`${emp.type}-${emp.id}`} value={emp.id}>
                      {emp.name} ({emp.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Salary Month <span className="required">*</span></label>
                <select name="month" value={formData.month} onChange={handleChange} required>
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
                <label>Year <span className="required">*</span></label>
                <select name="year" value={formData.year} onChange={handleChange} required>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>

            {selectedEmpObj && (
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                <span><strong>Role:</strong> {selectedEmpObj.type}</span>
                <span><strong>Contact Phone:</strong> {selectedEmpObj.phone || 'N/A'}</span>
                <span><strong>Joining Date:</strong> {selectedEmpObj.joinedDate || 'Active'}</span>
              </div>
            )}
          </div>

          {/* Section 2: Salary Breakdown */}
          <div style={{ background: 'var(--bg-surface-elevated, rgba(255,255,255,0.02))', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdAttachMoney size={16} /> Salary & Allowances Breakdown
            </h4>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Basic Salary (₹) <span className="required">*</span></label>
                <input 
                  type="number" 
                  name="basicSalary" 
                  value={formData.basicSalary} 
                  onChange={handleChange} 
                  placeholder="25000" 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ color: '#2ed573' }}>+ Allowances / Bonus / Overtime (₹)</label>
                <input 
                  type="number" 
                  name="allowances" 
                  value={formData.allowances} 
                  onChange={handleChange} 
                  placeholder="0" 
                  style={{ borderColor: '#2ed573' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: '#ff4757' }}>- Deductions / Advance Taken (₹)</label>
                <input 
                  type="number" 
                  name="deductions" 
                  value={formData.deductions} 
                  onChange={handleChange} 
                  placeholder="0" 
                  style={{ borderColor: '#ff4757' }}
                />
              </div>
            </div>

            {/* Net Total Highlight Box */}
            <div style={{
              marginTop: '12px',
              padding: '14px 20px',
              borderRadius: '8px',
              backgroundColor: 'rgba(46, 213, 115, 0.08)',
              border: '1px solid rgba(46, 213, 115, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Total Net Payable Salary:</span>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Basic + Allowances - Deductions</p>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#2ed573' }}>
                ₹{Number(formData.netPaid || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Section 3: Payment Mode & Bank Account Details */}
          <div style={{ background: 'var(--bg-surface-elevated, rgba(255,255,255,0.02))', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdAccountBalance size={16} /> Payment Method & Account Details
            </h4>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Payment Mode <span className="required">*</span></label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} required>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="UPI">UPI / GooglePay / PhonePe</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Status <span className="required">*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="Paid">Paid (Processed)</option>
                  <option value="Pending">Pending (Unpaid)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment / Payout Date</label>
                <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required />
              </div>
            </div>

            {formData.paymentMode !== 'Cash' && (
              <div className="form-grid-3" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input 
                    type="text" 
                    name="bankName" 
                    value={formData.bankName} 
                    onChange={handleChange} 
                    placeholder="e.g. State Bank of India" 
                  />
                </div>

                <div className="form-group">
                  <label>Account / UPI Number</label>
                  <input 
                    type="text" 
                    name="accountNumber" 
                    value={formData.accountNumber} 
                    onChange={handleChange} 
                    placeholder="Account No / UPI ID" 
                  />
                </div>

                <div className="form-group">
                  <label>IFSC Code / Reference</label>
                  <input 
                    type="text" 
                    name="ifscCode" 
                    value={formData.ifscCode} 
                    onChange={handleChange} 
                    placeholder="e.g. SBIN0001234" 
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Transaction Reference / Cheque No / Notes</label>
              <input 
                type="text" 
                name="transactionRef" 
                value={formData.transactionRef} 
                onChange={handleChange} 
                placeholder="UTR Number / Cheque No / Cash Voucher ref..." 
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/payroll')}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn" 
              style={{ backgroundColor: '#0984e3', color: '#fff', padding: '10px 24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MdCheckCircle size={18} />
              {isEdit ? 'Save & Update Salary' : 'Confirm & Process Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollForm;
