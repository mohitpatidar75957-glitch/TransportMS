import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdAddCircle, MdLocalShipping, MdPerson, MdWarning, MdCheckCircle } from 'react-icons/md';
import CustomerDashboard from './CustomerDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { roleKey } = useAuth();
  const navigate = useNavigate();
  
  if (roleKey === 'CUSTOMER') {
    return <CustomerDashboard />;
  }

  const [recentUsers, setRecentUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_recentUsers')) || []; } catch { return []; }
  });
  const [vehicles, setVehicles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_vehicles')) || []; } catch { return []; }
  });
  const [activeDrivers, setActiveDrivers] = useState(() => {
    try { return Number(localStorage.getItem('cached_activeDrivers')) || 0; } catch { return 0; }
  });
  const [totalProfit, setTotalProfit] = useState(() => {
    try { return Number(localStorage.getItem('cached_totalProfit')) || 0; } catch { return 0; }
  });
  const [chartData, setChartData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_chartData')) || []; } catch { return []; }
  });
  const [maxProfit, setMaxProfit] = useState(() => {
    try { return Number(localStorage.getItem('cached_maxProfit')) || 1000; } catch { return 1000; }
  });
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_alerts')) || []; } catch { return []; }
  });
  const [tripsCount, setTripsCount] = useState(() => {
    try { return Number(localStorage.getItem('cached_tripsCount')) || 0; } catch { return 0; }
  });
  const [activeTripsCount, setActiveTripsCount] = useState(() => {
    try { return Number(localStorage.getItem('cached_activeTripsCount')) || 0; } catch { return 0; }
  });

  const isManager = roleKey === 'MANAGER';

  if (roleKey === 'DRIVER' || roleKey === 'DISPATCHER') {
    return <Navigate to="/trips" replace />;
  }

  useEffect(() => {
    // 1. Fetch Active Drivers - Updates immediately
    fetch('/api/v1/fleet/drivers')
      .then(res => res.json())
      .then(data => {
        const availableDrivers = (Array.isArray(data) ? data : []).filter(d => (d.status || 'Available').toLowerCase() === 'available');
        setActiveDrivers(availableDrivers.length);
        localStorage.setItem('cached_activeDrivers', availableDrivers.length);
      })
      .catch(() => {});

    // 2. Fetch Users - Updates immediately
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        const sorted = (Array.isArray(data) ? data : [])
          .filter(u => u.role === 'DRIVER')
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setRecentUsers(sorted);
        localStorage.setItem('cached_recentUsers', JSON.stringify(sorted));
      })
      .catch(() => {});

    // 3. Fetch Vehicles - Updates immediately
    fetch('/api/v1/fleet/vehicles')
      .then(res => res.json())
      .then(data => {
        const vList = Array.isArray(data) ? data : [];
        setVehicles(vList);
        localStorage.setItem('cached_vehicles', JSON.stringify(vList));
      })
      .catch(() => {});

    // 4. Fetch Trips - Updates immediately
    fetch('/api/v1/fleet/trips')
      .then(res => res.json())
      .then(data => {
        const trips = Array.isArray(data) ? data : [];
        setTripsCount(trips.length);
        localStorage.setItem('cached_tripsCount', trips.length);

        const activeCount = trips.filter(t => (t.status || '').toLowerCase() === 'in transit' || (t.status || '').toLowerCase() === 'active').length;
        setActiveTripsCount(activeCount);
        localStorage.setItem('cached_activeTripsCount', activeCount);

        // Total Profit
        const total = trips.reduce((sum, trip) => sum + (trip.freightAmount || 0), 0);
        setTotalProfit(total);
        localStorage.setItem('cached_totalProfit', total);

        // Chart Data (Last 6 Months) - Calculated dynamically from real trip records
        const today = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let last6Months = [];
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          last6Months.push({
            monthIndex: d.getMonth(),
            year: d.getFullYear(),
            label: monthNames[d.getMonth()],
            profit: 0,
            tripCount: 0
          });
        }

        trips.forEach(trip => {
          const dateStr = trip.startDate || trip.dispatchDate || trip.createdAt;
          if (dateStr && trip.freightAmount) {
            const tripDate = new Date(dateStr);
            const dataPoint = last6Months.find(m => m.monthIndex === tripDate.getMonth() && m.year === tripDate.getFullYear());
            if (dataPoint) {
              dataPoint.profit += Number(trip.freightAmount) || 0;
              dataPoint.tripCount += 1;
            }
          }
        });

        const rawMax = Math.max(...last6Months.map(m => m.profit), 0);
        // Clean round financial ceiling for Y-axis (avoids weird unrounded ticks)
        let cleanMax = 100000;
        if (rawMax > 500000) cleanMax = Math.ceil(rawMax / 100000) * 100000;
        else if (rawMax > 250000) cleanMax = 500000;
        else if (rawMax > 200000) cleanMax = 250000;
        else if (rawMax > 100000) cleanMax = 200000;
        else if (rawMax > 50000) cleanMax = 100000;
        else cleanMax = 50000;

        setMaxProfit(cleanMax);
        setChartData(last6Months);
        localStorage.setItem('cached_maxProfit', cleanMax);
        localStorage.setItem('cached_chartData', JSON.stringify(last6Months));
      })
      .catch(() => {});

    // 5. Fetch Alerts - Updates immediately
    fetch('/api/notifications/centralized')
      .then(res => res.json())
      .then(data => {
        const aList = Array.isArray(data?.alerts) ? data.alerts : (Array.isArray(data) ? data : []);
        setAlerts(aList);
        localStorage.setItem('cached_alerts', JSON.stringify(aList));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>{isManager ? 'Operations overview and fleet metrics' : 'System overview and statistics'}</p>
      </div>

      <div className="stats-grid">
        {!isManager && (
          <>
            <div className="stat-card blue">
              <h3>Total Admins</h3>
              <div className="stat-value">1</div>
              <p>System administrators</p>
            </div>
            
            <div className="stat-card dark">
              <h3>Total Freight Profit</h3>
              <div className="stat-value">₹{totalProfit.toLocaleString('en-IN')}</div>
              <p>Total profit from trips</p>
            </div>
          </>
        )}

        <div className="stat-card green">
          <h3>Active Vehicles</h3>
          <div className="stat-value">{vehicles.length}</div>
          <p>Currently registered</p>
        </div>
        
        <div className="stat-card cyan">
          <h3>Active Drivers</h3>
          <div className="stat-value">{activeDrivers}</div>
          <p>Available for trips</p>
        </div>

        {isManager && (
          <>
            <div className="stat-card blue">
              <h3>Total Trips</h3>
              <div className="stat-value">{tripsCount}</div>
              <p>{activeTripsCount} in transit</p>
            </div>

            <div className="stat-card orange" style={{ backgroundColor: '#e67e22', color: '#fff' }}>
              <h3>Document Alerts</h3>
              <div className="stat-value">{alerts.length}</div>
              <p>Require attention</p>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-content">
        {!isManager ? (
          <div className="chart-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Freight Revenue & Profit (Last 6 Months)</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Real-time revenue computed from actual trips logged in fleet database</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                  color: '#10b981', 
                  border: '1px solid rgba(16, 185, 129, 0.25)', 
                  padding: '4px 10px', 
                  borderRadius: '16px', 
                  fontSize: '12px', 
                  fontWeight: '600' 
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  Live Fleet Trips Data ({tripsCount} Total Trips)
                </span>
              </div>
            </div>

            <div className="chart-container">
              <div className="bar-chart" style={{ paddingBottom: '20px' }}>
                <div className="y-axis" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '12px', color: '#334155', fontSize: '12px', fontWeight: '700' }}>
                  <span>₹{(maxProfit).toLocaleString('en-IN')}</span>
                  <span>₹{(maxProfit * 0.75).toLocaleString('en-IN')}</span>
                  <span>₹{(maxProfit * 0.5).toLocaleString('en-IN')}</span>
                  <span>₹{(maxProfit * 0.25).toLocaleString('en-IN')}</span>
                  <span>₹0</span>
                </div>
                <div className="chart-bars-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: '20px', height: '100%' }}>
                  <div className="bars" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', borderLeft: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
                    {chartData.map((dataPoint, idx) => {
                      const heightPercent = maxProfit > 0 ? (dataPoint.profit / maxProfit) * 100 : 0;
                      const hasRevenue = dataPoint.profit > 0;
                      return (
                        <div key={idx} style={{ width: '13%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                          {hasRevenue && (
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '700', 
                              color: '#0369a1', 
                              backgroundColor: '#e0f2fe',
                              border: '1px solid #7dd3fc',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              marginBottom: '6px',
                              letterSpacing: '0.2px' 
                            }}>
                              ₹{(dataPoint.profit >= 100000 ? (dataPoint.profit / 100000).toFixed(1) + 'L' : (dataPoint.profit / 1000).toFixed(0) + 'k')}
                            </span>
                          )}
                          <div 
                            className="chart-bar-hover-wrap" 
                            style={{ 
                              height: `${Math.max(heightPercent, hasRevenue ? 6 : 2)}%`, 
                              width: '100%', 
                              background: hasRevenue 
                                ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' 
                                : 'rgba(255, 255, 255, 0.04)', 
                              border: hasRevenue ? '1px solid #38bdf8' : '1px dashed rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px 6px 0 0', 
                              position: 'relative', 
                              transition: 'all 0.25s ease', 
                              flex: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="instant-bar-tooltip">
                              {dataPoint.label}: ₹{dataPoint.profit.toLocaleString('en-IN')} {dataPoint.tripCount ? `(${dataPoint.tripCount} trip${dataPoint.tripCount > 1 ? 's' : ''})` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="x-axis" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                    {chartData.map((dataPoint, idx) => (
                      <span key={idx} style={{ width: '13%', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                        {dataPoint.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="chart-section" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>Fleet & Operations Overview</h3>
            <div className="operational-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>Fleet Readiness</span>
                <h4 style={{ fontSize: '24px', margin: '8px 0', color: '#38bdf8' }}>
                  {vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'Active' || v.status === 'Available').length / vehicles.length) * 100) : 0}%
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Vehicles available for assignment</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>Active Operations</span>
                <h4 style={{ fontSize: '24px', margin: '8px 0', color: '#4ade80' }}>
                  {activeTripsCount} Active Trips
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Out of {tripsCount} total logged trips</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>Document Compliance</span>
                <h4 style={{ fontSize: '24px', margin: '8px 0', color: alerts.length > 0 ? '#ffa502' : '#4ade80' }}>
                  {alerts.length} Warnings
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Document expirations pending</p>
              </div>
            </div>
          </div>
        )}

        <div className="side-panels">
          <div className="panel system-health">
            <h3>Fleet Status</h3>
            
            <div className="progress-item">
              <div className="progress-label">
                <span>Available / Active</span>
                <span className="value green-text">{vehicles.filter(v => v.status === 'Active' || v.status === 'Available').length}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar green-bg" style={{width: `${vehicles.length > 0 ? (vehicles.filter(v => v.status === 'Active' || v.status === 'Available').length / vehicles.length) * 100 : 0}%`}}></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-label">
                <span>In Maintenance</span>
                <span className="value yellow-text">{vehicles.filter(v => v.status === 'In Maintenance').length}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar yellow-bg" style={{width: `${vehicles.length > 0 ? (vehicles.filter(v => v.status === 'In Maintenance').length / vehicles.length) * 100 : 0}%`}}></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-label">
                <span>Off Duty</span>
                <span className="value red-text">{vehicles.filter(v => v.status === 'Off Duty').length}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar red-bg" style={{width: `${vehicles.length > 0 ? (vehicles.filter(v => v.status === 'Off Duty').length / vehicles.length) * 100 : 0}%`}}></div>
              </div>
            </div>

            <div className="progress-item" style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} onClick={() => navigate('/notifications')} title="Click to view alerts in notification center">
              <div className="progress-label">
                <span>Fleet & Document Alerts</span>
                <span className={`value ${alerts.length > 0 ? (alerts.some(a => a.type === 'danger') ? 'red-text' : 'yellow-text') : 'green-text'}`}>
                  {alerts.length > 0 ? `${alerts.length} Pending` : 'All Valid'}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar ${alerts.length > 0 ? (alerts.some(a => a.type === 'danger') ? 'red-bg' : 'yellow-bg') : 'green-bg'}`} 
                  style={{width: `${alerts.length > 0 ? Math.min((alerts.length / (vehicles.length || 1)) * 100, 100) : 100}%`}}
                ></div>
              </div>
            </div>
          </div>

          <div className="panel quick-tools">
            <h3>{isManager ? 'Manager Quick Tools' : 'Admin Quick Tools'}</h3>
            <ul className="tools-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><button className="tool-btn" onClick={() => navigate('/new-trip')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}><MdAddCircle size={18} color="#3b82f6" /> Add New Trip</button></li>
              <li><button className="tool-btn" onClick={() => navigate('/vehicles/create')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}><MdLocalShipping size={18} color="#10b981" /> Add Vehicle</button></li>
              <li><button className="tool-btn" onClick={() => navigate('/drivers/create')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}><MdPerson size={18} color="#8b5cf6" /> Add Driver</button></li>
            </ul>
          </div>

          <div className="panel alerts">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>
                {alerts.length > 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MdWarning color="#ef4444" /> Document Alerts</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MdCheckCircle color="#10b981" /> Document Status</span>}
              </h3>
              {alerts.length > 0 && (
                <span style={{ 
                  backgroundColor: alerts.some(a => a.type === 'danger') ? '#ff4757' : '#ffa502', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  fontWeight: '700' 
                }}>
                  {alerts.length} Active
                </span>
              )}
            </div>
            {alerts.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MdCheckCircle color="#10b981" /> All vehicle & driver documents are up to date.</span></p>
            ) : (
              <ul className="alerts-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                {alerts.map((alert, idx) => (
                  <li key={idx} style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    borderLeft: `4px solid ${alert.type === 'danger' ? '#ff4757' : '#ffa502'}`, 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: alert.type === 'danger' ? '#ff4757' : '#ffa502', marginBottom: '4px' }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{alert.message}</div>
                    </div>
                    {alert.targetUrl && (
                      <button 
                        onClick={() => navigate(alert.targetUrl)}
                        style={{
                          backgroundColor: alert.type === 'danger' ? 'rgba(255,71,87,0.15)' : 'rgba(255,165,2,0.15)',
                          color: alert.type === 'danger' ? '#ff4757' : '#ffa502',
                          border: `1px solid ${alert.type === 'danger' ? 'rgba(255,71,87,0.3)' : 'rgba(255,165,2,0.3)'}`,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          marginLeft: '8px'
                        }}
                      >
                        Update
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="recent-registrations-section panel">
        <h3>Recent Driver Registrations</h3>
        <div className="table-responsive">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>ROLE</th>
                <th>MOBILE / CONTACT</th>
                <th>STATUS</th>
                <th>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No records found</td>
                </tr>
              ) : (
                recentUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td><span className="role-badge" style={{ backgroundColor: user.role === 'MANAGER' ? '#2980b9' : '#27ae60', color: '#ffffff', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role}</span></td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className="status-dot active"></span> 
                      Active
                    </td>
                    <td>{user.joinDate || 'Unknown'}</td>
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

export default Dashboard;


