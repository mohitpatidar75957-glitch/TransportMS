import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdPictureAsPdf, MdDelete, MdAccountBalanceWallet, MdCheckCircle, MdLock, MdHourglassEmpty, MdEdit } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';


const Payroll = () => {
  const { showAlert, showConfirm } = useModal();
  const { roleKey, currentUser } = useAuth();
  const isDriver = roleKey === 'DRIVER';
  const isManager = roleKey === 'MANAGER';
  const navigate = useNavigate();
  const [dbRecords, setDbRecords] = useState([]);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loggedInDriverId, setLoggedInDriverId] = useState(null);
  
  const [records, setRecords] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});

  const [allDriversList, setAllDriversList] = useState([]);
  const [allManagersList, setAllManagersList] = useState([]);

  const fetchPayroll = async () => {
    try {
      const response = await fetch('/api/v1/hr/payroll');
      if (response.ok) {
        const data = await response.json();
        setDbRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch payroll from database:', error);
    }
  };

  useEffect(() => {
    const fetchEmployeesAndProfile = async () => {
      try {
        const [resDrivers, resUsers] = await Promise.all([
          fetch('/api/v1/fleet/drivers'),
          fetch('/api/users')
        ]);
        
        let map = {};
        let drivers = [];
        let users = [];

        if (resDrivers.ok) {
          drivers = await resDrivers.json();
          setAllDriversList(drivers);
          drivers.forEach(d => {
            map[`Driver-${d.id}`] = d.name;
          });
        }
        
        if (resUsers.ok) {
          users = await resUsers.json();
          setAllManagersList(users.filter(u => u.role === 'MANAGER' || u.role === 'SUPER_ADMIN'));
          users.forEach(u => {
            const type = u.role === 'SUPER_ADMIN' ? 'Admin' : 'Manager';
            map[`${type}-${u.id}`] = u.name;
          });
        }
        
        setEmployeeMap(map);

        if (isDriver && currentUser) {
          const me = drivers.find(d => d.userId === currentUser.id);
          if (me) {
            setDriverProfile(me);
            setLoggedInDriverId(me.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };

    fetchPayroll();
    fetchEmployeesAndProfile();
  }, [isDriver, currentUser]);

  // 1. Existing DB Payroll Records
  const dbMappedRecords = dbRecords
    .filter(r => !isDriver || (r.employeeType === 'Driver' && r.employeeId === loggedInDriverId))
    .map(r => ({
      id: `PAY-DB-${r.id}`,
      dbId: r.id,
      name: employeeMap[`${r.employeeType}-${r.employeeId}`] || `EMP ID: ${r.employeeId || 'Unknown'}`,
      role: r.employeeType || 'Unknown',
      month: r.monthYear || 'October/2026',
      basic: r.baseSalary || 0,
      allowances: (r.netPayable || 0) - (r.baseSalary || 0) + (r.deductions || 0),
      deductions: r.deductions || 0,
      netPaid: r.netPayable || 0,
      date: '05 ' + (r.monthYear ? r.monthYear.replace('/', ' ') : 'October 2026'),
      status: r.status || 'Pending',
      isReal: true,
      employeeId: r.employeeId,
      employeeType: r.employeeType
    }));

  // 2. Pending Records for Drivers who don't have a DB record yet
  const pendingDriverRecords = isDriver ? [] : allDriversList
    .filter(d => !dbRecords.some(r => r.employeeType === 'Driver' && String(r.employeeId) === String(d.id)))
    .map(d => ({
      id: `DRIVER-PENDING-${d.id}`,
      dbId: null,
      name: d.name,
      role: 'Driver',
      month: 'October/2026',
      basic: d.salaryAmount || 25000,
      allowances: 0,
      deductions: 0,
      netPaid: d.salaryAmount || 25000,
      date: d.joinedDate ? `Joined: ${d.joinedDate}` : '05 October 2026',
      status: 'Pending',
      isReal: false,
      employeeId: d.id,
      employeeType: 'Driver'
    }));

  // 3. Pending Records for Managers who don't have a DB record yet
  const pendingManagerRecords = isDriver ? [] : allManagersList
    .filter(m => !dbRecords.some(r => (r.employeeType === 'Manager' || r.employeeType === 'Admin') && String(r.employeeId) === String(m.id)))
    .map(m => ({
      id: `MANAGER-PENDING-${m.id}`,
      dbId: null,
      name: m.name,
      role: m.role === 'SUPER_ADMIN' ? 'Admin' : 'Manager',
      month: 'October/2026',
      basic: 45000,
      allowances: 0,
      deductions: 0,
      netPaid: 45000,
      date: '05 October 2026',
      status: 'Pending',
      isReal: false,
      employeeId: m.id,
      employeeType: m.role === 'SUPER_ADMIN' ? 'Admin' : 'Manager'
    }));

  const allRecords = [...dbMappedRecords, ...pendingDriverRecords, ...pendingManagerRecords];

  // For Manager or Driver personal view
  const myRecords = isDriver ? allRecords 
    : allRecords.filter(r => r.employeeType === 'Manager' && r.employeeId === currentUser?.id);

  const handleDelete = async (id, isReal, dbId) => {
    if (isDriver) return;
    if (await showConfirm('Are you sure you want to delete this salary record?')) {
      if (isReal && dbId) {
        try {
          const response = await fetch(`/api/v1/hr/payroll/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            fetchPayroll();
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const [payModal, setPayModal] = useState(null);
  const [modalForm, setModalForm] = useState({ basic: 0, allowances: 0, deductions: 0 });

  const openPayModal = (rec) => {
    setPayModal(rec);
    setModalForm({
      basic: rec.basic || 0,
      allowances: rec.allowances || 0,
      deductions: rec.deductions || 0
    });
  };

  const handleConfirmPay = async () => {
    if (!payModal) return;
    const netPayable = (Number(modalForm.basic) || 0) + (Number(modalForm.allowances) || 0) - (Number(modalForm.deductions) || 0);

    try {
      if (payModal.dbId) {
        const response = await fetch(`/api/v1/hr/payroll/${payModal.dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseSalary: modalForm.basic,
            allowances: modalForm.allowances,
            deductions: modalForm.deductions,
            netPayable: netPayable,
            status: 'Paid'
          })
        });
        if (response.ok) {
          fetchPayroll();
          showAlert(`Salary of ₹${netPayable.toLocaleString()} paid successfully to ${payModal.name}!`);
          setPayModal(null);
        } else {
          showAlert('Failed to process payment.');
        }
      } else {
        const response = await fetch(`/api/v1/hr/payroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: payModal.employeeId,
            employeeType: 'Driver',
            monthYear: '10/2026',
            baseSalary: modalForm.basic,
            allowances: modalForm.allowances,
            deductions: modalForm.deductions,
            netPayable: netPayable,
            status: 'Paid'
          })
        });
        if (response.ok) {
          fetchPayroll();
          showAlert(`Salary of ₹${netPayable.toLocaleString()} paid successfully to ${payModal.name}!`);
          setPayModal(null);
        } else {
          showAlert('Failed to create payroll payment.');
        }
      }
    } catch (err) {
      console.error(err);
      showAlert('Error processing salary.');
    }
  };

  const [companySettings, setCompanySettings] = useState({
    companyName: 'R.K. TRADERS & LOGISTICS',
    companyAddress: 'Transport Nagar, Indore, Madhya Pradesh - 452001',
    phoneNumber: '+91 98765 43210',
    gstNumber: '23AADCR1234F1Z5'
  });

  useEffect(() => {
    fetch('/api/v1/management/settings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const loaded = { ...companySettings };
          data.forEach(item => {
            if (item.key === 'companyName' && item.value) loaded.companyName = item.value;
            if (item.key === 'companyAddress' && item.value) loaded.companyAddress = item.value;
            if (item.key === 'phoneNumber' && item.value) loaded.phoneNumber = item.value;
            if (item.key === 'gstNumber' && item.value) loaded.gstNumber = item.value;
          });
          setCompanySettings(loaded);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleDownloadPdf = (rec) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const slipHtml = `
      <html>
        <head>
          <title>Salary Slip - ${rec.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              color: #1e293b; 
              padding: 40px;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name { font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin:0; }
            .company-details { font-size: 13px; color: #64748b; margin-top: 5px; }
            .gst-no { font-weight: 600; color: #3b82f6; }
            .slip-title {
              font-size: 18px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              text-align: center;
              margin-bottom: 30px;
              color: #475569;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .detail-item { font-size: 14px; }
            .detail-label { color: #64748b; font-size: 12px; text-transform: uppercase; }
            .detail-val { font-weight: 600; color: #0f172a; font-size: 16px; margin-top: 4px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #3b82f6 !important; color: white !important; padding: 12px; text-align: left; font-size: 14px; text-transform: uppercase; }
            td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
            .amt { text-align: right; font-weight: 600; }
            .total-row td { font-weight: 800; font-size: 18px; color: #0f172a; border-top: 2px solid #cbd5e1; border-bottom: none; padding-top: 20px; }
            .net-paid { color: #10b981; }
            
            .footer {
              margin-top: 80px;
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              color: #64748b;
            }
            .signature { border-top: 1px solid #94a3b8; padding-top: 10px; width: 220px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="company-name">${companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</h1>
            <div class="company-details">
              ${companySettings.companyAddress || 'Transport Nagar, Indore, Madhya Pradesh - 452001'} | Phone: ${companySettings.phoneNumber || '+91 98765 43210'}<br/>
              GSTIN: <span class="gst-no">${companySettings.gstNumber || '23AADCR1234F1Z5'}</span>
            </div>
          </div>
          
          <div class="slip-title">Salary Slip - ${rec.month}</div>
          
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Employee details</div>
              <div class="detail-val">${rec.name}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Designation</div>
              <div class="detail-val">${rec.role}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Pay Period</div>
              <div class="detail-val">${rec.month}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date Generated</div>
              <div class="detail-val">${new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings & Deductions</th>
                <th class="amt">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td class="amt">${Number(rec.basic).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Allowances / Bonus</td>
                <td class="amt" style="color: #10b981;">+${Number(rec.allowances).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Deductions (Taxes/Leaves)</td>
                <td class="amt" style="color: #ef4444;">-${Number(rec.deductions).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>Net Payable Salary</td>
                <td class="amt net-paid">₹${Number(rec.netPaid).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed #cbd5e1;">
            <strong>Note:</strong> This is a computer-generated salary slip for ${companySettings.companyName || 'R.K. TRADERS & LOGISTICS'} and does not require a physical signature.
          </div>

          <div class="footer">
            <div class="signature">Employee Signature</div>
            <div class="signature">
              Authorized Signatory<br/>
              <span style="font-size: 11px; font-weight: 600; color: #475569;">${companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</span>
            </div>
          </div>
        </body>
      </html>
    `;
    
    iframe.contentDocument.open();
    iframe.contentDocument.write(slipHtml);
    iframe.contentDocument.close();
    
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  // ============================
  // SHARED: PERSONAL SUMMARY CARDS
  // ============================
  const renderPersonalCards = () => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '24px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(9,132,227,0.1), rgba(9,132,227,0.04))',
          border: '1px solid rgba(9,132,227,0.15)'
        }}>
          <p style={{ margin: '0 0 6px', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary Configuration</p>
          <h3 style={{ margin: 0, color: '#74b9ff', fontSize: '1.2rem' }}>
            {isDriver ? (driverProfile?.salaryType || 'Not Set') : 'Monthly'} 
            {isDriver && driverProfile?.salaryAmount ? ` (₹${driverProfile.salaryAmount})` : ''}
          </h3>
        </div>

        <div style={{
          padding: '24px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(46,213,115,0.1), rgba(46,213,115,0.04))',
          border: '1px solid rgba(46,213,115,0.15)'
        }}>
          <p style={{ margin: '0 0 6px', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Earned</p>
          <h3 style={{ margin: 0, color: '#2ed573', fontSize: '1.2rem' }}>
            ₹{myRecords.reduce((sum, r) => sum + Number(r.netPaid), 0).toLocaleString()}
          </h3>
        </div>

        <div style={{
          padding: '24px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(108,92,231,0.04))',
          border: '1px solid rgba(108,92,231,0.15)'
        }}>
          <p style={{ margin: '0 0 6px', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Pay Slips</p>
          <h3 style={{ margin: 0, color: '#a29bfe', fontSize: '1.2rem' }}>{myRecords.length} Records</h3>
        </div>
      </div>
    );
  };

  // ============================
  // DRIVER SELF-VIEW — My Salary
  // ============================
  if (isDriver) {
    return (
      <div className="vehicles-container">
        <div className="page-header">
          <div className="header-text">
            <h2>My Salary Slip</h2>
            <p>View your personal salary and payout details</p>
          </div>
        </div>

        {renderPersonalCards()}

        {/* Salary Table — Read Only */}
        <div className="table-container panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month / Year</th>
                <th>Base Salary</th>
                <th>Deductions</th>
                <th>Net Paid</th>
                <th>Slip</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <MdAccountBalanceWallet size={40} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>No salary records yet. Admin will add your salary data.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                myRecords.map(rec => (
                  <tr key={rec.id}>
                    <td>{rec.month}</td>
                    <td>₹{Number(rec.basic).toLocaleString()}</td>
                    <td>
                      <span style={{ color: '#ff4757' }}>-₹{Number(rec.deductions).toLocaleString()}</span>
                    </td>
                    <td style={{ color: '#2ed573', fontWeight: 600 }}>₹{Number(rec.netPaid).toLocaleString()}</td>
                    <td>
                      <button className="action-icon" title="Download PDF" onClick={() => handleDownloadPdf(rec)} style={{ color: '#0984e3' }}>
                        <MdPictureAsPdf size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ============================
  // ADMIN / MANAGER VIEW
  // ============================
  
  const totalPayroll = allRecords.reduce((sum, r) => sum + Number(r.netPaid), 0);
  const totalPaid = allRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + Number(r.netPaid), 0);
  const totalPending = allRecords.filter(r => r.status === 'Pending').reduce((sum, r) => sum + Number(r.netPaid), 0);

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Payroll Management</h2>
          <p>Process and track salary payments</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/payroll/create')}>
          <MdAdd size={20} />
          Process Salaries
        </button>
      </div>

      {isManager && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>My Salary Summary</h3>
          {renderPersonalCards()}
        </div>
      )}

      {!isDriver && !isManager && (
        <div className="summary-cards-container" style={{ marginBottom: '24px' }}>
          <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #3498db' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Payroll</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPayroll.toLocaleString()}</p>
          </div>
          <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #4cd137' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Processed (Paid)</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #fbc531' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Pending Payments</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px' }}>All Salary Records</h3>
      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name / Role</th>
              <th>Month / Year</th>
              <th>Basic Salary</th>
              <th>Allowances / Ded.</th>
              <th>Net Paid</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allRecords.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No payroll records found.</td>
              </tr>
            ) : (
              allRecords.map(rec => (
                <tr key={rec.id}>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num">{rec.name}</span>
                      <span className="vehicle-name" style={{ color: '#3742fa', fontSize: '11px' }}>{rec.role}</span>
                    </div>
                  </td>
                  <td>{rec.month}</td>
                  <td>₹{Number(rec.basic).toLocaleString()}</td>
                  <td>
                    <span style={{ color: '#2ed573' }}>+₹{Number(rec.allowances).toLocaleString()}</span>
                    {' / '}
                    <span style={{ color: '#ff4757' }}>-₹{Number(rec.deductions).toLocaleString()}</span>
                  </td>
                  <td style={{ color: '#2ed573', fontWeight: 600 }}>₹{Number(rec.netPaid).toLocaleString()}</td>
                  <td>
                    {rec.status === 'Paid' ? (
                      <span style={{
                        backgroundColor: 'rgba(46, 213, 115, 0.15)',
                        color: '#2ed573',
                        border: '1px solid #2ed573',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        cursor: 'default'
                      }}>
                        <MdCheckCircle size={14} /> Paid <MdLock size={12} style={{ opacity: 0.7 }} />
                      </span>
                    ) : (
                      <button 
                        onClick={() => openPayModal(rec)}
                        style={{
                          padding: '7px 15px',
                          borderRadius: '20px',
                          border: '1px solid rgba(251, 197, 49, 0.6)',
                          background: 'linear-gradient(135deg, rgba(251, 197, 49, 0.15) 0%, rgba(230, 126, 34, 0.2) 100%)',
                          color: '#f39c12',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          outline: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(251, 197, 49, 0.15)',
                          transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #2ed573 0%, #26af5f 100%)';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = '#2ed573';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 213, 115, 0.35)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251, 197, 49, 0.15) 0%, rgba(230, 126, 34, 0.2) 100%)';
                          e.currentTarget.style.color = '#f39c12';
                          e.currentTarget.style.borderColor = 'rgba(251, 197, 49, 0.6)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 197, 49, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        title="Click to Add Allowances & Pay Salary"
                      >
                        <MdHourglassEmpty size={14} /> Pending · Pay Now
                      </button>
                    )}
                  </td>
                  <td>{rec.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon" title="Edit Allowances & Salary" onClick={() => openPayModal(rec)} style={{ color: '#0984e3' }}><MdEdit /></button>
                      <button className="action-icon delete" title="Download PDF" onClick={() => handleDownloadPdf(rec)} style={{ color: '#ff4757' }}><MdPictureAsPdf /></button>
                      <button className="action-icon" title="Delete" onClick={() => handleDelete(rec.id, rec.isReal, rec.dbId)} style={{ color: 'var(--text-secondary)' }}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', padding: '28px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '18px' }}>
              Process Salary Payment
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
              Add allowances, bonuses, or deductions for <strong>{payModal.name}</strong> ({payModal.role})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                  Basic Salary (₹)
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={modalForm.basic} 
                  onChange={e => setModalForm({...modalForm, basic: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', color: '#2ed573', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                  + Allowances / Bonus / Overtime (₹)
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 2000"
                  value={modalForm.allowances} 
                  onChange={e => setModalForm({...modalForm, allowances: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #2ed573', background: 'rgba(46, 213, 115, 0.05)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', color: '#ff4757', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                  - Deductions / Advance Taken (₹)
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 500"
                  value={modalForm.deductions} 
                  onChange={e => setModalForm({...modalForm, deductions: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ff4757', background: 'rgba(255, 71, 87, 0.05)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              {/* Dynamic Net Calculation Box */}
              <div style={{
                marginTop: '10px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(9, 132, 227, 0.1)',
                border: '1px solid rgba(9, 132, 227, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Net Payable Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#2ed573' }}>
                  ₹{((Number(modalForm.basic) || 0) + (Number(modalForm.allowances) || 0) - (Number(modalForm.deductions) || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setPayModal(null)} 
                style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPay} 
                style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#2ed573', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(46, 213, 115, 0.3)' }}
              >
                Confirm & Pay Salary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;


