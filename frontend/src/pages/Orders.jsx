import React, { useState, useEffect } from 'react';
import { 
  MdAdd, MdSearch, MdAutoAwesome, MdClose, MdCheckCircle, MdWarning, 
  MdLocalShipping, MdPerson, MdArrowBack, MdCalendarToday, MdScale, 
  MdAttachMoney, MdDirectionsCar, MdTrendingUp, MdGpsFixed
} from 'react-icons/md';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import CitySearchInput from '../components/CitySearchInput';
import { capitalizeWords, sanitizeNameInput } from '../utils/validationUtils';
import './Vehicles.css';
import './NewTrip.css';
import './Orders.css';

const Orders = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View mode: 'list' | 'create' | 'suggestion'
  const [activeView, setActiveView] = useState('list');

  // Dispatch Suggestion state
  const [suggestion, setSuggestion] = useState(null);
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggOrderId, setSuggOrderId] = useState(null);

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
        setActiveView('list');
        setNewOrder({ customerName: '', cargoDetails: '', pickupLocation: '', dropLocation: '', weight: '', amount: '', expectedDate: '' });
        fetchOrders();
      } else { showAlert("Failed to create order."); }
    } catch (err) { showAlert("Error creating order."); }
  };

  // ── Dispatch Suggestion ──────────────────────────────────
  const handleGetSuggestion = async (orderId) => {
    setSuggOrderId(orderId);
    setSuggLoading(true);
    setActiveView('suggestion');
    setSuggestion(null);
    try {
      const res = await fetch(`/api/v1/dispatch/suggest?orderId=${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        setSuggestion({ error: data?.error || 'Could not load suggestions. Please try again.' });
      } else {
        setSuggestion(data);
      }
    } catch (err) {
      setSuggestion({ error: 'Could not load suggestions. Please try again.' });
    }
    setSuggLoading(false);
  };

  const handleAccept = async (s) => {
    const order = orders.find(o => o.id === suggOrderId);
    if (!order) return;

    const freightVal = parseFloat(suggestion?.orderInfo?.freight?.replace(/[^0-9]/g, '')) || parseFloat(order.amount?.replace(/[^0-9]/g, '')) || s.freightAmount || 0;
    const cleanWeight = parseFloat(order.weight?.replace(/[^0-9.]/g, '')) || 10;

    const tripPayload = {
      tripNumber: null,
      order: { id: order.id },
      vehicle: { id: parseInt(s.vehicleId) },
      driver: { id: parseInt(s.driverId) },
      route: s.route || `${capitalizeWords(order.pickupLocation) || 'Origin'} → ${capitalizeWords(order.dropLocation) || 'Destination'}`,
      startDate: order.expectedDate || new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      freightAmount: freightVal,
      expectedRevenue: freightVal,
      expectedMargin: s.expectedProfit || 0,
      reconciledCosts: s.totalExpenses || (freightVal - (s.expectedProfit || 0)),
      goodsType: capitalizeWords(order.cargoDetails) || 'General Goods',
      clientName: capitalizeWords(order.customerName),
      dispatchDate: order.expectedDate || new Date().toISOString().split('T')[0],
      pickupAddress: capitalizeWords(order.pickupLocation) || '',
      deliveryAddress: capitalizeWords(order.dropLocation) || '',
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
        setActiveView('list');
        navigate('/trips');
      } else {
        showAlert("Failed to create trip from order.");
      }
    } catch (e) {
      console.error(e);
      showAlert("Error creating trip: " + e.message);
    }
  };

  // Only show unassigned / PENDING incoming orders in the table
  const filteredOrders = orders
    .filter(o => !o.status || o.status.toUpperCase() === 'PENDING')
    .filter(o =>
      String(o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.cargoDetails || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="vehicles-container">
      {activeView === 'list' && (
        <>
          <div className="page-header">
            <div className="header-text">
              <h2>Customer Orders</h2>
              <p>Manage incoming orders and booking requests from customers</p>
            </div>
            <button className="primary-btn" onClick={() => setActiveView('create')}>
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
      </>
    )}

      {/* ── CREATE ORDER FULL PAGE VIEW (NEW TRIP STYLE) ── */}
      {activeView === 'create' && (
        <div style={{ width: '100%', marginTop: '0' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdAdd size={22} color="#2563eb" /> Create New Order
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Enter client booking details and dispatch specifications
                </p>
              </div>
            </div>

            <div className="new-trip-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Customer & Cargo Details Card */}
              <div className="trip-card" style={{ margin: 0 }}>
                <h2><MdPerson /> Customer & Consignment</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div className="form-group">
                    <label>Customer (Billed To) *</label>
                    <input 
                      type="text" 
                      placeholder="" 
                      value={newOrder.customerName} 
                      onChange={e => setNewOrder({...newOrder, customerName: sanitizeNameInput(e.target.value)})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Cargo / Goods Description</label>
                    <input 
                      type="text" 
                      placeholder="" 
                      value={newOrder.cargoDetails} 
                      onChange={e => setNewOrder({...newOrder, cargoDetails: capitalizeWords(e.target.value)})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Weight / Quantity</label>
                    <input 
                      type="text" 
                      placeholder="" 
                      value={newOrder.weight} 
                      onChange={e => setNewOrder({...newOrder, weight: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Route & Billing Card */}
              <div className="trip-card" style={{ margin: 0 }}>
                <h2><MdDirectionsCar /> Route & Financials</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div className="form-group">
                    <label>Pickup Location (Origin)</label>
                    <div style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--input-radius)',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <CitySearchInput 
                        placeholder="" 
                        value={newOrder.pickupLocation} 
                        onChange={val => setNewOrder({...newOrder, pickupLocation: capitalizeWords(val)})} 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Drop Location (Destination)</label>
                    <div style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--input-radius)',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <CitySearchInput 
                        placeholder="" 
                        value={newOrder.dropLocation} 
                        onChange={val => setNewOrder({...newOrder, dropLocation: capitalizeWords(val)})} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Agreed Freight Rate (₹)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={newOrder.amount} 
                        onChange={e => setNewOrder({...newOrder, amount: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Expected Dispatch Date *</label>
                      <input 
                        type="date" 
                        value={newOrder.expectedDate} 
                        onChange={e => setNewOrder({...newOrder, expectedDate: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setActiveView('list')}
                style={{ padding: '0 24px', height: '42px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="primary-btn" 
                onClick={handleCreateOrder}
                style={{ padding: '0 32px', height: '42px', fontWeight: '700' }}
              >
                Submit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISPATCH SUGGESTION FULL PAGE VIEW (NEW TRIP STYLE) ── */}
      {activeView === 'suggestion' && (
        <div style={{ width: '100%', marginTop: '0' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MdAutoAwesome size={22} color="#0984e3" /> Dispatch Suggestion
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Rule-based matching — You confirm before anything is saved
                </p>
              </div>
            </div>

            {suggLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#0984e3' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚙️</div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Checking vehicles, drivers & documents...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Matching available fleet capacity with order tonnage</p>
              </div>
            )}

            {!suggLoading && suggestion?.error && (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px 20px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <MdWarning size={40} />
                <h3 style={{ marginTop: '12px' }}>{suggestion.error}</h3>
                <button 
                  onClick={() => setActiveView('list')} 
                  className="btn-secondary" 
                  style={{ marginTop: '16px' }}
                >
                  Back to Orders
                </button>
              </div>
            )}

            {!suggLoading && suggestion && !suggestion.error && (
              <>
                {/* Order Summary Banner */}
                <div style={{
                  background: 'var(--bg-surface, #f8fafc)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '18px 24px',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Order Dispatch Specifications
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{suggestion.orderInfo?.customer}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Route</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{suggestion.orderInfo?.route}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Weight</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{suggestion.orderInfo?.weight}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Agreed Freight</span>
                      <div style={{ color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>{suggestion.orderInfo?.freight}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Dispatch Date</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{suggestion.orderInfo?.date}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Fleet Inspected</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginTop: '2px' }}>{suggestion.totalVehiclesChecked} Trucks, {suggestion.totalDriversChecked} Drivers</div>
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                {(suggestion.suggestions || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <MdWarning size={48} color="#f59e0b" />
                    <h3 style={{ marginTop: '12px', color: 'var(--text-primary)' }}>No suitable combination found</h3>
                    <p>Possible reasons: all trucks busy on trips, fitness/insurance expiring, or no available drivers.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(suggestion.suggestions || []).map((s, idx) => (
                      <div key={idx} style={{
                        border: idx === 0 ? '2px solid #2563eb' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: 'var(--bg-secondary)',
                        boxShadow: 'var(--card-shadow)'
                      }}>
                        {idx === 0 && (
                          <div style={{ 
                            background: (s.expectedProfit || 0) >= 0 ? '#10b981' : '#2563eb', 
                            padding: '8px 20px', 
                            fontSize: '12px', 
                            fontWeight: '700', 
                            color: '#fff', 
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>{(s.expectedProfit || 0) >= 0 ? '★ HIGHEST PROFIT CHOICE' : '★ BEST MATCH'}</span>
                            <span style={{ fontSize: '11px', opacity: 0.95 }}>RECOMMENDATION #1</span>
                          </div>
                        )}
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                            {/* Vehicle Card */}
                            <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <MdLocalShipping size={22} color="#2563eb" />
                                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>TRUCK</span>
                              </div>
                              <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{s.vehicleReg}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.vehicleName}</div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                                <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>Capacity: {s.vehicleCapacity}</span>
                                {s.fitBadge && (
                                  <span style={{
                                    fontSize: '11px',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
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
                                <div style={{ marginTop: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                    <span>Load Utilization</span>
                                    <strong style={{ color: 'var(--text-primary)' }}>{s.utilizationPct}%</strong>
                                  </div>
                                  <div style={{ width: '100%', height: '6px', background: 'var(--border-color, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                      width: `${Math.min(100, s.utilizationPct)}%`,
                                      height: '100%',
                                      background: s.utilizationPct >= 70 ? '#16a34a' : (s.utilizationPct >= 40 ? '#0284c7' : '#eab308')
                                    }} />
                                  </div>
                                </div>
                              )}
                              {s.fitDescription && (
                                <div style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '8px', fontStyle: 'italic', background: 'var(--bg-secondary, #f8fafc)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                  ℹ️ {s.fitDescription}
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>Insurance: {s.insuranceExpiry} | Permit: {s.permitExpiry}</div>
                            </div>

                            {/* Driver Card */}
                            <div style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <MdPerson size={22} color="#2563eb" />
                                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>DRIVER</span>
                              </div>
                              <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{s.driverName}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.driverPhone}</div>
                              <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '6px', fontWeight: '600' }}>Status: Available ✅</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>DL: {s.driverLicense} | Valid till: {s.licenseExpiry}</div>
                            </div>
                          </div>

                          {/* Financials & Profit Breakdown */}
                          <div style={{
                            background: 'var(--bg-surface, #f8fafc)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            padding: '14px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                              <div style={{ background: '#fef9c3', padding: '10px 6px', borderRadius: '8px', border: '1px solid #fde047' }}>
                                <div style={{ fontSize: '11px', color: '#a16207', fontWeight: '700' }}>⛽ FUEL</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#713f12', marginTop: '2px' }}>
                                  ₹{(s.estimatedFuel || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div style={{ background: '#e0f2fe', padding: '10px 6px', borderRadius: '8px', border: '1px solid #7dd3fc' }}>
                                <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '700' }}>TOLL</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#075985', marginTop: '2px' }}>
                                  ₹{(s.estimatedToll || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div style={{ background: '#f3e8ff', padding: '10px 6px', borderRadius: '8px', border: '1px solid #d8b4fe' }}>
                                <div style={{ fontSize: '11px', color: '#7e22ce', fontWeight: '700' }}>👨‍✈️ DRIVER</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#581c87', marginTop: '2px' }}>
                                  ₹{(s.driverCost || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div style={{ background: '#fee2e2', padding: '10px 6px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                                <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700' }}>📊 TOTAL EXP</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b', marginTop: '2px' }}>
                                  ₹{(s.totalExpenses || (s.estimatedFuel + (s.estimatedToll || 0) + (s.driverCost || 0))).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>

                            <div style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              background: (s.expectedProfit || 0) >= 0 ? '#dcfce7' : '#fee2e2',
                              borderRadius: '8px', padding: '12px 18px',
                              border: `1px solid ${(s.expectedProfit || 0) >= 0 ? '#86efac' : '#fca5a5'}`
                            }}>
                              <div style={{ fontSize: '13px', color: '#475569' }}>
                                Freight: <strong style={{ color: '#0f172a' }}>₹{(s.freightAmount || 0).toLocaleString('en-IN')}</strong> 
                                {s.distanceKm ? ` (${s.distanceKm} km)` : ''}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: (s.expectedProfit || 0) >= 0 ? '#15803d' : '#b91c1c' }}>
                                  {(s.expectedProfit || 0) >= 0 
                                    ? `+₹${(s.expectedProfit || 0).toLocaleString('en-IN')} Expected Profit` 
                                    : `-₹${Math.abs(s.expectedProfit || 0).toLocaleString('en-IN')} Expected Loss`}
                                </div>
                                {s.profitMarginPct !== undefined && (
                                  <div style={{ fontSize: '12px', color: (s.expectedProfit >= 0 ? (s.profitMarginPct >= 15 ? '#15803d' : '#a16207') : '#b91c1c'), fontWeight: '600' }}>
                                    {s.expectedProfit >= 0 ? `${s.profitMarginPct}% Margin` : `${Math.abs(s.profitMarginPct)}% Loss Margin (Low Freight)`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reason */}
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.5' }}>
                            {s.reason}
                          </div>

                          {/* Actions */}
                          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
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
                              onClick={() => setActiveView('list')}
                              style={{
                                padding: '12px 24px', borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-surface, #f8fafc)', color: 'var(--text-secondary)',
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
      )}
    </div>
  );
};

export default Orders;
