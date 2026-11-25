import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdAdd, MdPictureAsPdf, MdDelete, MdAccountBalanceWallet, MdCheckCircle, 
  MdLock, MdHourglassEmpty, MdEdit, MdSearch, MdPayment, MdUndo
} from 'react-icons/md';
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
  
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

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
          // Filter valid managers / admins without duplicate old IDs
          const managersOnly = users.filter(u => u.role === 'MANAGER' || u.role === 'SUPER_ADMIN');
          setAllManagersList(managersOnly);
          users.forEach(u => {
            const type = u.role === 'SUPER_ADMIN' ? 'Admin' : 'Manager';
            map[`${type}-${u.id}`] = u.name;
            // Also store Manager-key in case db has Manager
            map[`Manager-${u.id}`] = u.name;
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

  // 1. Existing DB Payroll Records (only show valid existing drivers/managers)
  const dbMappedRecords = dbRecords
    .filter(r => !isDriver || (r.employeeType === 'Driver' && r.employeeId === loggedInDriverId))
    .filter(r => {
      // Hide orphan records where driver or manager no longer exists
      if (r.employeeType === 'Driver') {
        return allDriversList.some(d => Number(d.id) === Number(r.employeeId));
      }
      if (r.employeeType === 'Manager' || r.employeeType === 'Admin') {
        return allManagersList.some(m => Number(m.id) === Number(r.employeeId));
      }
      return true;
    })
    .map(r => ({
      id: `PAY-DB-${r.id}`,
      dbId: r.id,
      name: employeeMap[`${r.employeeType}-${r.employeeId}`] || employeeMap[`Manager-${r.employeeId}`] || `EMP ID: ${r.employeeId || 'Unknown'}`,
      role: r.employeeType || 'Unknown',
      month: r.monthYear || '10/2026',
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
      month: '10/2026',
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
      month: '10/2026',
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

  // Quick toggle between Paid and Pending
  const handleToggleStatus = async (rec) => {
    const newStatus = rec.status === 'Paid' ? 'Pending' : 'Paid';
    const confirmMsg = newStatus === 'Paid' 
      ? `Mark salary as PAID for ${rec.name} (₹${Number(rec.netPaid).toLocaleString()})?`
      : `Revert salary to UNPAID / PENDING for ${rec.name}?`;

    if (await showConfirm(confirmMsg)) {
      try {
        if (rec.dbId) {
          const res = await fetch(`/api/v1/hr/payroll/${rec.dbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            fetchPayroll();
            showAlert(`Status updated to ${newStatus} for ${rec.name}!`);
          } else {
            showAlert('Failed to update status.');
          }
        } else {
          // Record was pending without db entry, create it in DB
          const res = await fetch(`/api/v1/hr/payroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: rec.employeeId,
              employeeType: rec.employeeType,
              monthYear: rec.month || '10/2026',
              baseSalary: rec.basic,
              allowances: rec.allowances || 0,
              deductions: rec.deductions || 0,
              netPayable: rec.netPaid,
              status: newStatus
            })
          });
          if (res.ok) {
            fetchPayroll();
            showAlert(`Status updated to ${newStatus} for ${rec.name}!`);
          } else {
            showAlert('Failed to create payroll entry.');
          }
        }
      } catch (err) {
        showAlert('Error updating salary status: ' + err.message);
      }
    }
  };

  // Filtered records based on active tabs & search
  const filteredRecords = allRecords.filter(r => {
    // Status filter
    if (statusFilter === 'PAID' && r.status !== 'Paid') return false;
    if (statusFilter === 'PENDING' && r.status === 'Paid') return false;

    // Role filter
    if (roleFilter !== 'ALL' && r.role !== roleFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = String(r.name || '').toLowerCase().includes(q);
      const matchRole = String(r.role || '').toLowerCase().includes(q);
      const matchMonth = String(r.month || '').toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchMonth) return false;
    }
    return true;
  });

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
          <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #3498db', cursor: 'pointer' }} onClick={() => setStatusFilter('ALL')}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Payroll</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPayroll.toLocaleString()}</p>
          </div>
          <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #4cd137', cursor: 'pointer' }} onClick={() => setStatusFilter('PAID')}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Processed (Paid)</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #fbc531', cursor: 'pointer' }} onClick={() => setStatusFilter('PENDING')}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Pending Payments</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar with Paid / Unpaid Tabs */}
      <div className="panel" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              background: statusFilter === 'ALL' ? '#0984e3' : 'transparent',
              color: statusFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            All Records ({allRecords.length})
          </button>
          <button 
            onClick={() => setStatusFilter('PAID')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: statusFilter === 'PAID' ? '#00b894' : 'transparent',
              color: statusFilter === 'PAID' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <MdCheckCircle size={15} /> Paid ({allRecords.filter(r => r.status === 'Paid').length})
          </button>
          <button 
            onClick={() => setStatusFilter('PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: statusFilter === 'PENDING' ? '#f39c12' : 'transparent',
              color: statusFilter === 'PENDING' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <MdHourglassEmpty size={15} /> Unpaid / Pending ({allRecords.filter(r => r.status !== 'Paid').length})
          </button>
        </div>

        {/* Search & Role Filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '450px', minWidth: '260px' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search employee name, role or month..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <select 
            className="filter-select"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '8px 28px 8px 12px' }}
          >
            <option value="ALL">All Roles</option>
            <option value="Driver">Drivers</option>
            <option value="Manager">Managers</option>
            <option value="Admin">Admins</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>
          Salary Records ({filteredRecords.length})
        </h3>
        {statusFilter !== 'ALL' && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing: <strong style={{ color: statusFilter === 'PAID' ? '#00b894' : '#f39c12' }}>{statusFilter}</strong>
            <button 
              onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); setRoleFilter('ALL'); }}
              style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#0984e3', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
            >
              Clear filter
            </button>
          </span>
        )}
      </div>

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
              <th style={{ textAlign: 'center' }}>Pay / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <MdAccountBalanceWallet size={36} style={{ opacity: 0.4 }} />
                    <span>No salary records found for the selected filter.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map(rec => (
                <tr key={rec.id}>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num">{rec.name}</span>
                      <span className="vehicle-name" style={{ color: '#0984e3', fontSize: '11px', fontWeight: 'bold' }}>{rec.role}</span>
                    </div>
                  </td>
                  <td>{rec.month}</td>
                  <td>₹{Number(rec.basic).toLocaleString()}</td>
                  <td>
                    <span style={{ color: '#2ed573' }}>+₹{Number(rec.allowances).toLocaleString()}</span>
                    {' / '}
                    <span style={{ color: '#ff4757' }}>-₹{Number(rec.deductions).toLocaleString()}</span>
                  </td>
                  <td style={{ color: '#2ed573', fontWeight: 700 }}>₹{Number(rec.netPaid).toLocaleString()}</td>
                  <td>
                    {rec.status === 'Paid' ? (
                      <span style={{
                        backgroundColor: 'rgba(46, 213, 115, 0.15)',
                        color: '#2ed573',
                        border: '1px solid #2ed573',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        <MdCheckCircle size={13} /> Paid
                      </span>
                    ) : (
                      <span style={{
                        backgroundColor: 'rgba(251, 197, 49, 0.15)',
                        color: '#f39c12',
                        border: '1px solid rgba(251, 197, 49, 0.6)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        <MdHourglassEmpty size={13} /> Unpaid
                      </span>
                    )}
                  </td>
                  <td>{rec.date}</td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      {rec.status !== 'Paid' && (
                        <button 
                          className="action-icon" 
                          title="Click to Pay Salary Now" 
                          onClick={() => openPayModal(rec)} 
                          style={{ color: '#fff', background: '#2ed573', padding: '5px 10px', borderRadius: '6px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 6px rgba(46, 213, 115, 0.3)' }}
                        >
                          <MdPayment size={14} /> Pay Now
                        </button>
                      )}
                      <button 
                        className="action-icon" 
                        title="Full Edit Salary Details" 
                        onClick={() => navigate(rec.dbId ? `/payroll/${rec.dbId}/edit` : `/payroll/create?empId=${rec.employeeId}&type=${rec.employeeType}`)} 
                        style={{ color: '#0984e3' }}
                      >
                        <MdEdit size={16} />
                      </button>
                      <button className="action-icon delete" title="Download Salary Slip PDF" onClick={() => handleDownloadPdf(rec)} style={{ color: '#e74c3c' }}><MdPictureAsPdf size={16} /></button>
                      <button className="action-icon" title="Delete" onClick={() => handleDelete(rec.id, rec.isReal, rec.dbId)} style={{ color: 'var(--text-secondary)' }}><MdDelete size={16} /></button>
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


