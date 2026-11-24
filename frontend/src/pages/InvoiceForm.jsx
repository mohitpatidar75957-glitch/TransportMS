import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineReceiptLong } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';


const InvoiceForm = () => {
  const { showAlert } = useModal();
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState([]);
  
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    tripId: '',
    customerName: '',
    subTotal: '',
    taxPercentage: '5', // Default 5% GST for transport
    discount: '0',
    rcmApplicable: false, // Reverse Charge Mechanism
    tdsApplicable: true,  // TDS deduction
    tdsRate: '2',         // 2% TDS under Sec 194C
    upiId: 'rktraders@upi',
    paidAmount: '',
    paymentMode: 'Bank Transfer',
    status: 'Unpaid',
    notes: 'Thank you for your business. GTA freight transport services subject to Reverse Charge / TDS.'
  });

  useEffect(() => {
    // Fetch all trips to populate the dropdown
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/v1/fleet/trips');
        if (response.ok) {
          const data = await response.json();
          // Filter to only trips that might need billing (e.g., Completed or Active)
          setTrips(data);
        }
      } catch (error) {
        console.error("Failed to fetch trips", error);
      }
    };
    fetchTrips();
  }, []);

  const subTotal = parseFloat(formData.subTotal || 0);
  const effectiveTaxPercent = formData.rcmApplicable ? 0 : parseFloat(formData.taxPercentage || 0);
  const tax = subTotal * (effectiveTaxPercent / 100);
  const discount = parseFloat(formData.discount || 0);
  const grandTotal = subTotal + tax - discount;
  
  const tdsDeduction = formData.tdsApplicable 
    ? (subTotal * (parseFloat(formData.tdsRate || 0) / 100)) 
    : 0;
  const netReceivable = Math.max(0, grandTotal - tdsDeduction);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-fill logic when a trip is selected
    if (name === 'tripId') {
      const selectedTrip = trips.find(t => t.id === parseInt(value));
      if (selectedTrip) {
        setFormData(prev => ({
          ...prev,
          tripId: value,
          customerName: selectedTrip.clientName || '',
          subTotal: (selectedTrip.freightAmount || 0) + (selectedTrip.biltyCharge || 0) + (selectedTrip.loadingCharge || 0),
          taxPercentage: selectedTrip.gstPercent !== null && selectedTrip.gstPercent !== undefined ? selectedTrip.gstPercent : '5'
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      invoiceNumber: formData.invoiceNumber,
      clientName: formData.customerName,
      date: formData.date,
      dueDate: formData.dueDate,
      amount: grandTotal,
      status: formData.status,
      rcmApplicable: formData.rcmApplicable,
      tdsApplicable: formData.tdsApplicable,
      tdsRate: formData.tdsApplicable ? parseFloat(formData.tdsRate || 0) : 0,
      tdsAmount: tdsDeduction,
      upiId: formData.upiId,
      trip: formData.tripId ? { id: formData.tripId } : null
    };

    try {
      const response = await fetch('/api/v1/finance/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/billing');
      } else {
        const err = await response.text();
        showAlert(err || 'Failed to save invoice to database.');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header">
          <MdOutlineReceiptLong size={24} className="form-icon" />
          <h3>Create New Tax Invoice — {formData.invoiceNumber}</h3>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="section-divider" style={{marginTop: 0}}>
            <h4>Link to Trip</h4>
          </div>
          
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Select Trip <span className="required">*</span></label>
              <select name="tripId" value={formData.tripId} onChange={handleChange} required>
                <option value="">-- Select an Unbilled Trip --</option>
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    TRP-{trip.id} | {trip.clientName} | ₹{trip.freightAmount}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Invoice Date <span className="required">*</span></label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="section-divider">
            <h4>Billing Information</h4>
          </div>

          <div className="form-grid-2-mixed">
             <div className="form-group">
              <label>Customer Name <span className="required">*</span></label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Subtotal (Freight) ₹ <span className="required">*</span></label>
              <input type="number" name="subTotal" value={formData.subTotal} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>GST Tax (%)</label>
              <input type="number" name="taxPercentage" value={formData.taxPercentage} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Discount (₹)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} />
            </div>
          </div>

          <div className="section-divider">
            <h4>Taxation & Statutory Compliances (TDS & RCM)</h4>
          </div>

          <div className="form-grid-2-mixed" style={{ backgroundColor: 'rgba(9, 132, 227, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(9, 132, 227, 0.2)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  name="rcmApplicable" 
                  checked={formData.rcmApplicable} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>RCM Applicable (GTA GST 5% Paid by Consignor/Consignee under Reverse Charge)</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                <input 
                  type="checkbox" 
                  name="tdsApplicable" 
                  checked={formData.tdsApplicable} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Deduct TDS under Sec 194C</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              {formData.tdsApplicable && (
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>TDS Rate (%)</label>
                  <select name="tdsRate" value={formData.tdsRate} onChange={handleChange}>
                    <option value="1">1% (Individual / Proprietor)</option>
                    <option value="2">2% (Company / Firm / Ptd Ltd)</option>
                  </select>
                </div>
              )}
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-grid-2-mixed" style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', marginTop: '16px', border: '1px solid #cbd5e1' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tax (GST {formData.rcmApplicable ? '0% [RCM]' : `${formData.taxPercentage}%`}):</span>
                <span>₹ {tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600' }}>Invoice Value (Gross):</span>
                <span style={{ fontWeight: '600' }}>₹ {grandTotal.toFixed(2)}</span>
              </div>
              {formData.tdsApplicable && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#e74c3c' }}>
                  <span>Less TDS ({formData.tdsRate}% Sec 194C):</span>
                  <span style={{ fontWeight: 'bold' }}>- ₹ {tdsDeduction.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #94a3b8', paddingTop: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#16a34a' }}>Net Receivable Amount:</span>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#16a34a' }}>₹ {netReceivable.toFixed(2)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Status <span className="required">*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                  <option value="Unpaid">Unpaid (Draft)</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Transporter UPI ID (for QR Code)</label>
                <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="e.g. yourname@upi" />
              </div>
            </div>
          </div>

          <div className="form-group full-width" style={{marginTop: '16px'}}>
            <label>Invoice Notes / T&C</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">Generate Invoice</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/billing')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;


