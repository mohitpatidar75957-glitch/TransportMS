import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete, MdPictureAsPdf, MdCheckCircle, MdPayment, MdCurrencyRupee } from 'react-icons/md';
import './Vehicles.css'; // Reusing general styles
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
  const { roleKey, currentUser } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbInvoices, setDbInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [paymentsMap, setPaymentsMap] = useState({});
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'UPI',
    paymentReference: '',
    remarks: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: 'R.K. TRADERS & LOGISTICS',
    companyAddress: 'Transport Nagar, Indore, Madhya Pradesh - 452001',
    phoneNumber: '+91 98765 43210',
    gstNumber: '23AADCR1234F1Z5'
  });

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch('/api/v1/finance/invoices', {
        headers: authHeader
      });
      if (response.ok) {
        let data = await response.json();
        
        // If customer, filter to only their company's invoices
        if (roleKey === 'CUSTOMER') {
          const clientName = (currentUser?.companyName || currentUser?.name || '').toLowerCase();
          data = data.filter(i => {
            if (!clientName) return true;
            const cName = (i.clientName || i.trip?.clientName || '').toLowerCase();
            return cName.includes(clientName);
          });
        }

        setDbInvoices(data);

        // Fetch payments for each invoice
        data.forEach(async (inv) => {
          try {
            const pRes = await fetch(`/api/v1/finance/invoices/${inv.id}/payments`, {
              headers: authHeader
            });
            if (pRes.ok) {
              const pData = await pRes.json();
              setPaymentsMap(prev => ({ ...prev, [inv.id]: pData }));
            }
          } catch (e) {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch invoices from database:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('/api/v1/management/settings', { headers: authHeader })
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
      .catch(() => {});

    fetchInvoices();
  }, []);

  const handleDirectDownloadPdf = (inv) => {
    const raw = inv.rawInvoice || {};
    const trip = raw.trip || {};
    const baseFreight = Number(trip.freightAmount) || (Number(raw.amount) ? (Boolean(raw.rcmApplicable) ? Number(raw.amount) : Number(raw.amount) / 1.05) : 0);
    const gstAmt = Number(trip.gstAmount) || 0;
    const biltyAmt = Number(trip.biltyCharge) || 0;
    const loadingAmt = Number(trip.loadingCharge) || 0;
    const advancePaid = Number(trip.advanceAmount) || 0;

    const isRcm = Boolean(raw.rcmApplicable);
    const grossAmt = inv.grossVal || (baseFreight + gstAmt + biltyAmt + loadingAmt);

    const isTds = Boolean(raw.tdsApplicable);
    const tdsRate = Number(raw.tdsRate) || (isTds ? 2.0 : 0);
    const tdsDeduction = Number(raw.tdsAmount) || (isTds ? (baseFreight * (tdsRate / 100)) : 0);
    const netReceivable = Math.max(0, grossAmt - tdsDeduction);
    
    const invoicePayments = paymentsMap[inv.dbId] || [];
    const paymentRecordsSum = invoicePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalPaid = paymentRecordsSum + (paymentRecordsSum === 0 ? advancePaid : 0);
    const balanceDue = Math.max(0, netReceivable - totalPaid);

    const docNo = inv.id;
    const docDate = raw.date || new Date().toISOString().split('T')[0];
    const clientName = inv.customer || 'Customer Logistics';
    const route = trip.route || 'Route Delivery';
    const vehNo = trip.vehicle?.registrationNumber || 'MH04AB1234';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${docNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              padding: 30px;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .company-name { font-size: 22px; font-weight: 700; color: #0984e3; margin: 0; }
            .inv-badge { font-size: 24px; font-weight: 800; color: #e74c3c; margin: 0; }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1; }
            th { background: #f1f5f9; color: #334155; padding: 10px; font-size: 13px; border: 1px solid #cbd5e1; }
            td { padding: 10px; border: 1px solid #cbd5e1; font-size: 13px; }
            .summary-table { width: 360px; margin-left: auto; border-collapse: collapse; margin-bottom: 25px; }
            .summary-table td { border: none; padding: 5px 8px; font-size: 13px; }
            .footer { display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="company-name">${companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</h1>
              <p style="margin: 4px 0; font-size: 13px; color: #64748b;">${companySettings.companyAddress}</p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">GSTIN: <strong>${companySettings.gstNumber}</strong> | Phone: ${companySettings.phoneNumber}</p>
            </div>
            <div style="text-align: right;">
              <h2 class="inv-badge">TAX INVOICE</h2>
              <p style="margin: 4px 0 0 0; font-size: 14px;"><strong>Invoice No:</strong> ${docNo}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;"><strong>Date:</strong> ${docDate}</p>
              ${raw.ewayBillNumber ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: #0984e3;"><strong>E-Way Bill:</strong> ${raw.ewayBillNumber}</p>` : ''}
            </div>
          </div>

          ${raw.irn ? `
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; font-size: 11px; margin-bottom: 20px;">
              <strong>IRN:</strong> ${raw.irn}<br/>
              <strong>Ack No:</strong> ${raw.ackNumber || '1726000000000'} | <strong>Govt E-Invoice Compliant</strong>
            </div>
          ` : ''}

          <div class="details-grid">
            <div class="box">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Billed To:</span>
              <h4 style="margin: 4px 0 2px 0; font-size: 15px; color: #0f172a;">${clientName}</h4>
              <p style="margin: 0; font-size: 13px; color: #475569;">${trip.deliveryAddress || trip.pickupAddress || 'Address on file'}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">GSTIN: ${raw.consigneeGst || '24AAACG5678B1Z2'}</p>
            </div>
            <div class="box">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Shipment / Route:</span>
              <p style="margin: 4px 0 2px 0; font-size: 14px; font-weight: 600;">${route}</p>
              <p style="margin: 0; font-size: 13px; color: #475569;">Vehicle No: <strong>${vehNo}</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Trip: ${inv.tripId || 'N/A'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="text-align: left;">Description of Service</th>
                <th style="width: 100px; text-align: center;">HSN/SAC</th>
                <th style="width: 130px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center;">1</td>
                <td>
                  <strong>Base Freight Transportation Charges</strong><br/>
                  <span style="font-size: 12px; color: #64748b;">Route: ${route} (${vehNo})</span>
                </td>
                <td style="text-align: center;">${raw.hsnCode || '996511'}</td>
                <td style="text-align: right; font-weight: 600;">₹${baseFreight.toFixed(2)}</td>
              </tr>
              ${biltyAmt > 0 ? `
              <tr>
                <td style="text-align: center;">2</td>
                <td><strong>Bilty / Documentation Charges</strong></td>
                <td style="text-align: center;">996511</td>
                <td style="text-align: right; font-weight: 600;">₹${biltyAmt.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${loadingAmt > 0 ? `
              <tr>
                <td style="text-align: center;">${biltyAmt > 0 ? 3 : 2}</td>
                <td><strong>Loading / Unloading Charges</strong></td>
                <td style="text-align: center;">996511</td>
                <td style="text-align: right; font-weight: 600;">₹${loadingAmt.toFixed(2)}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          <table class="summary-table">
            <tr>
              <td>Base Freight:</td>
              <td style="text-align: right; font-weight: 600;">₹${baseFreight.toFixed(2)}</td>
            </tr>
            ${biltyAmt > 0 ? `
              <tr><td>Bilty Charges:</td><td style="text-align: right;">₹${biltyAmt.toFixed(2)}</td></tr>
            ` : ''}
            ${loadingAmt > 0 ? `
              <tr><td>Loading Charges:</td><td style="text-align: right;">₹${loadingAmt.toFixed(2)}</td></tr>
            ` : ''}
            ${gstAmt > 0 ? `
              <tr><td>GST (${trip.gstPercent ? `${trip.gstPercent}%` : 'Tax'}):</td><td style="text-align: right; color: #0984e3;">+ ₹${gstAmt.toFixed(2)}</td></tr>
            ` : (isRcm ? `
              <tr><td colspan="2" style="color: #27ae60; font-size: 11px; font-weight: bold;">(GST on Reverse Charge Mechanism - RCM)</td></tr>
            ` : '')}
            <tr style="border-top: 1px solid #cbd5e1; font-weight: bold;">
              <td>Gross Total Amount:</td>
              <td style="text-align: right; color: #0f172a;">₹${grossAmt.toFixed(2)}</td>
            </tr>
            ${isTds ? `
              <tr style="color: #e74c3c;">
                <td>Less: TDS (${tdsRate}%):</td>
                <td style="text-align: right;">- ₹${tdsDeduction.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr style="border-top: 1px solid #cbd5e1; font-weight: bold; font-size: 14px;">
              <td>Net Payable / Receivable:</td>
              <td style="text-align: right; color: #0984e3;">₹${netReceivable.toFixed(2)}</td>
            </tr>
            ${totalPaid > 0 ? `
            <tr>
              <td style="color: #16a34a;">Less: Advance / Paid:</td>
              <td style="text-align: right; color: #16a34a; font-weight: bold;">- ₹${totalPaid.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #0f172a; font-weight: 800; font-size: 15px;">
              <td>${balanceDue > 0 ? 'Balance Due:' : 'Status: Fully Cleared'}</td>
              <td style="text-align: right; color: ${balanceDue > 0 ? '#e74c3c' : '#16a34a'};">₹${balanceDue.toFixed(2)}</td>
            </tr>
          </table>

          <div class="footer">
            <div style="font-size: 11px; color: #64748b;">
              <strong>Terms:</strong> Payment due within 15 days. Subject to Indore jurisdiction.
            </div>
            <div style="text-align: center;">
              <div style="height: 40px;"></div>
              <p style="margin: 0; font-weight: 700; font-size: 12px;">Authorized Signatory</p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">${companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    iframe.contentDocument.open();
    iframe.contentDocument.write(invoiceHtml);
    iframe.contentDocument.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 400);
  };

  const allInvoices = [
    ...dbInvoices.map(i => {
      const trip = i.trip;
      const baseFreight = Number(trip?.freightAmount) || Number(i.amount) || 0;
      const gstAmt = Number(trip?.gstAmount) || 0;
      const biltyAmt = Number(trip?.biltyCharge) || 0;
      const loadingAmt = Number(trip?.loadingCharge) || 0;
      const advancePaid = Number(trip?.advanceAmount) || 0;
      
      // If invoice has a linked trip with charges, calculate true gross total
      const calculatedGross = trip 
        ? (baseFreight + gstAmt + biltyAmt + loadingAmt)
        : (Number(i.amount) || 0);

      const grossAmt = calculatedGross > 0 ? calculatedGross : (Number(i.amount) || 0);
      const tdsAmt = Number(i.tdsAmount) || 0;
      const netBilled = Math.max(0, grossAmt - tdsAmt);

      // Sum all recorded part-payments
      const invoicePayments = paymentsMap[i.id] || [];
      const paymentRecordsSum = invoicePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const totalPaidSum = paymentRecordsSum + (paymentRecordsSum === 0 ? advancePaid : 0);
      
      const isPaid = i.status === 'Paid' || (netBilled > 0 && totalPaidSum >= netBilled);
      const paidVal = totalPaidSum > 0 ? totalPaidSum : (isPaid ? netBilled : 0);
      const pendingVal = Math.max(0, netBilled - paidVal);

      let computedStatus = i.status || 'Draft';
      if (paidVal >= netBilled && netBilled > 0) {
        computedStatus = 'Paid';
      } else if (paidVal > 0) {
        computedStatus = 'Partially Paid';
      } else if (i.status === 'Paid') {
        computedStatus = 'Paid';
      }

      return {
        id: i.invoiceNumber || `INV-DB-${i.id}`,
        dbId: i.id,
        rawInvoice: { ...i, amount: grossAmt },
        date: i.date || 'Unknown',
        dueDate: i.dueDate || null,
        customer: i.clientName || i.trip?.clientName || 'N/A',
        tripId: i.trip ? (i.trip.tripNumber || `TRP-DB-${i.trip.id}`) : 'N/A',
        amountVal: netBilled,
        grossVal: grossAmt,
        baseFreight,
        gstAmt,
        biltyAmt,
        loadingAmt,
        advancePaid,
        hasBreakdown: Boolean(trip && (gstAmt > 0 || biltyAmt > 0 || loadingAmt > 0 || advancePaid > 0)),
        tdsVal: tdsAmt,
        amount: `₹${netBilled.toLocaleString()}`,
        paidVal: paidVal,
        paid: `₹${paidVal.toLocaleString()}`,
        pendingVal: pendingVal,
        pending: `₹${pendingVal.toLocaleString()}`,
        status: computedStatus,
        paymentsCount: invoicePayments.length,
        isReal: true
      };
    })
  ].sort((a, b) => (b.dbId || 0) - (a.dbId || 0));

  const totalBilled = allInvoices.reduce((sum, i) => sum + i.amountVal, 0);
  const totalCollected = allInvoices.reduce((sum, i) => sum + i.paidVal, 0);
  const totalPending = allInvoices.reduce((sum, i) => sum + i.pendingVal, 0);

  const handleOpenPaymentModal = (inv) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentForm({
      amount: inv.pendingVal > 0 ? inv.pendingVal : '',
      paymentMode: 'UPI',
      paymentReference: 'UPI-' + Math.floor(100000 + Math.random() * 900000),
      remarks: 'Part payment received',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !paymentForm.amount) return;

    try {
      const res = await fetch(`/api/v1/finance/invoices/${selectedInvoiceForPayment.dbId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          paymentMode: paymentForm.paymentMode,
          paymentReference: paymentForm.paymentReference,
          remarks: paymentForm.remarks,
          paymentDate: paymentForm.paymentDate
        })
      });

      if (res.ok) {
        showAlert('Payment recorded successfully!');
        setShowPaymentModal(false);
        fetchInvoices();
      } else {
        showAlert('Failed to record payment.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error recording payment.');
    }
  };

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this invoice?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/finance/invoices/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbInvoices(dbInvoices.filter(i => i.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const handleMarkPaid = async (dbId) => {
    if (await showConfirm('Mark this invoice as Paid?')) {
      try {
        const response = await fetch(`/api/v1/finance/invoices/${dbId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid' })
        });
        if (response.ok) {
          const updatedInvoice = await response.json();
          setDbInvoices(dbInvoices.map(i => i.id === dbId ? updatedInvoice : i));
          showAlert('Invoice marked as Paid successfully.');
        } else {
          showAlert('Failed to update invoice status.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredInvoices = allInvoices.filter(i => {
    const idStr = String(i.id || '');
    const custStr = String(i.customer || '');
    const tripStr = String(i.tripId || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    return idStr.toLowerCase().includes(searchStr) || 
           custStr.toLowerCase().includes(searchStr) ||
           tripStr.toLowerCase().includes(searchStr);
  });

  // Tally & E-Way State
  const [showTallyModal, setShowTallyModal] = useState(false);
  const [tallyDateRange, setTallyDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);

  const toggleSelectInvoice = (id) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInvoiceIds.length === filteredInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(filteredInvoices.map(i => i.dbId).filter(Boolean));
    }
  };

  const handleDownloadTallyXml = async (customStart, customEnd) => {
    try {
      const token = localStorage.getItem('token');
      const start = customStart || tallyDateRange.startDate;
      const end = customEnd || tallyDateRange.endDate;
      let url = '/api/v1/compliance/tally/export/xml?';
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (selectedInvoiceIds.length > 0) {
        selectedInvoiceIds.forEach(id => params.append('invoiceIds', id));
      }
      url += params.toString();

      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `tally_vouchers_${start || 'all'}_to_${end || 'all'}.xml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        setShowTallyModal(false);
        showAlert('Tally XML downloaded successfully! Open Tally Prime -> Import -> Vouchers.');
      } else {
        showAlert('Failed to download Tally XML file.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error downloading Tally XML file.');
    }
  };

  const handleDownloadTallyCsv = async (customStart, customEnd) => {
    try {
      const token = localStorage.getItem('token');
      const start = customStart || tallyDateRange.startDate;
      const end = customEnd || tallyDateRange.endDate;
      let url = '/api/v1/compliance/tally/export/csv?';
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (selectedInvoiceIds.length > 0) {
        selectedInvoiceIds.forEach(id => params.append('invoiceIds', id));
      }
      url += params.toString();

      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `tally_vouchers_${start || 'all'}_to_${end || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        setShowTallyModal(false);
        showAlert('Tally CSV downloaded successfully!');
      } else {
        showAlert('Failed to download Tally CSV file.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error downloading Tally CSV file.');
    }
  };

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Billing / Invoices</h2>
          <p>Manage customer billing and payments</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {roleKey !== 'CUSTOMER' && (
            <>
              <button 
                onClick={() => setShowTallyModal(true)} 
                className="primary-btn" 
                style={{ backgroundColor: '#27ae60', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                📥 Tally XML Export {selectedInvoiceIds.length > 0 ? `(${selectedInvoiceIds.length} Selected)` : ''}
              </button>
              <button 
                onClick={() => setShowTallyModal(true)} 
                className="primary-btn" 
                style={{ backgroundColor: '#2980b9', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                📊 Tally CSV Export
              </button>
            </>
          )}
          {(roleKey === 'SUPER_ADMIN' || roleKey === 'MANAGER') && (
            <button className="primary-btn" onClick={() => navigate('/billing/create')}>
              <MdAdd size={20} />
              Create Invoice
            </button>
          )}
        </div>
      </div>

      <div className="summary-cards-container">
        <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #3498db' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Billed</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalBilled.toLocaleString()}</p>
        </div>
        <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #4cd137' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Collected</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="panel" style={{ padding: '24px', borderLeft: '4px solid #fbc531' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Pending Payments</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="filter-section panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search Invoice #, Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="search-btn">
            <MdSearch size={20} />
            Search
          </button>
        </div>

        {selectedInvoiceIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#27ae60', fontWeight: 600 }}>
              ✓ {selectedInvoiceIds.length} invoice(s) selected
            </span>
            <button 
              onClick={() => handleDownloadTallyXml()}
              style={{ padding: '6px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Export Selected to Tally XML
            </button>
            <button 
              onClick={() => setSelectedInvoiceIds([])}
              style={{ padding: '6px 10px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              {roleKey !== 'CUSTOMER' && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={filteredInvoices.length > 0 && selectedInvoiceIds.length === filteredInvoices.length}
                    onChange={toggleSelectAll}
                    title="Select All Invoices"
                  />
                </th>
              )}
              <th>INVOICE #</th>
              <th>CUSTOMER / TRIP</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
              <th style={{ textAlign: 'right' }}>PAID</th>
              <th style={{ textAlign: 'right' }}>PENDING</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={roleKey !== 'CUSTOMER' ? 8 : 7} style={{textAlign: 'center', padding: '20px'}}>No invoices found.</td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoiceIds.includes(inv.dbId);
                return (
                <tr key={inv.id} style={{ backgroundColor: isSelected ? 'rgba(39, 174, 96, 0.08)' : 'transparent' }}>
                  {roleKey !== 'CUSTOMER' && (
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelectInvoice(inv.dbId)}
                      />
                    </td>
                  )}
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num link-text">{inv.id}</span>
                      <span className="vehicle-name">{inv.date}</span>
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num">{inv.customer}</span>
                      <span className="vehicle-name link-text">{inv.tripId}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)' }}>{inv.amount}</div>
                    {inv.hasBreakdown ? (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }} title={`Base Freight: ₹${inv.baseFreight.toLocaleString()} + GST: ₹${inv.gstAmt.toLocaleString()} + Extra Charges: ₹${(inv.biltyAmt + inv.loadingAmt).toLocaleString()}${inv.advancePaid > 0 ? ` - Advance: ₹${inv.advancePaid.toLocaleString()}` : ''}`}>
                        ₹{inv.baseFreight.toLocaleString()} + GST {inv.gstAmt > 0 ? `₹${inv.gstAmt.toLocaleString()}` : '₹0'} + Charges ₹{(inv.biltyAmt + inv.loadingAmt).toLocaleString()}
                        {inv.advancePaid > 0 && <span style={{ color: '#27ae60' }}> (Adv: -₹{inv.advancePaid.toLocaleString()})</span>}
                      </div>
                    ) : (
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Standard Freight</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', color: '#4cd137', fontWeight: 600 }}>{inv.paid}</td>
                  <td style={{ textAlign: 'right', color: '#e74c3c', fontWeight: 600 }}>{inv.pending}</td>
                  <td>
                    <span className={`status-badge ${(inv.status || 'Draft').toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button className="action-icon view" title="View & Details" onClick={() => navigate(`/billing/${inv.id}`)}><MdVisibility /></button>
                      <button className="action-icon view" title="Direct Download / Print PDF" style={{color: '#e74c3c'}} onClick={() => handleDirectDownloadPdf(inv)}><MdPictureAsPdf /></button>
                      
                      {/* Add Part Payment button */}
                      <button 
                        className="action-icon"
                        title="Record Payment / Part Payment" 
                        style={{ color: '#00b894' }} 
                        onClick={() => handleOpenPaymentModal(inv)}
                      >
                        <MdCurrencyRupee size={18} />
                      </button>

                      {(roleKey === 'SUPER_ADMIN' || roleKey === 'MANAGER') && (
                        <>
                          <button className="action-icon edit" title="Edit" onClick={() => navigate('/billing/create')}><MdEdit /></button>
                          <button className="action-icon delete" title="Delete" onClick={() => handleDelete(inv.id, inv.isReal, inv.dbId)}><MdDelete /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}))}
          </tbody>
        </table>
      </div>

      {/* Part Payment Modal */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '92%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Record Part Payment</h3>
                <span style={{ fontSize: '13px', color: '#0984e3', fontWeight: 600 }}>{selectedInvoiceForPayment.id}</span>
              </div>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div style={{ backgroundColor: 'rgba(9, 132, 227, 0.08)', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Customer:</span>
                  <strong>{selectedInvoiceForPayment.customer}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Net Invoice Billed:</span>
                  <strong>{selectedInvoiceForPayment.amount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c' }}>
                  <span>Balance Pending:</span>
                  <strong>{selectedInvoiceForPayment.pending}</strong>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Payment Amount (₹) <span className="required">*</span></label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={paymentForm.amount} 
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} 
                  max={selectedInvoiceForPayment.pendingVal > 0 ? selectedInvoiceForPayment.pendingVal : undefined}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Payment Mode</label>
                  <select 
                    value={paymentForm.paymentMode} 
                    onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    style={{ width: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    <option value="UPI">UPI / Online</option>
                    <option value="NEFT">Bank Transfer / NEFT</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Payment Date</label>
                  <input 
                    type="date" 
                    value={paymentForm.paymentDate} 
                    onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} 
                    style={{ width: '100%' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Reference No. / UTR / Cheque No.</label>
                <input 
                  type="text" 
                  value={paymentForm.paymentReference} 
                  onChange={e => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })} 
                  placeholder="e.g. UTR / Transaction ID" 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Remarks / Notes</label>
                <input 
                  type="text" 
                  value={paymentForm.remarks} 
                  onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })} 
                  placeholder="e.g. Advance paid on loading / balance payment" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="save-btn" style={{ backgroundColor: '#27ae60' }}>Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tally Date Range & Filter Export Modal */}
      {showTallyModal && (
        <div className="modal-overlay" onClick={() => setShowTallyModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📥 Export to Tally ERP / Prime
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Download Tally-compatible XML (or CSV) vouchers with Party Ledger & GST breakdown
                </span>
              </div>
              <button className="close-btn" onClick={() => setShowTallyModal(false)}>✕</button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <strong>Tally Import Guide:</strong>
                <ol style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: '1.5' }}>
                  <li>Download the <code>.XML</code> file below.</li>
                  <li>In Tally Prime, press <strong>Alt + O (Import) &rarr; Transactions / Vouchers</strong>.</li>
                  <li>Select the downloaded XML file to auto-create Sales vouchers!</li>
                </ol>
              </div>

              {selectedInvoiceIds.length > 0 ? (
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#38bdf8' }}>
                  ✓ <strong>{selectedInvoiceIds.length} specific invoices</strong> selected from the table. Export will only include these vouchers.
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    FILTER BY INVOICE DATE RANGE (Optional):
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From Date</span>
                      <input 
                        type="date" 
                        value={tallyDateRange.startDate} 
                        onChange={e => setTallyDateRange({ ...tallyDateRange, startDate: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>To Date</span>
                      <input 
                        type="date" 
                        value={tallyDateRange.endDate} 
                        onChange={e => setTallyDateRange({ ...tallyDateRange, endDate: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button 
                  onClick={() => handleDownloadTallyXml()}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: '#27ae60', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    fontSize: '14px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📥 Download Tally XML
                </button>
                <button 
                  onClick={() => handleDownloadTallyCsv()}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: '#2980b9', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    fontSize: '14px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📊 Download Tally CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;


