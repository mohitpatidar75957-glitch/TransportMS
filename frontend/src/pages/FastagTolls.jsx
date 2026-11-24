import React, { useState, useEffect } from 'react';
import { MdLocalShipping, MdToll, MdReceipt, MdAdd, MdRefresh, MdCheckCircle, MdMap, MdClose } from 'react-icons/md';
import { useModal } from '../context/ModalContext';
import './Vehicles.css';

const FastagTolls = () => {
  const { showAlert } = useModal();
  const [feed, setFeed] = useState([]);
  const [summary, setSummary] = useState({ totalTollSpent: 0, totalTransactions: 0, linkedTripsCount: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for FASTag Simulation
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    plazaName: 'Kherwadi Toll Plaza',
    amount: '160'
  });
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const compId = localStorage.getItem('activeCompanyId');
    if (compId) {
      headers['X-Company-Id'] = compId;
      headers['X-Tenant-Id'] = compId;
    }
    return headers;
  };

  useEffect(() => {
    loadData();
    fetchVehicles();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [feedRes, summaryRes] = await Promise.all([
        fetch('/api/fastag/feed', { headers }).then(res => res.ok ? res.json() : []).catch(() => []),
        fetch('/api/fastag/summary', { headers }).then(res => res.ok ? res.json() : ({ totalTollSpent: 0, totalTransactions: 0, linkedTripsCount: 0 })).catch(() => ({ totalTollSpent: 0, totalTransactions: 0, linkedTripsCount: 0 }))
      ]);

      setFeed(Array.isArray(feedRes) ? feedRes : []);
      setSummary(summaryRes || { totalTollSpent: 0, totalTransactions: 0, linkedTripsCount: 0 });
    } catch (e) {
      console.error('Failed to load FASTag data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/v1/fleet/vehicles', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            vehicleNumber: prev.vehicleNumber || data[0].registrationNumber || ''
          }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch vehicles', e);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.amount) {
      showAlert('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fastag/webhook', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vehicleNumber: formData.vehicleNumber,
          plazaName: formData.plazaName,
          amount: parseFloat(formData.amount)
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`FASTag Toll Recorded! ${data.attachedToTrip && data.attachedToTrip !== 'None' ? `Auto-attached to Trip: ${data.attachedToTrip}` : ''}`);
        setShowModal(false);
        loadData();
      } else {
        showAlert(data.error || 'Failed to process FASTag transaction');
      }
    } catch (err) {
      showAlert('Error connecting to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vehicles-container">
      {/* Simulation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '500px', 
              backgroundColor: 'var(--bg-surface, #ffffff)', 
              color: 'var(--text-primary, #0f172a)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color, #e2e8f0)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary, #0f172a)' }}>
                Simulate FASTag Toll Deduction
              </h3>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #64748b)', padding: '4px' }}
              >
                <MdClose size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginBottom: '18px' }}>
              Simulate real-time FASTag RFID toll plaza scan for any vehicle.
            </p>
            <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary, #1e293b)', marginBottom: '6px' }}>
                  Select Vehicle
                </label>
                <select 
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                >
                  {vehicles.length === 0 && <option value="">No vehicles found</option>}
                  {vehicles.map(v => (
                    <option key={v.id || v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} {v.name ? `(${v.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary, #1e293b)', marginBottom: '6px' }}>
                  Toll Plaza Name
                </label>
                <input 
                  type="text"
                  list="toll-plaza-suggestions"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. Pune-Mumbai Expressway Toll"
                  value={formData.plazaName}
                  onChange={e => setFormData({ ...formData, plazaName: e.target.value })}
                  required
                />
                <datalist id="toll-plaza-suggestions">
                  <option value="Kherwadi Toll Plaza" />
                  <option value="Pune-Mumbai Expressway Toll" />
                  <option value="Vashi Toll Naka" />
                  <option value="Khalapur Toll Plaza" />
                  <option value="Delhi-Gurgaon Expressway Toll" />
                  <option value="Hosur Road Electronic City Toll" />
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary, #1e293b)', marginBottom: '6px' }}>
                  Toll Amount (₹)
                </label>
                <input 
                  type="number"
                  min="1"
                  step="any"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="160"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Record FASTag Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <h2>FASTag & Toll Feed API</h2>
          <p>Automated FASTag toll deductions & trip cost integration</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="reset-btn" onClick={loadData} title="Refresh Feed">
            <MdRefresh size={20} />
          </button>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            <MdAdd size={20} />
            Simulate Toll Deduction
          </button>
        </div>
      </div>

      {/* Stats Cards with Windows 11 High-Visibility Icons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Total FASTag Spent */}
        <div className="panel" style={{ 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          borderLeft: '4px solid #0284c7',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(2, 132, 199, 0.12)', 
            color: '#0284c7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MdToll size={28} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: '700', letterSpacing: '0.5px' }}>
              TOTAL FASTAG SPENT
            </span>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0284c7', lineHeight: 1.2 }}>
              ₹{summary.totalTollSpent ? summary.totalTollSpent.toLocaleString('en-IN') : '0'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>Lifetime toll deductions</span>
          </div>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="panel" style={{ 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          borderLeft: '4px solid #10b981',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(16, 185, 129, 0.12)', 
            color: '#10b981', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MdReceipt size={28} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: '700', letterSpacing: '0.5px' }}>
              TOTAL TRANSACTIONS
            </span>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#10b981', lineHeight: 1.2 }}>
              {summary.totalTransactions || 0}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>Toll plaza events recorded</span>
          </div>
        </div>

        {/* Card 3: Linked Active Trips */}
        <div className="panel" style={{ 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          borderLeft: '4px solid #f59e0b',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(245, 158, 11, 0.12)', 
            color: '#f59e0b', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MdLocalShipping size={28} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: '700', letterSpacing: '0.5px' }}>
              LINKED ACTIVE TRIPS
            </span>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#f59e0b', lineHeight: 1.2 }}>
              {summary.linkedTripsCount || 0}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>Toll auto-attached to trips</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container panel">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '700' }}>
          Live FASTag Toll Feed
        </h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>DATE</th>
              <th>VEHICLE</th>
              <th>TOLL PLAZA / EVENT</th>
              <th>AMOUNT</th>
              <th>LINKED TRIP</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading FASTag feed...</td>
              </tr>
            ) : feed.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary, #94a3b8)' }}>
                  No FASTag toll transactions recorded yet. Click "Simulate Toll Deduction" to test.
                </td>
              </tr>
            ) : (
              feed.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.date}</td>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num" style={{ fontWeight: '600' }}>{item.vehicleNumber}</span>
                      <span className="vehicle-name">{item.vehicleName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary, #0f172a)' }}>{item.title}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#ef4444' }}>
                      - ₹{item.amount ? item.amount.toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td>
                    {item.tripNumber && item.tripNumber !== 'N/A' ? (
                      <span style={{
                        backgroundColor: 'rgba(9,132,227,0.15)',
                        color: '#0284c7',
                        border: '1px solid rgba(9,132,227,0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <MdMap size={12} /> {item.tripNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '11px' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MdCheckCircle size={12} /> Auto-Processed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FastagTolls;
