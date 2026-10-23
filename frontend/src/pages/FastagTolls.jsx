import React, { useState, useEffect } from 'react';
import { MdLocalShipping, MdAttachMoney, MdAdd, MdRefresh, MdCheckCircle, MdMap } from 'react-icons/md';
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

  useEffect(() => {
    loadData();
    fetchVehicles();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedRes, summaryRes] = await Promise.all([
        fetch('/api/fastag/feed').then(res => res.json()).catch(() => []),
        fetch('/api/fastag/summary').then(res => res.json()).catch(() => ({ totalTollSpent: 0, totalTransactions: 0, linkedTripsCount: 0 }))
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
      const res = await fetch('/api/v1/fleet/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, vehicleNumber: data[0].registrationNumber }));
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber: formData.vehicleNumber,
          plazaName: formData.plazaName,
          amount: parseFloat(formData.amount)
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`FASTag Toll Recorded! ${data.attachedToTrip !== 'None' ? `Auto-attached to Trip: ${data.attachedToTrip}` : ''}`);
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3>Simulate FASTag Toll Deduction</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Simulate real-time FASTag RFID toll plaza scan for any vehicle.
            </p>
            <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Select Vehicle</label>
                <select 
                  className="filter-select"
                  style={{ width: '100%' }}
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.registrationNumber}>
                      {v.registrationNumber} ({v.name || 'Vehicle'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Toll Plaza Name</label>
                <input 
                  type="text"
                  className="filter-select"
                  style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  placeholder="e.g. Pune-Mumbai Expressway Toll"
                  value={formData.plazaName}
                  onChange={e => setFormData({ ...formData, plazaName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Toll Amount (₹)</label>
                <input 
                  type="number"
                  className="filter-select"
                  style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' }}
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #0984e3' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>TOTAL FASTAG SPENT</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#38bdf8' }}>₹{summary.totalTollSpent ? summary.totalTollSpent.toLocaleString('en-IN') : '0'}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Lifetime toll deductions</span>
        </div>

        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #00b894' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>TOTAL TRANSACTIONS</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2ed573' }}>{summary.totalTransactions || 0}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Toll plaza events recorded</span>
        </div>

        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #fdcb6e' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>LINKED ACTIVE TRIPS</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffa502' }}>{summary.linkedTripsCount || 0}</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Toll auto-attached to trips</span>
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
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
                      <span className="vehicle-num">{item.vehicleNumber}</span>
                      <span className="vehicle-name">{item.vehicleName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{item.title}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#ff4757' }}>
                      - ₹{item.amount ? item.amount.toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td>
                    {item.tripNumber !== 'N/A' ? (
                      <span style={{
                        backgroundColor: 'rgba(9,132,227,0.15)',
                        color: '#38bdf8',
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
                      <span style={{ color: '#64748b', fontSize: '11px' }}>Unassigned</span>
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
