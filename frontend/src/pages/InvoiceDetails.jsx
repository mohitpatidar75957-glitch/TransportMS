import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdPrint, MdEdit, MdQrCode2, MdCheckCircle } from 'react-icons/md';
import QRCode from 'qrcode';
import './VehicleDetails.css'; 
import { useModal } from '../context/ModalContext';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const printRef = useRef();

  const [dbInvoice, setDbInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [invoicePayments, setInvoicePayments] = useState([]);
  const [companySettings, setCompanySettings] = useState({
    companyName: 'R.K. TRADERS & LOGISTICS',
    companyAddress: 'Transport Nagar, Indore, Madhya Pradesh - 452001',
    phoneNumber: '+91 98765 43210',
    gstNumber: '23AADCR1234F1Z5'
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetch('/api/v1/management/settings', { headers: getHeaders() })
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

    fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (dbInvoice) {
      // Calculate payable amount directly from invoice data
      const grossAmt = Number(dbInvoice.amount) || 0;
      const tdsAmt = Number(dbInvoice.tdsAmount) || 0;
      const netRec = Math.max(0, grossAmt - tdsAmt);
      const paidAmt = invoicePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const bal = Math.max(0, netRec - paidAmt);
      const payAmt = bal > 0 ? bal : netRec;
      const targetUpi = dbInvoice.upiId && dbInvoice.upiId !== 'rktraders@upi' ? dbInvoice.upiId : 'mohitpatidar2479@naviaxis';

      const upiUrl = `upi://pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent('Mohit Patidar')}&am=${payAmt.toFixed(2)}&tn=${encodeURIComponent(dbInvoice.invoiceNumber || 'Freight Payment')}&cu=INR`;
      QRCode.toDataURL(upiUrl, {
        width: 250,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate UPI QR Code:', err));
    }
  }, [dbInvoice, invoicePayments]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch('/api/v1/finance/invoices');
      if (res.ok) {
        const data = await res.json();
        const found = data.find(item => item.invoiceNumber === id || `INV-DB-${item.id}` === id || String(item.id) === id);
        if (found) {
          // Fetch part-payments for this invoice
          fetch(`/api/v1/finance/invoices/${found.id}/payments`)
            .then(p => p.ok ? p.json() : [])
            .then(pList => setInvoicePayments(pList))
            .catch(() => {});

          // Fetch compliance details if available
          const compRes = await fetch(`/api/v1/compliance/invoice/${found.id}`).catch(() => null);
          if (compRes && compRes.ok) {
            const compData = await compRes.json();
            setDbInvoice({ ...found, ...compData });
          } else {
            setDbInvoice(found);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEInvoice = async () => {
    if (!dbInvoice) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/compliance/einvoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: dbInvoice.id,
          hsnCode: dbInvoice.hsnCode || '996511',
          consignorGst: dbInvoice.consignorGst || companySettings.gstNumber || '23AADCR1234F1Z5',
          consigneeGst: dbInvoice.consigneeGst || '24AAACG5678B1Z2'
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`Govt E-Invoice IRN & Signed QR Code Generated Live!\n\nIRN: ${data.irn ? data.irn.substring(0, 24) + '...' : 'Generated'}\nAck No: ${data.ackNumber}\nGateway: ${data.portalMode || 'GST IRP Gateway'}`);
        fetchInvoice();
      } else {
        showAlert(data.error || 'Failed to generate E-Invoice');
      }
    } catch (e) {
      showAlert('Error connecting to server');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateEWayBill = async () => {
    if (!dbInvoice || !dbInvoice.trip) {
      showAlert('No trip associated with this invoice to generate E-Way Bill');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/compliance/eway-bill/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: dbInvoice.trip.id,
          distanceKm: 350,
          consignorGst: '07AAACT1234A1Z5',
          consigneeGst: '27AAACR5678B1Z2'
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`E-Way Bill Generated! No: ${data.ewayBillNumber} (Valid for ${data.validityDays} day(s))`);
        fetchInvoice();
      } else {
        showAlert(data.error || 'Failed to generate E-Way Bill');
      }
    } catch (e) {
      showAlert('Error connecting to server');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Invoice...</div>;
  }

  if (!dbInvoice) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Invoice Not Found</h2>
        <button className="primary-btn" onClick={() => navigate('/billing')}>Go Back</button>
      </div>
    );
  }

  // RCM and GST Calculation
  const isRcm = Boolean(dbInvoice.rcmApplicable);
  const grossAmount = Number(dbInvoice.amount) || 0;
  const freightAmount = isRcm ? grossAmount : (grossAmount / 1.05);
  const cgst = isRcm ? 0 : (freightAmount * 0.025);
  const sgst = isRcm ? 0 : (freightAmount * 0.025);

  // TDS Calculation
  const isTds = Boolean(dbInvoice.tdsApplicable);
  const tdsRate = Number(dbInvoice.tdsRate) || (isTds ? 2.0 : 0);
  const tdsDeduction = Number(dbInvoice.tdsAmount) || (isTds ? (freightAmount * (tdsRate / 100)) : 0);
  const netReceivable = Math.max(0, grossAmount - tdsDeduction);

  // Payments summary
  const totalPaid = invoicePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, netReceivable - totalPaid);

  const isPaid = dbInvoice.status === 'Paid' || (balanceDue <= 0 && netReceivable > 0);
  const isEInvoiceGenerated = dbInvoice.einvoiceStatus === 'GENERATED' || Boolean(dbInvoice.irn);
  const qrData = dbInvoice.qrCodeData || dbInvoice.irn || 'TAX-INVOICE';
  const upiId = dbInvoice.upiId && dbInvoice.upiId !== 'rktraders@upi' ? dbInvoice.upiId : 'mohitpatidar2479@naviaxis';
  const payableAmount = balanceDue > 0 ? balanceDue : netReceivable;

  const handleDownloadTallyXml = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/compliance/tally/export/xml', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tally_vouchers_import.xml';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showAlert('Failed to download Tally XML.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error downloading Tally XML file.');
    }
  };

  const handleDownloadTallyCsv = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/compliance/tally/export/csv', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tally_vouchers_import.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showAlert('Failed to download Tally CSV.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error downloading Tally CSV file.');
    }
  };

  return (
    <div className="vehicle-details-container">
      {/* Hide controls during print via CSS */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-sizing: border-box;
            }
            .no-print {
              display: none !important;
            }
            .invoice-box {
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}
      </style>

      {/* Header Actions Bar */}
      <div className="no-print" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        marginBottom: '24px',
        backgroundColor: 'var(--panel-bg)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Left Title Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={() => navigate('/billing')} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'var(--text-primary)', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Go Back"
            >
              <MdArrowBack size={20} />
            </button>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  Invoice: {dbInvoice.invoiceNumber}
                </h2>
                <span className={`status-badge ${isPaid ? 'paid' : 'draft'}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {dbInvoice.status}
                </span>
                {isEInvoiceGenerated ? (
                  <span className="status-badge active" style={{ backgroundColor: '#2ed573', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 10px' }}>
                    <MdCheckCircle size={14} /> E-Invoice IRN Generated
                  </span>
                ) : (
                  <span className="status-badge draft" style={{ backgroundColor: '#ffa502', color: '#fff', fontSize: '12px', padding: '4px 10px' }}>
                    E-Invoice Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleDownloadTallyXml} style={{ backgroundColor: '#10ac84', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              📥 Tally XML
            </button>

            <button onClick={handleDownloadTallyCsv} style={{ backgroundColor: '#0984e3', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              📊 Tally CSV
            </button>

            {!isEInvoiceGenerated && (
              <button style={{ backgroundColor: '#8e44ad', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} onClick={handleGenerateEInvoice} disabled={generating}>
                <MdQrCode2 size={16} /> {generating ? 'Generating...' : 'Generate E-Invoice'}
              </button>
            )}

            {(!dbInvoice.ewayBillNumber && dbInvoice.trip) && (
              <button style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} onClick={handleGenerateEWayBill} disabled={generating}>
                🚚 Generate E-Way Bill
              </button>
            )}

            <button style={{ backgroundColor: '#2980b9', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} onClick={handlePrint}>
              <MdPrint size={16} /> Print Invoice
            </button>

            <button style={{ backgroundColor: '#fbc531', color: '#2d3436', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} onClick={() => navigate(`/billing/create`)}>
              <MdEdit size={16} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* A4 PRINT TEMPLATE */}
      <div className="print-area" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="invoice-box" style={{ 
          width: '100%', 
          maxWidth: '800px', 
          background: '#fff', 
          padding: '40px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          borderRadius: '8px',
          color: '#333',
          fontFamily: "'Inter', sans-serif"
        }}>
          
          {/* Header & QR Code */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '26px', fontWeight: 900 }}>{companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</h1>
              <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#7f8c8d' }}>{companySettings.companyAddress || 'Transport Nagar, Indore, Madhya Pradesh - 452001'}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>GSTIN: {companySettings.gstNumber || '23AADCR1234F1Z5'} | Phone: {companySettings.phoneNumber || '+91 98765 43210'}</p>
            </div>
            
            <div style={{ textAlign: 'right', display: 'flex', gap: '16px', alignItems: 'center' }}>
              {isEInvoiceGenerated && (
                <div style={{ textAlign: 'center', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrData)}`} 
                    alt="E-Invoice QR Code" 
                    style={{ width: '100px', height: '100px', display: 'block' }}
                  />
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#475569', display: 'block', marginTop: '2px' }}>
                    NIC Signed QR Code
                  </span>
                </div>
              )}

              <div>
                <h2 style={{ margin: '0 0 6px 0', color: '#e74c3c', fontSize: '26px', letterSpacing: '1px' }}>TAX INVOICE</h2>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 8px 2px 0' }}>Invoice No:</td>
                      <td>{dbInvoice.invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 8px 2px 0' }}>Date:</td>
                      <td>{dbInvoice.date}</td>
                    </tr>
                    {dbInvoice.ewayBillNumber && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 8px 2px 0', color: '#0984e3' }}>E-Way Bill:</td>
                        <td style={{ fontWeight: 'bold', color: '#0984e3' }}>{dbInvoice.ewayBillNumber}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Official E-Invoice IRN Details Banner */}
          {isEInvoiceGenerated && (
            <div style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '24px',
              fontSize: '11px',
              color: '#334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#27ae60' }}>✅ E-INVOICE COMPLIANT (GOVT NIC PORTAL)</span>
                <span>Ack No: <strong>{dbInvoice.ackNumber || '17298401928401'}</strong> ({dbInvoice.ackDate || 'Today'})</span>
              </div>
              <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '10px', color: '#475569' }}>
                <strong>IRN:</strong> {dbInvoice.irn}
              </div>
            </div>
          )}

          {/* Bill To */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#2c3e50', borderBottom: '1px solid #ecf0f1', paddingBottom: '4px' }}>Billed To:</h3>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '16px' }}>{dbInvoice.clientName || dbInvoice.trip?.clientName}</p>
            <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#7f8c8d' }}>
              {dbInvoice.trip?.pickupAddress || 'Address not provided'}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>GSTIN: {dbInvoice.consigneeGst || '27AAACR5678B1Z2'} | State Code: 07</p>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', border: '1px solid #bdc3c7' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'center', width: '40px' }}>#</th>
                <th style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'left' }}>Description of Service</th>
                <th style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'center', width: '90px' }}>HSN / SAC</th>
                <th style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'right', width: '130px' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'center' }}>1</td>
                <td style={{ padding: '10px', border: '1px solid #bdc3c7' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Goods Transportation Charges (GTA)</p>
                  {dbInvoice.trip && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>
                      Trip: {dbInvoice.trip.tripNumber || `TRP-${dbInvoice.trip.id}`} <br/>
                      Vehicle: {dbInvoice.trip.vehicle?.registrationNumber || 'Unknown'} <br/>
                      Route: {dbInvoice.trip.route || 'Unknown'}
                    </p>
                  )}
                </td>
                <td style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'center' }}>{dbInvoice.hsnCode || '996511'}</td>
                <td style={{ padding: '10px', border: '1px solid #bdc3c7', textAlign: 'right' }}>{freightAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals & TDS / RCM Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
            {/* Left: Recorded Part-Payments History */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#2c3e50', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                💳 Payment History & Receipts ({invoicePayments.length}):
              </h4>
              {invoicePayments.length === 0 ? (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  No advance or part-payments recorded yet. Total balance is pending.
                </p>
              ) : (
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: '4px 0' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '4px 0' }}>Mode / Ref</th>
                      <th style={{ textAlign: 'right', padding: '4px 0' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicePayments.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '4px 0' }}>{p.paymentDate}</td>
                        <td style={{ padding: '4px 0' }}>{p.paymentMode} ({p.paymentReference || 'N/A'})</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                          ₹{Number(p.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right: Calculations table */}
            <table style={{ width: '340px', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Subtotal (Freight):</td>
                  <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{freightAmount.toFixed(2)}</td>
                </tr>
                {isRcm ? (
                  <tr>
                    <td style={{ padding: '6px 0', color: '#0984e3' }}>GST (5% under RCM):</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', color: '#0984e3', fontStyle: 'italic' }}>Paid by Recipient</td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td style={{ padding: '6px 0', color: '#7f8c8d' }}>CGST @ 2.5%:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#7f8c8d' }}>₹{cgst.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: '#7f8c8d' }}>SGST @ 2.5%:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', color: '#7f8c8d' }}>₹{sgst.toFixed(2)}</td>
                    </tr>
                  </>
                )}
                <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Gross Invoice Total:</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{grossAmount.toFixed(2)}</td>
                </tr>
                {isTds && (
                  <tr>
                    <td style={{ padding: '6px 0', color: '#e74c3c' }}>Less: TDS (Sec 194C @ {tdsRate}%):</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', color: '#e74c3c', fontWeight: 'bold' }}>- ₹{tdsDeduction.toFixed(2)}</td>
                  </tr>
                )}
                <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Net Receivable:</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold' }}>₹{netReceivable.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#16a34a' }}>Paid to Date:</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>- ₹{totalPaid.toFixed(2)}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #333' }}>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', fontSize: '15px', color: balanceDue > 0 ? '#e74c3c' : '#16a34a' }}>
                    {balanceDue > 0 ? 'Remaining Balance Due:' : 'Status: Fully Cleared'}
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', color: balanceDue > 0 ? '#e74c3c' : '#16a34a' }}>
                    ₹{balanceDue.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Point 7: Dynamic UPI Payment Link & QR Code Card */}
          <div style={{
            marginBottom: '24px',
            padding: '14px 18px',
            borderRadius: '8px',
            border: '1px solid #20c997',
            backgroundColor: '#e6fffa',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>📲</span>
                <h4 style={{ margin: 0, color: '#0ca678', fontSize: '14px', fontWeight: 'bold' }}>Instant UPI Freight Payment (GPay / PhonePe / Paytm / BHIM)</h4>
              </div>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#2b8a3e' }}>
                Scan QR Code to pay <strong>₹{payableAmount.toFixed(2)}</strong> {balanceDue > 0 ? '(Remaining Balance)' : '(Full Bill)'} directly to Transporter Account.
              </p>
              <div style={{ fontSize: '11px', color: '#495057', fontFamily: 'monospace' }}>
                <strong>VPA:</strong> {upiId} | <strong>Invoice Ref:</strong> {dbInvoice.invoiceNumber}
              </div>
              <div style={{ marginTop: '8px' }}>
                <a 
                  href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(companySettings.companyName || 'R.K. TRADERS & LOGISTICS')}&am=${payableAmount.toFixed(2)}&tn=${encodeURIComponent(dbInvoice.invoiceNumber || '')}&cu=INR`}
                  style={{ display: 'inline-block', backgroundColor: '#0ca678', color: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px' }}
                >
                  ⚡ Open UPI App / Pay Now (₹{payableAmount.toFixed(2)})
                </a>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={qrCodeDataUrl || "/mohit_upi_qr.png"}
                alt="UPI Payment QR Code"
                style={{ width: '115px', height: '115px', border: '1.5px solid #0ca678', borderRadius: '8px', padding: '4px', backgroundColor: '#fff', display: 'block', objectFit: 'contain' }}
              />
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#0ca678', marginTop: '4px' }}>
                Scan to Pay (PhonePe/GPay)
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #ecf0f1', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', color: '#7f8c8d', maxWidth: '60%' }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#2c3e50' }}>Terms & Conditions:</p>
              <ol style={{ paddingLeft: '14px', margin: 0 }}>
                <li>Payment is due within 15 days.</li>
                <li>Subject to Indore jurisdiction.</li>
                <li>Interest @24% p.a. will be charged if payment is delayed.</li>
              </ol>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '50px', width: '160px', borderBottom: '1px solid #bdc3c7', marginBottom: '8px' }}></div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>Authorized Signatory</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#7f8c8d' }}>{companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
