import React, { useState, useEffect } from 'react';
import './Vehicles.css';

const FuelReport = () => {
  const [fuels, setFuels] = useState([]);
  const [totalLiters, setTotalLiters] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [filterFlaggedOnly, setFilterFlaggedOnly] = useState(false);

  useEffect(() => {
    fetch('/api/v1/resources/fuel')
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setFuels(arr);
        const l = arr.reduce((acc, curr) => acc + (parseFloat(curr.liters || curr.quantity || 0)), 0);
        const s = arr.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount || curr.totalCost || 0)), 0);
        setTotalLiters(l);
        setTotalSpend(s);
      })
      .catch(err => console.error(err));
  }, []);

  const flaggedCount = fuels.filter(f => f.isFlagged).length;
  const displayedFuels = filterFlaggedOnly ? fuels.filter(f => f.isFlagged) : fuels;

  return (
    <div className="vehicles-container">
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Fuel Usage & Theft Anomaly Report</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Detailed mileage and fuel excess warning logs</p>
          </div>

          <button 
            onClick={() => setFilterFlaggedOnly(!filterFlaggedOnly)}
            style={{
              backgroundColor: filterFlaggedOnly ? '#ff4757' : 'rgba(255, 71, 87, 0.15)',
              color: filterFlaggedOnly ? '#fff' : '#ff4757',
              border: '1px solid #ff4757',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚨 {filterFlaggedOnly ? 'Show All Fuel Logs' : `Show Red Flag Spikes Only (${flaggedCount})`}
          </button>
        </div>
        
        {/* Summary Cards */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Total Diesel Filled</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalLiters.toFixed(2)} L</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Total Fuel Expense</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>₹{totalSpend.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(255, 71, 87, 0.08)', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#ff4757', marginBottom: '6px', fontWeight: 600 }}>Red Flagged Anomalies</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4757' }}>{flaggedCount}</div>
          </div>
        </div>

        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>DATE</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>VEHICLE / DRIVER</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>ODOMETER</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>LITERS</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>TOTAL (₹)</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>AUDIT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {displayedFuels.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {filterFlaggedOnly ? '🎉 No fuel consumption anomalies found!' : 'No fuel records found.'}
                </td>
              </tr>
            ) : (
              displayedFuels.map((fuel, index) => {
                const litersVal = fuel.liters || fuel.quantity || 0;
                const costVal = fuel.totalAmount || fuel.totalCost || 0;
                return (
                  <tr key={fuel.id || index} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: fuel.isFlagged ? 'rgba(255, 71, 87, 0.05)' : (index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)') }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '13px' }}>{fuel.date || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fuel.vehicle ? fuel.vehicle.registrationNumber : 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{fuel.driver ? fuel.driver.name : 'Unknown Driver'}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>{fuel.odometerReading ? `${fuel.odometerReading} KM` : '—'}</td>
                    <td style={{ padding: '16px 24px', color: fuel.isFlagged ? '#ff4757' : 'var(--text-primary)', fontSize: '13px', fontWeight: 'bold' }}>{litersVal} L</td>
                    <td style={{ padding: '16px 24px', color: fuel.isFlagged ? '#ff4757' : 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>₹{Number(costVal).toLocaleString()}</td>
                    <td style={{ padding: '16px 24px', fontSize: '12px' }}>
                      {fuel.isFlagged ? (
                        <span 
                          title={fuel.flagReason}
                          style={{ backgroundColor: '#ff4757', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'help' }}
                        >
                          🚨 EXCESS FUEL SPIKE
                        </span>
                      ) : (
                        <span style={{ color: '#2ed573', fontWeight: 500 }}>
                          ✅ Normal Mileage
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelReport;
