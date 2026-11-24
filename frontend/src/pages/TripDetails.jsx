import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdAdd, MdVisibility, MdClose, MdFileDownload, MdDescription, MdLocalShipping, MdFlashOn, MdMic, MdUploadFile, MdCheckCircle, MdPrint } from 'react-icons/md';
import QRCode from 'qrcode';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import './VehicleDetails.css';

const TripDetails = () => {
  const { showAlert, showConfirm } = useModal();
  const { roleKey, currentUser } = useAuth();
  const isDriver = roleKey === 'DRIVER';
  const { id } = useParams();
  const navigate = useNavigate();

  const [dbTrip, setDbTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [lrs, setLrs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showPodImage, setShowPodImage] = useState(false);
  const [revInput, setRevInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [downloadingEway, setDownloadingEway] = useState(false);
  const [generatingEway, setGeneratingEway] = useState(false);

  // Smart POD Upload with Payment Modal
  const [showPodUploadModal, setShowPodUploadModal] = useState(false);
  const [podSelectedFile, setPodSelectedFile] = useState(null);
  const [podFilePreview, setPodFilePreview] = useState(null);
  const [collectPaymentOnDelivery, setCollectPaymentOnDelivery] = useState(false);
  const [deliveryPaymentAmount, setDeliveryPaymentAmount] = useState('');
  const [deliveryPaymentMode, setDeliveryPaymentMode] = useState('UPI');
  const [deliveryPaymentRemarks, setDeliveryPaymentRemarks] = useState('Delivery collection on POD receiving');

  const handleOpenEwaySlip = async () => {
    if (!dbTrip?.id) return;
    let currentEwb = dbTrip.ewayBillNumber;
    let currentExp = dbTrip.ewayBillExpiry;

    if (!currentEwb || currentEwb.trim() === '' || currentEwb.toLowerCase() === 'part-a ready') {
      try {
        setGeneratingEway(true);
        const res = await fetch('/api/v1/compliance/eway-bill/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tripId: Number(dbTrip.id),
            distanceKm: dbTrip.distance || 250
          })
        });
        if (res.ok) {
          const data = await res.json();
          currentEwb = data.ewayBillNumber;
          currentExp = data.ewayBillExpiry;
          setDbTrip(prev => ({
            ...prev,
            ewayBillNumber: currentEwb,
            ewayBillExpiry: currentExp
          }));
        } else {
          const err = await res.json();
          showAlert(err.error || 'Failed to generate E-Way bill');
          setGeneratingEway(false);
          return;
        }
      } catch (err) {
        showAlert('Error generating E-Way Bill: ' + err.message);
        setGeneratingEway(false);
        return;
      } finally {
        setGeneratingEway(false);
      }
    }

    navigate(`/trips/${dbTrip.tripNumber || dbTrip.id}/eway-bill`);
  };

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const [tripRes, expRes, lrRes, invRes] = await Promise.all([
          fetch('/api/v1/fleet/trips'),
          fetch('/api/v1/finance/expenses'),
          fetch('/api/v1/fleet/lr'),
          fetch('/api/v1/finance/invoices')
        ]);

        if (tripRes.ok) {
          const data = await tripRes.json();
          const found = data.find(item => item.tripNumber === id || `TRP-DB-${item.id}` === id || String(item.id) === id);
          if (found) {
            setDbTrip(found);
            
            // Filter expenses for this trip
            if (expRes.ok) {
              const exps = await expRes.json();
              setExpenses(exps.filter(e => e.trip && e.trip.id === found.id));
            }
            
            // Filter LRs for this trip
            if (lrRes.ok) {
              const lrData = await lrRes.json();
              setLrs(lrData.filter(l => l.trip && l.trip.id === found.id));
            }
            
            // Filter Invoices for this trip
            if (invRes.ok) {
              const invData = await invRes.json();
              setInvoices(invData.filter(i => i.trip && i.trip.id === found.id));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTripData();
  }, [id]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showEway') === 'true' && dbTrip) {
      handleOpenEwaySlip();
    }
  }, [dbTrip?.id]);

  if (loading) return <div style={{padding: '24px'}}>Loading trip details...</div>;

  const trip = {
    id: dbTrip?.tripNumber || id,
    dbId: dbTrip?.id,
    customer: dbTrip?.clientName || 'Unknown Customer',
    customerMobile: dbTrip?.customerContact || '-',
    loadType: dbTrip?.goodsType || 'Mixed',
    route: dbTrip?.route || 'Unknown Route',
    from: dbTrip?.route ? dbTrip.route.split(/ to |->|→|-/)[0]?.trim() || 'Unknown' : 'Unknown',
    to: dbTrip?.route ? dbTrip.route.split(/ to |->|→|-/)[1]?.trim() || 'Unknown' : 'Unknown',
    distance: dbTrip?.distance ? `${dbTrip.distance} km` : '-',
    vehicle: dbTrip?.vehicle?.registrationNumber || 'Unknown',
    driver: dbTrip?.driver?.name || 'Unknown',
    vendor: dbTrip?.vendor?.name || '-',
    freightAmount: `₹${dbTrip?.freightAmount || 0}`,
    grossFreight: `₹${(dbTrip?.freightAmount || 0) + (dbTrip?.gstAmount || 0) + (dbTrip?.biltyCharge || 0) + (dbTrip?.loadingCharge || 0)}`,
    advanceAmount: `₹${dbTrip?.advanceAmount || 0}`,
    status: dbTrip?.status || 'Pending',
    podStatus: dbTrip?.podStatus || 'PENDING',
    dispatchDate: dbTrip?.dispatchDate || dbTrip?.startDate || 'Not Set',
    expectedDeliveryDate: dbTrip?.expectedDeliveryDate || 'Not Set',
    expectedMargin: dbTrip?.expectedMargin || 0,
    actualMargin: dbTrip?.actualMargin || 0,
    actualRevenue: dbTrip?.actualRevenue || 0,
    reconciledCosts: dbTrip?.reconciledCosts || 0,
  };

  const handleCloseTrip = async () => {
    if (!trip.dbId) return;

    if (trip.actualRevenue <= 0 || trip.reconciledCosts <= 0) {
      // Show the beautiful modal instead of native prompt
      let defaultCost = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      
      // If no expenses are manually added, estimate the cost based on Freight and Expected Margin
      if (defaultCost === 0) {
          const freightVal = parseFloat(trip.freightAmount.replace(/[^0-9.-]+/g, '')) || 0;
          const expectedMargin = parseFloat(trip.expectedMargin) || 0;
          defaultCost = Math.max(0, freightVal - expectedMargin);
      }

      setRevInput(trip.freightAmount.replace(/[^0-9.-]+/g, '').trim());
      setCostInput(defaultCost.toString());
      setShowReconcileModal(true);
      return;
    }

    executeCloseTrip();
  };

  const submitReconcileAndClose = async () => {
    if (!revInput || !costInput) {
       showAlert("Please enter both Revenue and Costs!");
       return;
    }
    
    try {
      const reconcileRes = await fetch(`/api/trips/${trip.dbId}/reconcile`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          actualRevenue: Number(revInput),
          reconciledCosts: Number(costInput)
        })
      });
      if (!reconcileRes.ok) {
         const errText = await reconcileRes.text();
         showAlert("Failed to reconcile trip finances: " + errText);
         return;
      }
    } catch (err) {
      showAlert("Error connecting to server.");
      return;
    }

    setShowReconcileModal(false);
    executeCloseTrip();
  };

  const executeCloseTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${trip.dbId}/close`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const errorText = await res.text();
        showAlert(errorText); // Error popup as requested
      } else {
        showAlert("Trip closed successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to close trip: " + err.message);
    }
  };

  const openPodUploadDialog = () => {
    // Calculate pending balance from trip freight & advance
    const freightVal = parseFloat(String(trip.freightAmount || '').replace(/[^0-9.-]+/g, '')) || 0;
    const advanceVal = parseFloat(String(trip.advanceAmount || '').replace(/[^0-9.-]+/g, '')) || 0;
    const balanceVal = Math.max(0, freightVal - advanceVal);

    setDeliveryPaymentAmount(balanceVal > 0 ? balanceVal.toString() : '');
    setCollectPaymentOnDelivery(balanceVal > 0);
    setPodSelectedFile(null);
    setPodFilePreview(null);
    setShowPodUploadModal(true);
  };

  const handleSelectPodFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPodSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPodFilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitPodWithPayment = async (e) => {
    e.preventDefault();
    if (!podSelectedFile || !trip.dbId) {
      showAlert("Please select a POD slip image or document first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', podSelectedFile);

    if (collectPaymentOnDelivery && deliveryPaymentAmount && parseFloat(deliveryPaymentAmount) > 0) {
      formData.append('deliveryPayment', parseFloat(deliveryPaymentAmount));
      formData.append('paymentMode', deliveryPaymentMode);
      formData.append('remarks', deliveryPaymentRemarks);
    }

    try {
      const res = await fetch(`/api/trips/${trip.dbId}/pod`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        showAlert("POD Uploaded & Delivery Payment successfully processed!");
        setShowPodUploadModal(false);
        window.location.reload();
      } else {
        showAlert("Failed to upload POD");
      }
    } catch(err) {
      showAlert("Error: " + err.message);
    }
  };

  const handleDeleteTrip = async () => {
    if (!trip.dbId) return;
    const confirmed = await showConfirm(`Are you sure you want to delete Trip ${trip.id}?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/trips/${trip.dbId}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert('Trip deleted successfully');
        navigate('/trips');
      } else {
        showAlert('Failed to delete trip');
      }
    } catch (err) {
      showAlert('Error deleting trip: ' + err.message);
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  return (
    <div className="vehicle-details-container" style={{ padding: '24px' }}>
      
      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="modal-overlay" onClick={() => setShowReconcileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Final Trip Settlement</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Please enter the final revenue and reconciled costs from the POD before closing this trip.
            </p>
            
            <div className="form-group">
              <label>Final Actual Revenue (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                value={revInput} 
                onChange={(e) => setRevInput(e.target.value)} 
                placeholder="Enter revenue..."
              />
            </div>
            
            <div className="form-group">
              <label>Total Reconciled Costs (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                value={costInput} 
                onChange={(e) => setCostInput(e.target.value)} 
                placeholder="Enter total expenses..."
              />
              <small style={{color: 'var(--text-secondary)'}}>Default is sum of expenses or estimated route cost.</small>
            </div>
            
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setShowReconcileModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitReconcileAndClose} style={{ backgroundColor: '#27ae60' }}>Save & Close Trip</button>
            </div>
          </div>
        </div>
      )}

      {/* View POD Image Modal */}
      {showPodImage && (
        <div className="modal-overlay" onClick={() => setShowPodImage(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '80%', maxHeight: '90vh', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Proof of Delivery</h3>
              <button className="icon-btn" onClick={() => setShowPodImage(false)}><MdClose size={24} /></button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', borderRadius: '8px' }}>
              <img 
                src={dbTrip?.podUrl ? `/${dbTrip.podUrl.replace(/\\/g, '/')}` : ''} 
                alt="Proof of Delivery" 
                style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 60px)', objectFit: 'contain' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Smart POD Upload & Delivery Payment Settlement Modal */}
      {showPodUploadModal && (
        <div className="modal-overlay" onClick={() => setShowPodUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MdDescription size={20} color="#3b82f6" /> Upload POD & Delivery Settlement</span></h3>
              <button className="icon-btn" onClick={() => setShowPodUploadModal(false)}><MdClose size={22} /></button>
            </div>
            
            <form onSubmit={submitPodWithPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Signed POD Document / Photo *</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  required
                  onChange={handleSelectPodFile} 
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#fff' }}
                />
                {podFilePreview && (
                  <div style={{ marginTop: '10px', textAlign: 'center', background: '#000', borderRadius: '6px', padding: '6px', maxHeight: '160px', overflow: 'hidden' }}>
                    <img src={podFilePreview} alt="POD Preview" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              {/* Delivery Payment Option */}
              <div style={{ background: 'rgba(9, 132, 227, 0.08)', border: '1px solid rgba(9, 132, 227, 0.25)', borderRadius: '8px', padding: '12px 16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#38bdf8', marginBottom: collectPaymentOnDelivery ? '12px' : '0' }}>
                  <input 
                    type="checkbox" 
                    checked={collectPaymentOnDelivery} 
                    onChange={e => setCollectPaymentOnDelivery(e.target.checked)} 
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Payment Collected on Delivery? (Cash / UPI / Cheque)</span>
                </label>

                {collectPaymentOnDelivery && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Amount Collected at Delivery (₹)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={deliveryPaymentAmount} 
                        onChange={e => setDeliveryPaymentAmount(e.target.value)} 
                        placeholder="e.g. 2724" 
                        style={{ marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Payment Mode</label>
                      <select 
                        className="form-control" 
                        value={deliveryPaymentMode} 
                        onChange={e => setDeliveryPaymentMode(e.target.value)}
                        style={{ marginTop: '4px' }}
                      >
                        <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                        <option value="Cash">Cash (Received by Driver / Munshi)</option>
                        <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Remarks</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={deliveryPaymentRemarks} 
                        onChange={e => setDeliveryPaymentRemarks(e.target.value)} 
                        placeholder="Remarks / Note..." 
                        style={{ marginTop: '4px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPodUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#27ae60' }}>Save & Confirm POD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="details-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '12px' }}>
        <div className="header-titles" style={{ flexShrink: 0 }}>
          <h2 style={{ whiteSpace: 'nowrap', margin: 0 }}>Trip Details — {trip.id}</h2>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
          {roleKey !== 'CUSTOMER' && (
            <button 
              className="trip-btn trip-btn-eway" 
              onClick={handleOpenEwaySlip} 
              disabled={generatingEway || downloadingEway}
              title="View & Print Official Government E-Way Bill Slip"
            >
              <MdLocalShipping size={17} />
              <span>{generatingEway ? 'Generating...' : 'Govt E-Way Bill'}</span>
            </button>
          )}
          {roleKey !== 'CUSTOMER' && trip.status !== 'CLOSED' && (
             <button 
               className="trip-btn trip-btn-pod" 
               onClick={openPodUploadDialog}
               title="Upload or update Proof of Delivery slip and payment"
             >
               <MdUploadFile size={17} />
               <span>{trip.podStatus === 'RECEIVED' ? 'Update POD & Payment' : 'Upload POD'}</span>
             </button>
          )}
          {trip.podStatus === 'RECEIVED' && dbTrip?.podUrl && (
             <button 
               className="trip-btn trip-btn-viewpod" 
               onClick={() => setShowPodImage(true)}
               title="View uploaded Proof of Delivery document"
             >
               <MdVisibility size={17} />
               <span>View POD Copy</span>
             </button>
          )}
          {roleKey !== 'CUSTOMER' && trip.status !== 'CLOSED' && (
            <button 
              className="trip-btn trip-btn-close" 
              onClick={handleCloseTrip}
              title="Final reconcile and close this trip"
            >
              <MdCheckCircle size={17} />
              <span>Close Trip</span>
            </button>
          )}
          {roleKey !== 'CUSTOMER' && (
            <>
              <button 
                className="trip-btn trip-btn-edit" 
                onClick={() => navigate(`/trips/${id}/edit`)}
                title="Edit trip details"
              >
                <MdEdit size={17} />
                <span>Edit Trip</span>
              </button>
              <button 
                className="trip-btn trip-btn-delete" 
                onClick={handleDeleteTrip}
                title="Delete this trip"
              >
                <MdDelete size={17} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Compliance & Linked LR Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Linked LR / Bilty Banner */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MdDescription size={24} color="#16a34a" />
            <strong style={{ color: '#16a34a', fontSize: '15px', fontWeight: 700 }}>LR / Bilty:</strong>
            <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', marginLeft: '4px' }}>
              {lrs[0]?.lrNumber || dbTrip?.lrNumber || `LR-${dbTrip?.tripNumber || id}`}
            </span>
          </div>
          <button 
            onClick={() => navigate(`/lr/${lrs[0]?.id || id}`)}
            style={{ 
              backgroundColor: '#16a34a', 
              color: '#ffffff', 
              border: '1px solid #15803d', 
              padding: '8px 16px', 
              fontSize: '13px', 
              fontWeight: 600, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              cursor: 'pointer', 
              borderRadius: '6px', 
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            <span>View LR</span>
            <span>→</span>
          </button>
        </div>

        {/* E-Way Bill & Government Compliance Banner - Styled Symmetrically to LR Box */}
        <div style={{
          backgroundColor: '#fff7ed',
          border: '1.5px solid #fdba74',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MdLocalShipping size={24} color="#ea580c" />
            <strong style={{ color: '#ea580c', fontSize: '15px', fontWeight: 700 }}>E-Way Bill:</strong>
            <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', marginLeft: '4px' }}>
              {dbTrip?.ewayBillNumber && dbTrip.ewayBillNumber.toLowerCase() !== 'part-a ready' ? dbTrip.ewayBillNumber : 'Not Generated'}
            </span>
            {dbTrip?.ewayBillExpiry && dbTrip.ewayBillNumber && dbTrip.ewayBillNumber.toLowerCase() !== 'part-a ready' && (
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                Exp: {dbTrip.ewayBillExpiry}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {dbTrip?.ewayBillNumber && dbTrip.ewayBillNumber.toLowerCase() !== 'part-a ready' ? (
              <button 
                onClick={() => navigate(`/trips/${dbTrip.tripNumber || dbTrip.id}/eway-bill`)}
                style={{ 
                  backgroundColor: '#ea580c', 
                  color: '#ffffff', 
                  border: '1px solid #c2410c', 
                  padding: '8px 16px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: 'pointer', 
                  borderRadius: '6px', 
                  whiteSpace: 'nowrap', 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)' 
                }}
              >
                <span>View E-Way Slip</span>
                <span>→</span>
              </button>
            ) : (
              <button 
                onClick={async () => {
                  if (!dbTrip?.id) return;
                  const status = (dbTrip.status || '').trim().toLowerCase();
                  if (status === 'completed' || status === 'delivered') {
                    showAlert('Cannot generate E-Way Bill: This trip is already marked Completed/Delivered. E-Way Bills are only valid for dispatch and transit.');
                    return;
                  }
                  try {
                    const res = await fetch('/api/v1/compliance/eway-bill/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tripId: Number(dbTrip.id),
                        distanceKm: dbTrip.distance || 250
                      })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setDbTrip(prev => ({
                        ...prev,
                        ewayBillNumber: data.ewayBillNumber,
                        ewayBillExpiry: data.ewayBillExpiry
                      }));
                      showAlert(`Govt E-Way Bill Generated! No: ${data.ewayBillNumber}`);
                      // Auto-navigate to LR where E-Way Bill number is displayed as requested by user
                      navigate(`/lr/${lrs[0]?.id || id}`);
                    } else {
                      const err = await res.json();
                      showAlert(err.error || 'Failed to generate E-Way bill');
                    }
                  } catch (e) {
                    showAlert('Error: ' + e.message);
                  }
                }}
                disabled={(dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered'}
                title={((dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered') ? "E-Way Bill cannot be generated for completed trips" : "Generate E-Way Bill"}
                style={{ 
                  backgroundColor: ((dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered') ? '#f1f5f9' : '#16a34a', 
                  color: ((dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered') ? '#64748b' : '#ffffff', 
                  border: ((dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered') ? '1px solid #cbd5e1' : '1px solid #15803d', 
                  padding: '8px 16px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: ((dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered') ? 'not-allowed' : 'pointer', 
                  borderRadius: '6px', 
                  whiteSpace: 'nowrap', 
                  boxShadow: ((dbTrip?.status || '').toLowerCase() === 'completed' || (dbTrip?.status || '').toLowerCase() === 'delivered') ? 'none' : '0 1px 2px rgba(0,0,0,0.06)' 
                }}
              >
                <MdFlashOn size={16} />
                <span>Generate E-Way Bill</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1 1 20%', minWidth: '200px' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Route Info</h4>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Source &rarr; Destination</span>
            <span style={{ fontWeight: 'bold' }}>{trip.from} &rarr; {trip.to}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Distance</span>
            <span>{trip.distance}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Dispatch Date</span>
            <span style={{ fontWeight: 500 }}>{trip.dispatchDate}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Expected Delivery (ETA)</span>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>⏱️ {trip.expectedDeliveryDate}</span>
          </div>
        </div>
        
        <div style={{ flex: '1 1 20%', minWidth: '200px' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Assignment</h4>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Vehicle</span>
            <span className="link-text" onClick={() => dbTrip?.vehicle?.id && navigate(`/vehicles/${dbTrip.vehicle.id}`)} style={{ cursor: 'pointer' }}>{trip.vehicle}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Driver</span>
            <span className="link-text" onClick={() => dbTrip?.driver?.id && navigate(`/drivers/${dbTrip.driver.id}`)} style={{ cursor: 'pointer' }}>{trip.driver}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Customer</span>
            <span>{trip.customer}</span>
          </div>
        </div>
        
        <div style={{ flex: '1 1 20%', minWidth: '200px' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Finance & Status</h4>
          <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Base Freight:</span>
            <span style={{ fontWeight: 'bold' }}>{trip.freightAmount}</span>
          </div>
          <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total (with GST):</span>
            <span style={{ fontWeight: 'bold', color: '#4cd137' }}>{trip.grossFreight}</span>
          </div>
          <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>POD Status:</span>
            <span style={{ fontWeight: 'bold', color: trip.podStatus === 'RECEIVED' ? '#4cd137' : '#ff9f43' }}>{trip.podStatus}</span>
          </div>
          <div>
            <span className={`status-badge ${(trip.status || '').toLowerCase()}`}>{trip.status}</span>
          </div>
        </div>

        {roleKey !== 'CUSTOMER' && (
          <div style={{ flex: '1 1 20%', minWidth: '200px' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Margins & Costs</h4>
            <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Actual Revenue:</span>
              <span style={{ fontWeight: 'bold' }}>₹{trip.actualRevenue}</span>
            </div>
            <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Reconciled Costs:</span>
              <span style={{ fontWeight: 'bold', color: '#ff4757' }}>₹{trip.reconciledCosts}</span>
            </div>
            <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Expected Profit:</span>
              <span style={{ fontWeight: 'bold' }}>₹{trip.expectedMargin}</span>
            </div>
            <div className="flex-between-responsive" style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Actual Profit:</span>
              <span style={{ fontWeight: 'bold', color: trip.actualMargin >= 0 ? '#4cd137' : '#ff4757' }}>₹{trip.actualMargin}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {roleKey !== 'CUSTOMER' && (
          <div style={{ flex: '2 1 60%', minWidth: '350px' }}>
            <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="flex-between-responsive" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Trip Expenses</h3>
                <button className="primary-btn" onClick={() => navigate('/expenses')} style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MdAdd /> Add Expense
                </button>
              </div>
              
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>CATEGORY</th>
                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td><span className="category-badge">{exp.category}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ff4757' }}>₹{exp.amount}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>No expenses recorded for this trip</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Expense:</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ff4757', fontSize: '16px' }}>₹{totalExpense}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div style={{ flex: roleKey === 'CUSTOMER' ? '1 1 100%' : '1 1 30%', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Driver Notes Display */}
          {roleKey !== 'CUSTOMER' && (
          <div className="panel" style={{ padding: '20px', background: 'rgba(230, 126, 34, 0.05)', border: '1px solid rgba(230, 126, 34, 0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e67e22' }}>
              <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MdMic size={18} color="#e67e22" /> Driver & Admin Notes</span></span>
              {(roleKey === 'ADMIN' || roleKey === 'SUPER_ADMIN') && (
                <button 
                  style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                  onClick={async () => {
                    if (await showConfirm("Are you sure you want to clear all notes?")) {
                      const res = await fetch(`/api/trips/${dbTrip.id}/notes`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify({ note: "CLEAR" })
                      });
                      if (res.ok) {
                        setDbTrip({...dbTrip, notes: ''});
                      }
                    }
                  }}
                >
                  Clear Notes
                </button>
              )}
            </h3>
            <div style={{ maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '15px' }}>
              {dbTrip?.notes ? dbTrip.notes : <span style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>No notes yet.</span>}
            </div>
            {dbTrip && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  id="adminReplyInput" 
                  className="form-control" 
                  placeholder="Type a reply..." 
                  style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                />
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', backgroundColor: '#e67e22', whiteSpace: 'nowrap' }}
                  onClick={async () => {
                    const reply = document.getElementById('adminReplyInput').value;
                    if(reply) {
                      const fallbackRole = isDriver ? 'Driver' : (roleKey === 'MANAGER' ? 'Manager' : 'Admin');
                      const senderName = currentUser?.name || fallbackRole;
                      const adminNote = `${senderName}: ${reply}`;
                      try {
                        const res = await fetch(`/api/trips/${dbTrip.id}/notes`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                          body: JSON.stringify({ note: adminNote })
                        });
                        if (res.ok) {
                          const updatedData = await res.json();
                          setDbTrip(updatedData);
                          document.getElementById('adminReplyInput').value = '';
                          showAlert('Reply sent successfully!');
                        } else {
                          showAlert('Failed to send reply');
                        }
                      } catch(err) {
                        showAlert('Error: ' + err.message);
                      }
                    }
                  }}
                >
                  Reply
                </button>
              </div>
            )}
          </div>
          )}

          <div className="panel" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Customer Information</h3>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Name</span>
              <span style={{ fontWeight: 'bold' }}>{trip.customer}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile</span>
              <span>{trip.customerMobile}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Load Type</span>
              <span>{trip.loadType}</span>
            </div>
          </div>

          <div className="panel" style={{ padding: '20px' }}>
            <div className="flex-between-responsive" style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>LR / Bilty Records</h3>
              <button className="action-icon edit" onClick={() => navigate('/lr/create')} style={{ backgroundColor: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}><MdAdd size={20} /></button>
            </div>
            {lrs.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {lrs.map(lr => (
                  <li key={lr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{lr.lrNumber}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lr.consignor} &rarr; {lr.consignee}</div>
                    </div>
                    <button className="action-icon view" onClick={() => navigate(`/lr/${lr.id}`)}><MdVisibility size={16} /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>No Lorry Receipt found</p>
            )}
          </div>

          <div className="panel" style={{ padding: '20px' }}>
            <div className="flex-between-responsive" style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Invoices</h3>
              <button className="action-icon edit" onClick={() => navigate('/billing/create')} style={{ backgroundColor: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}><MdAdd size={20} /></button>
            </div>
            {invoices.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {invoices.map(inv => (
                  <li key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{inv.invoiceNumber || `INV-DB-${inv.id}`}</div>
                      <div style={{ fontSize: '12px', color: '#4cd137', fontWeight: 'bold' }}>₹{inv.amount}</div>
                    </div>
                    <button className="action-icon view" onClick={() => navigate(`/billing/${inv.id}`)}><MdVisibility size={16} /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>No Invoice generated</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TripDetails;


