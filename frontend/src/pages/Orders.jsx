import React, { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdAutoAwesome, MdClose, MdCheckCircle, MdWarning, MdLocalShipping, MdPerson } from 'react-icons/md';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import CitySearchInput from '../components/CitySearchInput';
import './Vehicles.css';
import './Orders.css';

const Orders = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Dispatch Suggestion state
  const [suggestion, setSuggestion] = useState(null);
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggOrderId, setSuggOrderId] = useState(null);
  const [showSuggModal, setShowSuggModal] = useState(false);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    cargoDetails: '',
    pickupLocation: '',
    dropLocation: '',
    weight: '',
    amount: '',
    expectedDate: ''
  });

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/orders');
      if (res.ok) setOrders(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.customerName || !newOrder.expectedDate) {
      showAlert("Customer Name and Expected Date are required.");
      return;
    }
    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        showAlert("Order Created Successfully!");
        setShowOrderModal(false);
        setNewOrder({ customerName: '', cargoDetails: '', pickupLocation: '', dropLocation: '', weight: '', amount: '', expectedDate: '' });
        fetchOrders();
      } else { showAlert("Failed to create order."); }
    } catch (err) { showAlert("Error creating order."); }
  };

  // ── Dispatch Suggestion ──────────────────────────────────
  const handleGetSuggestion = async (orderId) => {
    setSuggOrderId(orderId);
    setSuggLoading(true);
    setShowSuggModal(true);
    setSuggestion(null);
    try {
      const res = await fetch(`/api/v1/dispatch/suggest?orderId=${orderId}`);
      const data = await res.json();
      setSuggestion(data);
    } catch (err) {
      setSuggestion({ error: 'Failed to fetch suggestions. Backend may be down.' });
    }
    setSuggLoading(false);
  };

  const handleAccept = async (s) => {
    const order = orders.find(o => o.id === suggOrderId);
    if (!order) return;

    const freightVal = parseFloat(suggestion?.orderInfo?.freight?.replace(/[^0-9]/g, '')) || parseFloat(order.amount?.replace(/[^0-9]/g, '')) || s.freightAmount || 0;
    const cleanWeight = parseFloat(order.weight?.replace(/[^0-9.]/g, '')) || 10;
    const tripNumber = `TRP-${Math.floor(10000 + Math.random() * 90000)}`;

    const tripPayload = {
      tripNumber: tripNumber,
      order: { id: order.id },
      vehicle: { id: parseInt(s.vehicleId) },
      driver: { id: parseInt(s.driverId) },
      route: s.route || `${order.pickupLocation || 'Origin'} → ${order.dropLocation || 'Destination'}`,
      startDate: order.expectedDate || new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      freightAmount: freightVal,
      expectedRevenue: freightVal,
      expectedMargin: s.expectedProfit || 0,
      reconciledCosts: s.totalExpenses || (freightVal - (s.expectedProfit || 0)),
      goodsType: order.cargoDetails || 'General Goods',
      clientName: order.customerName,
      dispatchDate: order.expectedDate || new Date().toISOString().split('T')[0],
      pickupAddress: order.pickupLocation || '',
      deliveryAddress: order.dropLocation || '',
      weight: cleanWeight,
      weightUnit: 'Tons',
      distance: s.distanceKm || suggestion?.orderInfo?.distanceKm || 550
    };

    try {
      const res = await fetch('/api/v1/fleet/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripPayload)
      });

      if (res.ok) {
        // Update Order status to ASSIGNED in backend
        await fetch('/api/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...order, status: 'ASSIGNED' })
        });

        showAlert(`🎉 Trip ${tripNumber} created successfully! Vehicle ${s.vehicleReg} & Driver ${s.driverName} assigned.`);
        setShowSuggModal(false);
        fetchOrders();
      } else {
        showAlert("Failed to create trip from order.");
      }
    } catch (e) {
      console.error(e);
      showAlert("Error creating trip: " + e.message);
    }
  };

  const filteredOrders = orders.filter(o =>
    String(o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.cargoDetails || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Customer Orders</h2>
          <p>Manage incoming orders and booking requests from customers</p>
        </div>
        <button className="primary-btn" onClick={() => setShowOrderModal(true)}>
          <MdAdd size={20} /> Create Order
        </button>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search Order ID, Customer, Cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="search-btn"><MdSearch size={20} />Search</button>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>ORDER #</th>
              <th>CUSTOMER NAME</th>
              <th>CARGO & WEIGHT</th>
              <th>ROUTE (FROM ➔ TO)</th>
              <th>EXPECTED DATE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>DISPATCH</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>No orders found.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td><span className="vehicle-num link-text">{order.orderNumber}</span></td>
                  <td><strong>{order.customerName}</strong></td>
                  <td>{order.cargoDetails || '-'} {order.weight ? `(${order.weight})` : ''}</td>
                  <td>
                    {order.pickupLocation || order.dropLocation ? (
                      <span>{order.pickupLocation || '-'} ➔ {order.dropLocation || '-'}</span>
                    ) : '-'}
                  </td>
                  <td>{order.expectedDate || '-'}</td>
                  <td>{order.amount || '-'}</td>
                  <td>
                    <span className={`status-badge ${(order.status || 'PENDING').toLowerCase().replace(' ', '-')}`}>
                      {order.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(order.status !== 'COMPLETED') && (
                        <button
                          onClick={() => handleGetSuggestion(order.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '8px', border: 'none',
                            background: '#0984e3',
                            color: '#fff', fontWeight: '600', fontSize: '12px',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(9, 132, 227, 0.4)',
                            transition: 'all 0.2s'
                          }}
                          title="Get best truck & driver suggestion"
                        >
                          <MdAutoAwesome size={16} /> Suggest
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm(`Are you sure you want to delete order ${order.orderNumber}?`);
                          if (confirmed) {
                            try {
                              const res = await fetch(`/api/v1/orders/${order.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                showAlert("Order deleted successfully!");
                                fetchOrders();
                              }
                            } catch (e) {
                              showAlert("Failed to delete order");
                            }
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px'
                        }}
                        title="Delete this order"
                      >
                        <MdClose size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Order Modal ── */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <h3>Create New Order</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                <label>Customer Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Tata Motors / Reliance" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Cargo Details</label>
                <input type="text" className="form-control" placeholder="e.g. 500 Bags Cement" value={newOrder.cargoDetails} onChange={e => setNewOrder({...newOrder, cargoDetails: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Weight / Quantity</label>
                <input type="text" className="form-control" placeholder="e.g. 15 Tons" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Pickup Location (Starting location)</label>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CitySearchInput 
                    placeholder="e.g. Mumbai, Indore, Delhi..." 
                    value={newOrder.pickupLocation} 
                    onChange={val => setNewOrder({...newOrder, pickupLocation: val})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Drop Location (Destination)</label>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CitySearchInput 
                    placeholder="e.g. Pune, Bhopal, Ahmedabad..." 
                    value={newOrder.dropLocation} 
                    onChange={val => setNewOrder({...newOrder, dropLocation: val})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Agreed Freight Amount</label>
                <input type="text" className="form-control" placeholder="e.g. ₹45000" value={newOrder.amount} onChange={e => setNewOrder({...newOrder, amount: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Expected Dispatch Date *</label>
                <input type="date" className="form-control" value={newOrder.expectedDate} onChange={e => setNewOrder({...newOrder, expectedDate: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setShowOrderModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateOrder}>Submit Order</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dispatch Suggestion Modal ── */}
      {showSuggModal && (
        <div className="modal-overlay" onClick={() => setShowSuggModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '0', background: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>

            {/* Header */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: '12px 12px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MdLocalShipping size={28} color="#2563eb" />
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary, #0f172a)', fontSize: '18px', fontWeight: '700' }}>Dispatch Suggestion</h3>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '12px' }}>
                    Rule-based matching — You confirm before anything is saved
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSuggModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <MdClose size={22} />
              </button>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary, #ffffff)' }}>
              {suggLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#0984e3' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚙️</div>
                  <p>Checking vehicles, drivers & documents...</p>
                </div>
              )}

              {!suggLoading && suggestion?.error && (
                <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '20px' }}>
                  <MdWarning size={32} />
                  <p>{suggestion.error}</p>
                </div>
              )}

              {!suggLoading && suggestion && !suggestion.error && (
                <>
                  {/* Order Info */}
                  <div style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: '10px', padding: '16px', marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Order Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', fontSize: '13px' }}>
                      <div><span style={{ color: '#64748b' }}>Customer</span><br /><strong style={{ color: '#0f172a' }}>{suggestion.orderInfo?.customer}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Route</span><br /><strong style={{ color: '#0f172a' }}>{suggestion.orderInfo?.route}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Weight</span><br /><strong style={{ color: '#0f172a' }}>{suggestion.orderInfo?.weight}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Freight</span><br /><strong style={{ color: '#16a34a' }}>{suggestion.orderInfo?.freight}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Date</span><br /><strong style={{ color: '#0f172a' }}>{suggestion.orderInfo?.date}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Checked</span><br /><strong style={{ color: '#0f172a' }}>{suggestion.totalVehiclesChecked} trucks, {suggestion.totalDriversChecked} drivers</strong></div>
                    </div>
                  </div>

                  {/* Message */}
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                    {suggestion.message}
                  </p>

                  {/* Suggestion Cards */}
                  {(suggestion.suggestions || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      <MdWarning size={40} color="#f59e0b" />
                      <p style={{ marginTop: '12px' }}>No suitable combination found.<br />
                        Possible reasons: all trucks busy, documents expiring, no available drivers.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(suggestion.suggestions || []).map((s, idx) => (
                        <div key={idx} style={{
                          border: idx === 0 ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '12px', overflow: 'hidden',
                          background: idx === 0 ? '#f0f7ff' : '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          {idx === 0 && (
                            <div style={{ 
                              background: (s.expectedProfit || 0) >= 0 ? '#10b981' : '#2563eb', 
                              padding: '6px 16px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              color: '#fff', 
                              letterSpacing: '1px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span>{(s.expectedProfit || 0) >= 0 ? '💰 HIGHEST PROFIT CHOICE' : '⭐ BEST MATCH'}</span>
                              <span style={{ fontSize: '10px', opacity: 0.9 }}>RANK #1</span>
                            </div>
                          )}
                          <div style={{ padding: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                              {/* Vehicle */}
                              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <MdLocalShipping size={20} color="#2563eb" />
                                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>TRUCK</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{s.vehicleReg}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{s.vehicleName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Capacity: {s.vehicleCapacity}</span>
                                  {s.fitBadge && (
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      fontWeight: '600',
                                      background: s.fitBadge.includes('Optimal') ? '#dcfce7' : (s.fitBadge.includes('Good') ? '#e0f2fe' : '#fef9c3'),
                                      color: s.fitBadge.includes('Optimal') ? '#15803d' : (s.fitBadge.includes('Good') ? '#0369a1' : '#a16207'),
                                      border: `1px solid ${s.fitBadge.includes('Optimal') ? '#86efac' : (s.fitBadge.includes('Good') ? '#7dd3fc' : '#fde047')}`
                                    }}>
                                      {s.fitBadge}
                                    </span>
                                  )}
                                </div>
                                {s.utilizationPct !== undefined && (
                                  <div style={{ marginTop: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                                      <span>Load Utilization</span>
                                      <strong style={{ color: '#fff' }}>{s.utilizationPct}%</strong>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                      <div style={{
                                        width: `${Math.min(100, s.utilizationPct)}%`,
                                        height: '100%',
                                        background: s.utilizationPct >= 70 ? '#4ade80' : (s.utilizationPct >= 40 ? '#38bdf8' : '#facc15')
                                      }} />
                                    </div>
                                  </div>
                                )}
                                {s.fitDescription && (
                                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                                    ℹ️ {s.fitDescription}
                                  </div>
                                )}
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Insurance: {s.insuranceExpiry} | Permit: {s.permitExpiry}</div>
                              </div>
                              {/* Driver */}
                              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <MdPerson size={20} color="#2563eb" />
                                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>DRIVER</span>
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{s.driverName}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{s.driverPhone}</div>
                                <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>Status: Available ✅</div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>DL: {s.driverLicense} | Valid till: {s.licenseExpiry}</div>
                              </div>
                            </div>

                            {/* Cost Breakdown & Profit Summary */}
                            <div style={{
                              background: '#f8fafc',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                                <div style={{ background: '#fef9c3', padding: '8px 4px', borderRadius: '6px', border: '1px solid #fde047' }}>
                                  <div style={{ fontSize: '10px', color: '#a16207', fontWeight: '700' }}>⛽ FUEL</div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#713f12', marginTop: '2px' }}>
                                    ₹{(s.estimatedFuel || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>
                                <div style={{ background: '#e0f2fe', padding: '8px 4px', borderRadius: '6px', border: '1px solid #7dd3fc' }}>
                                  <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '700' }}>TOLL</div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#075985', marginTop: '2px' }}>
                                    ₹{(s.estimatedToll || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>
                                <div style={{ background: '#f3e8ff', padding: '8px 4px', borderRadius: '6px', border: '1px solid #d8b4fe' }}>
                                  <div style={{ fontSize: '10px', color: '#7e22ce', fontWeight: '700' }}>👨‍✈️ DRIVER</div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#581c87', marginTop: '2px' }}>
                                    ₹{(s.driverCost || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>
                                <div style={{ background: '#fee2e2', padding: '8px 4px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                                  <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: '700' }}>📊 TOTAL EXP</div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', marginTop: '2px' }}>
                                    ₹{(s.totalExpenses || (s.estimatedFuel + (s.estimatedToll || 0) + (s.driverCost || 0))).toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>

                              <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: (s.expectedProfit || 0) >= 0 ? '#dcfce7' : '#fee2e2',
                                borderRadius: '8px', padding: '10px 14px',
                                border: `1px solid ${(s.expectedProfit || 0) >= 0 ? '#86efac' : '#fca5a5'}`
                              }}>
                                <div style={{ fontSize: '12px', color: '#475569' }}>
                                  💰 Freight: <strong style={{ color: '#0f172a' }}>₹{(s.freightAmount || 0).toLocaleString('en-IN')}</strong> 
                                  {s.distanceKm ? ` (${s.distanceKm} km)` : ''}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '15px', fontWeight: '800', color: (s.expectedProfit || 0) >= 0 ? '#15803d' : '#b91c1c' }}>
                                    {(s.expectedProfit || 0) >= 0 
                                      ? `+₹${(s.expectedProfit || 0).toLocaleString('en-IN')} Profit` 
                                      : `-₹${Math.abs(s.expectedProfit || 0).toLocaleString('en-IN')} Loss`}
                                  </div>
                                  {s.profitMarginPct !== undefined && (
                                    <div style={{ fontSize: '11px', color: (s.expectedProfit >= 0 ? (s.profitMarginPct >= 15 ? '#15803d' : '#a16207') : '#b91c1c'), fontWeight: '600' }}>
                                      {s.expectedProfit >= 0 ? `${s.profitMarginPct}% Margin` : `${Math.abs(s.profitMarginPct)}% Loss Margin (Low Freight)`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reason */}
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', lineHeight: '1.5' }}>
                              {s.reason}
                            </div>

                            {/* Accept Button */}
                            <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => handleAccept(s)}
                                style={{
                                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                  padding: '12px', borderRadius: '8px', border: 'none',
                                  background: '#16a34a',
                                  color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                                }}
                              >
                                <MdCheckCircle size={20} /> Accept & Create Trip
                              </button>
                              <button
                                onClick={() => setShowSuggModal(false)}
                                style={{
                                  padding: '12px 20px', borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc', color: '#475569',
                                  cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                }}
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
