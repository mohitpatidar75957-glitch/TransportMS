import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdLocalShipping, MdReceipt, MdAttachMoney, MdLocationOn, 
  MdVisibility, MdPictureAsPdf, MdCheckCircle, MdAccessTime, MdPhone, MdShare
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './Vehicles.css';

const CustomerDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine client company name / search key
  const clientName = (currentUser?.companyName || userRole?.companyName || currentUser?.name || userRole?.name || '').trim().toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripRes, invRes, lrRes] = await Promise.all([
          fetch('/api/v1/fleet/trips'),
          fetch('/api/v1/finance/invoices'),
          fetch('/api/v1/fleet/lr')
        ]);

        if (tripRes.ok) {
          const tripData = await tripRes.json();
          // Filter trips matching this client's company name or client name
          const myTrips = tripData.filter(t => {
            if (!clientName) return true;
            const cName = (t.clientName || '').toLowerCase();
            const consName = (t.consignorName || '').toLowerCase();
            const recName = (t.consigneeName || '').toLowerCase();
            return cName.includes(clientName) || consName.includes(clientName) || recName.includes(clientName);
          });
          setTrips(myTrips);
        }

        if (invRes.ok) {
          const invData = await invRes.json();
          const myInvoices = invData.filter(i => {
            if (!clientName) return true;
            const cName = (i.clientName || i.trip?.clientName || '').toLowerCase();
            return cName.includes(clientName);
          });
          setInvoices(myInvoices);
        }

        if (lrRes.ok) {
          const lrData = await lrRes.json();
          const myLrs = lrData.filter(l => {
            if (!clientName) return true;
            const cName = (l.consignor || '').toLowerCase();
            const rName = (l.consignee || '').toLowerCase();
            return cName.includes(clientName) || rName.includes(clientName);
          });
          setLrs(myLrs);
        }
      } catch (err) {
        console.error('Error fetching customer portal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientName]);

  // Calculations
  const activeTrips = trips.filter(t => {
    const s = (t.status || '').toLowerCase();
    return s.includes('transit') || s.includes('active') || s.includes('dispatch') || s === 'in transit';
  });
  const deliveredTrips = trips.filter(t => {
    const s = (t.status || '').toLowerCase();
    return s.includes('delivered') || s.includes('complete') || s.includes('closed');
  });

  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const paidInvoices = invoices.filter(i => i.status === 'Paid');
  const unpaidInvoices = invoices.filter(i => i.status !== 'Paid');
  const pendingAmount = unpaidInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Client Portal...</div>;
  }

  return (
    <div className="vehicles-container">
      {/* Welcome Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🏢</span>
            <h2>Client Logistics Portal — {currentUser?.companyName || currentUser?.name || 'Valued Customer'}</h2>
          </div>
          <p>Track your ongoing shipments, access official LRs & POD copies, and view billing invoices.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="summary-cards-container" style={{ marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #3498db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Live Shipments</h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{activeTrips.length}</p>
            </div>
            <MdLocalShipping size={32} color="#3498db" />
          </div>
        </div>

        <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #2ecc71' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Completed Trips</h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>{deliveredTrips.length}</p>
            </div>
            <MdCheckCircle size={32} color="#2ecc71" />
          </div>
        </div>

        <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #f1c40f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Available LRs & PODs</h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{lrs.length}</p>
            </div>
            <MdReceipt size={32} color="#f1c40f" />
          </div>
        </div>

        <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #e74c3c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Pending Payment</h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>₹{pendingAmount.toLocaleString()}</p>
            </div>
            <MdAttachMoney size={32} color="#e74c3c" />
          </div>
        </div>
      </div>

      {/* Live & Ongoing Shipments Section */}
      <div className="table-container panel" style={{ marginBottom: '30px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#0984e3' }}>📍</span> Live & Ongoing Shipments ({activeTrips.length})
          </h3>
          <button className="primary-btn" onClick={() => navigate('/tracking')} style={{ fontSize: '12px', padding: '6px 12px' }}>
            Full Tracking Map
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>TRIP #</th>
              <th>ROUTE (FROM ➔ TO)</th>
              <th>VEHICLE / DRIVER</th>
              <th>DISPATCH DATE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'center' }}>TRACK SHIPMENT</th>
            </tr>
          </thead>
          <tbody>
            {activeTrips.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  No active or in-transit shipments right now.
                </td>
              </tr>
            ) : (
              activeTrips.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 'bold', color: '#0984e3' }}>{t.tripNumber || `TRP-${t.id}`}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{t.route || 'Indore ➔ Pune'}</div>
                    <small style={{ color: 'var(--text-secondary)' }}>{t.goodsType || 'General Freight'} • {t.weight ? `${t.weight} ${t.weightUnit || 'Ton'}` : ''}</small>
                  </td>
                  <td>
                    <div><strong>{t.vehicle?.registrationNumber || 'Assigned'}</strong></div>
                    <small style={{ color: 'var(--text-secondary)' }}>Driver: {t.driver?.name || 'Dispatched'}</small>
                  </td>
                  <td>{t.startDate || t.dispatchDate || 'Today'}</td>
                  <td>
                    <span className="status-badge in-transit">In Transit</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="primary-btn" 
                      style={{ padding: '5px 12px', fontSize: '12px', backgroundColor: '#0984e3', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => navigate('/tracking')}
                    >
                      <MdLocationOn /> Live GPS
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grid: LRs & Bills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        {/* Lorry Receipts & PODs */}
        <div className="table-container panel">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>📑 Lorry Receipts (LR) & PODs</h3>
            <button className="reset-btn" onClick={() => navigate('/lr')} style={{ fontSize: '12px' }}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>LR #</th>
                <th>CONSIGNOR ➔ CONSIGNEE</th>
                <th>WEIGHT</th>
                <th style={{ textAlign: 'center' }}>DOCUMENTS</th>
              </tr>
            </thead>
            <tbody>
              {lrs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No LR records found.</td>
                </tr>
              ) : (
                lrs.slice(0, 6).map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 'bold' }}>{l.lrNumber || `LR-${l.id}`}</td>
                    <td>
                      <div>{l.consignor} ➔ {l.consignee}</div>
                      <small style={{ color: 'var(--text-secondary)' }}>{l.fromLocation} to {l.toLocation}</small>
                    </td>
                    <td>{l.weight || 0} {l.weightUnit || 'Kg'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="action-icon view" 
                        title="View & Download Bilty/LR PDF"
                        style={{ color: '#0984e3' }}
                        onClick={() => navigate(`/lr/${l.id}`)}
                      >
                        <MdPictureAsPdf /> LR Copy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Invoices & Statements */}
        <div className="table-container panel">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>💰 Invoices & Billing Statements</h3>
            <button className="reset-btn" onClick={() => navigate('/billing')} style={{ fontSize: '12px' }}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE #</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right' }}>AMOUNT</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>PAY / VIEW</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No invoices found.</td>
                </tr>
              ) : (
                invoices.slice(0, 6).map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                    <td>{inv.date}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{Number(inv.amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${(inv.status || 'Draft').toLowerCase().replace(' ', '-')}`}>
                        {inv.status || 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="primary-btn" 
                        style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: inv.status === 'Paid' ? '#27ae60' : '#e67e22' }}
                        onClick={() => navigate(`/billing/${inv.id}`)}
                      >
                        {inv.status === 'Paid' ? 'Receipt' : 'Pay via UPI'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
