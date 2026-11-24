import React, { useState, useEffect } from 'react';
import { 
  MdReceipt, 
  MdAttachMoney, 
  MdOutlinePendingActions, 
  MdDownload, 
  MdAdd, 
  MdCheck, 
  MdCalculate, 
  MdSwapHoriz, 
  MdShield,
  MdAccountBalanceWallet,
  MdLightbulb
} from 'react-icons/md';
import './GST.css';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';

const INDIAN_STATES = [
  "01-Jammu & Kashmir",
  "02-Himachal Pradesh",
  "03-Punjab",
  "04-Chandigarh",
  "06-Haryana",
  "07-Delhi",
  "08-Rajasthan",
  "09-Uttar Pradesh",
  "10-Bihar",
  "18-Assam",
  "19-West Bengal",
  "20-Jharkhand",
  "21-Odisha",
  "22-Chhattisgarh",
  "23-Madhya Pradesh",
  "24-Gujarat",
  "27-Maharashtra",
  "29-Karnataka",
  "32-Kerala",
  "33-Tamil Nadu",
  "36-Telangana",
  "37-Andhra Pradesh"
];

const GST = () => {
  const { showAlert } = useModal();
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPaid: 0,
    pendingReturns: 0,
    gstStatusPaid: 0
  });

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Status');

  // Calculator Form State - Starts BLANK as requested by user
  const [calcForm, setCalcForm] = useState({
    consignorStateCode: '',
    consigneeStateCode: '',
    freightAmount: '',
    consignorType: 'COMPANY',
    isRcm: false,
    gstRate: 5.0
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    client: '',
    date: '',
    amount: '',
    gstPercent: 18,
    type: 'Collected'
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const compId = localStorage.getItem('activeCompanyId');
    if (compId) {
      headers['X-Company-Id'] = compId;
      headers['X-Tenant-Id'] = compId;
    }
    return headers;
  };

  const fetchGstData = async () => {
    try {
      const statsRes = await fetch('/api/gst/stats', { headers: getHeaders() });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const invoicesRes = await fetch('/api/gst/invoices', { headers: getHeaders() });
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error("Failed to fetch GST data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGstData();
  }, []);

  const updateInvoiceStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
    try {
      const res = await fetch(`/api/gst/invoices/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchGstData();
      } else {
        showAlert("Failed to update status.");
      }
    } catch (error) {
      showAlert("Error updating status: " + error.message);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const amt = parseFloat(newInvoice.amount);
      let pct = parseFloat(newInvoice.gstPercent);
      
      const payload = {
        ...newInvoice,
        amount: amt,
        gstPercent: pct
      };

      const res = await fetch('/api/gst/invoices', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchGstData();
        setIsModalOpen(false);
        setNewInvoice({ invoiceNumber: '', client: '', date: '', amount: '', gstPercent: 18, type: 'Collected' });
      } else {
        showAlert("Failed to save invoice.");
      }
    } catch (error) {
      console.error("Failed to create invoice", error);
      showAlert("Error: " + error.message);
    }
  };

  const exportToCsv = () => {
    if (invoices.length === 0) {
      showAlert("No data to export");
      return;
    }
    const headers = ["Invoice No,Client,Date,GST Category,Type,Base Amount,GST Rate,GST Amount,Total Amount,Status"];
    const rows = invoices.map(inv => 
      `${inv.invoiceNumber},${inv.client},${inv.date},${inv.gstCategory || 'Standard (18%)'},${inv.type},${inv.amount},${inv.gstPercent}%,${inv.gstAmount},${inv.total},${inv.status}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gst_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for dynamic tax calculation
  const calculateTaxes = () => {
    const freight = parseFloat(calcForm.freightAmount) || 0;
    if (freight <= 0 || !calcForm.consignorStateCode || !calcForm.consigneeStateCode) {
      return null;
    }

    const code1 = calcForm.consignorStateCode.split('-')[0].trim();
    const code2 = calcForm.consigneeStateCode.split('-')[0].trim();
    const isInterstate = code1 !== code2;

    let cgstRate = 0, sgstRate = 0, igstRate = 0;
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0, totalGst = 0;

    if (calcForm.isRcm) {
      // Under RCM, GTA charges 0% on invoice
      cgstRate = 0; sgstRate = 0; igstRate = 0;
    } else {
      if (isInterstate) {
        igstRate = calcForm.gstRate;
        igstAmount = (freight * igstRate) / 100.0;
        totalGst = igstAmount;
      } else {
        cgstRate = calcForm.gstRate / 2.0;
        sgstRate = calcForm.gstRate / 2.0;
        cgstAmount = (freight * cgstRate) / 100.0;
        sgstAmount = (freight * sgstRate) / 100.0;
        totalGst = cgstAmount + sgstAmount;
      }
    }

    const tdsRate = (calcForm.consignorType === 'INDIVIDUAL' || calcForm.consignorType === 'HUF') ? 1.0 : 2.0;
    const tdsAmount = (freight * tdsRate) / 100.0;
    const grandTotal = freight + totalGst;
    const netPayable = grandTotal - tdsAmount;

    return {
      freight,
      isInterstate,
      isRcm: calcForm.isRcm,
      cgstRate, sgstRate, igstRate,
      cgstAmount, sgstAmount, igstAmount, totalGst,
      tdsRate, tdsAmount,
      grandTotal, netPayable,
      gstNote: isInterstate ? "Inter-State Supply (IGST Applicable)" : "Intra-State Supply (CGST + SGST Applicable)",
      rcmNote: calcForm.isRcm ? "Reverse Charge (RCM - Sec 9(3)): Receiver pays tax to Govt" : "Forward Charge (FCM): Tax charged on invoice"
    };
  };

  const computedResult = calculateTaxes();

  const filteredInvoices = invoices.filter(invoice => {
    let typeMatch = true;
    if (filterType === 'Collected (Sales)') typeMatch = invoice.type === 'Collected';
    else if (filterType === 'Paid (Purchases)') typeMatch = invoice.type === 'Paid';
    
    let statusMatch = true;
    if (filterStatus === 'Paid') statusMatch = invoice.status === 'Paid';
    else if (filterStatus === 'Pending') statusMatch = invoice.status === 'Pending';
    else if (filterStatus === 'Filed') statusMatch = invoice.status === 'Filed';
    
    return typeMatch && statusMatch;
  });

  return (
    <div className="gst-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <h2>GST & Tax Management</h2>
          <p>Track GST returns, state-wise tax breakdown, RCM & Sec 194C TDS</p>
        </div>
        <div className="header-actions">
          <button className="reset-btn" onClick={exportToCsv}> <MdDownload /> Export Report</button>
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}> <MdAdd /> File Return</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gst-stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(32, 201, 151, 0.1)', color: '#20c997' }}>
            <MdAttachMoney size={24} />
          </div>
          <div className="stat-details">
            <h3>₹{(stats.totalCollected).toLocaleString('en-IN')}</h3>
            <p>GST Collected (Output)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' }}>
            <MdReceipt size={24} />
          </div>
          <div className="stat-details">
            <h3>₹{(stats.totalPaid).toLocaleString('en-IN')}</h3>
            <p>GST Paid (Input ITC)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(9, 132, 227, 0.1)', color: '#0984e3' }}>
            <MdAttachMoney size={24} />
          </div>
          <div className="stat-details">
            <h3>₹{(stats.totalCollected - stats.totalPaid).toLocaleString('en-IN')}</h3>
            <p>Net GST Payable</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(253, 160, 133, 0.1)', color: '#fda085' }}>
            <MdOutlinePendingActions size={24} />
          </div>
          <div className="stat-details">
            <h3>{stats.pendingReturns}</h3>
            <p>Pending Returns</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: '#20c997' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(32, 201, 151, 0.2)', color: '#20c997' }}>
            <MdReceipt size={24} />
          </div>
          <div className="stat-details">
            <h3 style={{ color: '#20c997' }}>₹{(stats.gstStatusPaid || 0).toLocaleString('en-IN')}</h3>
            <p>Total GST Paid (Settled)</p>
          </div>
        </div>
      </div>

      {/* State-Wise GST, RCM & TDS Calculator Section (Restored with Blank Initial Inputs) */}
      <div style={{
        backgroundColor: 'var(--sidebar-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        paddingBottom: '100px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <MdCalculate style={{ color: '#00b894', fontSize: '1.4rem' }} /> State-wise GST, RCM & Sec 194C TDS Live Calculator
          </h3>
          <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(0, 184, 148, 0.15)', color: '#00b894', fontWeight: 600 }}>
            Point 5: Tax Compliance Tool
          </span>
        </div>

        {/* Input Form Fields - 3 Columns per row to prevent text cut-off */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Consignor State (Origin)</label>
            <select 
              value={calcForm.consignorStateCode} 
              onChange={e => setCalcForm({...calcForm, consignorStateCode: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', textOverflow: 'ellipsis' }}
            >
              <option value="">-- Select Consignor State --</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Consignee State (Destination)</label>
            <select 
              value={calcForm.consigneeStateCode} 
              onChange={e => setCalcForm({...calcForm, consigneeStateCode: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', textOverflow: 'ellipsis' }}
            >
              <option value="">-- Select Consignee State --</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Freight Amount (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 50000"
              value={calcForm.freightAmount}
              onChange={e => setCalcForm({...calcForm, freightAmount: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>GST Rate (%)</label>
            <select 
              value={calcForm.gstRate} 
              onChange={e => setCalcForm({...calcForm, gstRate: parseFloat(e.target.value)})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
            >
              <option value={5.0}>5% (GTA Freight)</option>
              <option value={12.0}>12% (Multimodal Freight)</option>
              <option value={18.0}>18% (Standard Service)</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Deductee Entity (Sec 194C TDS)</label>
            <select 
              value={calcForm.consignorType} 
              onChange={e => setCalcForm({...calcForm, consignorType: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', textOverflow: 'ellipsis' }}
            >
              <option value="COMPANY">Company / Firm (2% TDS)</option>
              <option value="INDIVIDUAL">Individual / HUF (1% TDS)</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Tax Charge Mechanism</label>
            <select 
              value={calcForm.isRcm ? 'RCM' : 'FCM'} 
              onChange={e => setCalcForm({...calcForm, isRcm: e.target.value === 'RCM'})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', textOverflow: 'ellipsis' }}
            >
              <option value="FCM">Forward Charge (FCM)</option>
              <option value="RCM">Reverse Charge (RCM - 0%)</option>
            </select>
          </div>
        </div>

        {/* Live Calculation Results (Shown when user enters inputs) */}
        {computedResult ? (
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Card 1: GST Breakdown Card */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#00b894', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdSwapHoriz /> GST Tax Calculation
                </h4>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', backgroundColor: computedResult.isInterstate ? 'rgba(9, 132, 227, 0.2)' : 'rgba(32, 201, 151, 0.2)', color: computedResult.isInterstate ? '#0984e3' : '#20c997', fontWeight: 600 }}>
                  {computedResult.isInterstate ? 'IGST (Inter-State)' : 'CGST + SGST (Intra-State)'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {computedResult.gstNote}
              </div>

              {computedResult.isRcm ? (
                <div style={{ backgroundColor: 'rgba(255, 171, 0, 0.1)', color: '#ffab00', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MdWarning color="#f59e0b" size={16} /> <strong>RCM Active:</strong></span> Invoice tax is ₹0. Receiver pays tax directly to Govt under Sec 9(3).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  {computedResult.isInterstate ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>IGST ({computedResult.igstRate}%):</span>
                      <strong>₹{computedResult.igstAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>CGST ({computedResult.cgstRate}%):</span>
                        <strong>₹{computedResult.cgstAmount.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>SGST ({computedResult.sgstRate}%):</span>
                        <strong>₹{computedResult.sgstAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    </>
                  )}
                  <div style={{ borderTop: '1px solid var(--border-color)', pt: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Total GST Charge:</span>
                    <span style={{ color: '#00b894' }}>₹{computedResult.totalGst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Sec 194C TDS & Net Payable Card */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: '#0984e3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdShield /> Sec 194C TDS & Settlement
                </h4>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(9, 132, 227, 0.2)', color: '#0984e3', fontWeight: 600 }}>
                  TDS Rate: {computedResult.tdsRate}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Base Freight Amount:</span>
                  <span>₹{computedResult.freight.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice Grand Total (Freight + GST):</span>
                  <span>₹{computedResult.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4757' }}>
                  <span>Less Sec 194C TDS Deduction ({computedResult.tdsRate}%):</span>
                  <strong>- ₹{computedResult.tdsAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}>
                  <span>Net Amount Payable:</span>
                  <span style={{ color: '#20c997' }}>₹{computedResult.netPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MdLightbulb color="#f59e0b" size={16} /> <strong>State-wise GST & TDS Calculator ready:</strong></span> Select Consignor & Consignee States and enter Freight Amount above to see live IGST / CGST+SGST breakdown, RCM applicability, and Sec 194C TDS deductions.
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="data-section">
        <div className="section-header">
          <h2>Recent GST Invoices</h2>
          <div className="filter-section">
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option>All Types</option>
              <option>Collected (Sales)</option>
              <option>Paid (Purchases)</option>
            </select>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Filed</option>
            </select>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client / Vendor</th>
                <th>Date</th>
                <th>Type</th>
                <th>Base Amount</th>
                <th>GST Rate</th>
                <th>GST Amount</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="10" style={{textAlign: 'center', padding: '20px'}}>Loading GST records...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="10" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No GST Invoices found.</td></tr>
              ) : filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.invoiceNumber}</strong></td>
                  <td>{invoice.client}</td>
                  <td>{invoice.date}</td>
                  <td>
                    <span className={`badge ${invoice.type === 'Collected' ? 'badge-collected' : 'badge-paid'}`}>
                      {invoice.type}
                    </span>
                  </td>
                  <td>₹{(invoice.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{invoice.gstPercent}%</td>
                  <td>₹{(invoice.gstAmount || 0).toLocaleString('en-IN')}</td>
                  <td><strong>₹{(invoice.total || 0).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`status-badge ${invoice.status ? invoice.status.toLowerCase() : 'pending'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {invoice.status === 'Pending' ? (
                      <button 
                        className="action-icon view" 
                        title="Mark Paid" 
                        style={{color: '#0984e3'}} 
                        onClick={() => updateInvoiceStatus(invoice.id, invoice.status)}
                      >
                        <MdCheck />
                      </button>
                    ) : (
                      <span className="action-icon view" style={{ color: '#00b894', cursor: 'default' }} title={invoice.status}>
                        <MdCheck />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Return Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h2>File New GST Return</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div className="form-group">
                    <label>Invoice Number</label>
                    <input 
                      type="text" 
                      required
                      value={newInvoice.invoiceNumber}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Client / Vendor</label>
                    <input 
                      type="text" 
                      required
                      value={newInvoice.client}
                      onChange={(e) => setNewInvoice({...newInvoice, client: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      required
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Base Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>GST Rate (%)</label>
                    <select 
                      value={newInvoice.gstPercent}
                      onChange={(e) => setNewInvoice({...newInvoice, gstPercent: parseFloat(e.target.value)})}
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      value={newInvoice.type}
                      onChange={(e) => setNewInvoice({...newInvoice, type: e.target.value})}
                    >
                      <option value="Collected">Collected (Sales)</option>
                      <option value="Paid">Paid (Purchases)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GST;
