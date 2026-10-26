import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { roleKey } = useAuth();
  const navigate = useNavigate();
  
  if (roleKey === 'CUSTOMER') {
    return <CustomerDashboard />;
  }

  const [recentUsers, setRecentUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [maxProfit, setMaxProfit] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [tripsCount, setTripsCount] = useState(0);
  const [activeTripsCount, setActiveTripsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isManager = roleKey === 'MANAGER';

  if (roleKey === 'DRIVER' || roleKey === 'DISPATCHER') {
    return <Navigate to="/trips" replace />;
  }

  useEffect(() => {
    Promise.allSettled([
      // Fetch Active Drivers from Fleet
      fetch('/api/v1/fleet/drivers')
        .then(res => res.json())
        .then(data => {
          const availableDrivers = (Array.isArray(data) ? data : []).filter(d => (d.status || 'Available').toLowerCase() === 'available');
          setActiveDrivers(availableDrivers.length);
        }),

      // Fetch Users for Recent Registrations Table
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          const sorted = (Array.isArray(data) ? data : [])
            .filter(u => u.role === 'DRIVER')
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);
          setRecentUsers(sorted);
        }),

      // Fetch Vehicles
      fetch('/api/v1/fleet/vehicles')
        .then(res => res.json())
        .then(data => {
          setVehicles(Array.isArray(data) ? data : []);
        }),

      // Fetch Trips for Profit / Operational Calculation
      fetch('/api/v1/fleet/trips')
        .then(res => res.json())
        .then(data => {
          const trips = Array.isArray(data) ? data : [];
          setTripsCount(trips.length);
          const activeCount = trips.filter(t => (t.status || '').toLowerCase() === 'in transit' || (t.status || '').toLowerCase() === 'active').length;
          setActiveTripsCount(activeCount);

          // Total Profit
          const total = trips.reduce((sum, trip) => sum + (trip.freightAmount || 0), 0);
          setTotalProfit(total);

          // Chart Data (Last 6 Months)
          const today = new Date();
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          let last6Months = [];
          
          for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last6Months.push({
              monthIndex: d.getMonth(),
              year: d.getFullYear(),
              label: monthNames[d.getMonth()],
              profit: 0
            });
          }

          trips.forEach(trip => {
            if (trip.startDate && trip.freightAmount) {
              const tripDate = new Date(trip.startDate);
              const dataPoint = last6Months.find(m => m.monthIndex === tripDate.getMonth() && m.year === tripDate.getFullYear());
              if (dataPoint) {
                dataPoint.profit += trip.freightAmount;
              }
            }
          });

          const max = Math.max(...last6Months.map(m => m.profit), 1000);
          setMaxProfit(max);
          setChartData(last6Months);
        }),

      // Fetch Alerts
      fetch('/api/v1/fleet/alerts/expiring-documents')
        .then(res => res.json())
        .then(data => setAlerts(Array.isArray(data) ? data : []))
    ]).finally(() => {
      setIsLoading(false);
    });
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
              <div className="stat-value">{isLoading ? '...' : 1}</div>
              <p>System administrators</p>
            </div>
            
            <div className="stat-card dark">
              <h3>Total Freight Profit</h3>
              <div className="stat-value">{isLoading ? '...' : `₹${totalProfit.toLocaleString('en-IN')}`}</div>
              <p>Total profit from trips</p>
            </div>
          </>
        )}

        <div className="stat-card green">
          <h3>Active Vehicles</h3>
          <div className="stat-value">{isLoading ? '...' : vehicles.length}</div>
          <p>Currently registered</p>
        </div>
        
        <div className="stat-card cyan">
          <h3>Active Drivers</h3>
          <div className="stat-value">{isLoading ? '...' : activeDrivers}</div>
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
            <h3>Freight Profit (Last 6 Months)</h3>
            <div className="chart-container">
              <div className="bar-chart" style={{ paddingBottom: '20px' }}>
                <div className="y-axis">
                  <span>{(maxProfit).toLocaleString('en-IN')}</span>
                  <span>{(maxProfit * 0.75).toLocaleString('en-IN')}</span>
                  <span>{(maxProfit * 0.5).toLocaleString('en-IN')}</span>
                  <span>{(maxProfit * 0.25).toLocaleString('en-IN')}</span>
                  <span>0</span>
                </div>
                <div className="chart-bars-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingLeft: '40px', height: '100%' }}>
                  <div className="bars" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', borderLeft: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {chartData.map((dataPoint, idx) => {
                      const heightPercent = (dataPoint.profit / maxProfit) * 100;
                      return (
                        <div key={idx} style={{ width: '12%', height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                          <div 
                            className="chart-bar-hover-wrap" 
                            style={{ 
                              height: `${Math.max(heightPercent, 2)}%`, 
                              width: '100%', 
                              backgroundColor: '#0984e3', 
                              borderRadius: '4px 4px 0 0', 
                              position: 'relative', 
                              transition: 'all 0.2s ease', 
                              flex: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <div className="instant-bar-tooltip">
                              ₹{dataPoint.profit.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="x-axis" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                    {chartData.map((dataPoint, idx) => (
                      <span key={idx} style={{ width: '12%', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{dataPoint.label}</span>
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
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Fleet Readiness</span>
                <h4 style={{ fontSize: '24px', margin: '8px 0', color: '#38bdf8' }}>
                  {vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'Active' || v.status === 'Available').length / vehicles.length) * 100) : 0}%
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Vehicles available for assignment</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Active Operations</span>
                <h4 style={{ fontSize: '24px', margin: '8px 0', color: '#4ade80' }}>
                  {activeTripsCount} Active Trips
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Out of {tripsCount} total logged trips</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Document Compliance</span>
                <h4 style={{ fontSize: '24px', margin: '8px 0', color: alerts.length > 0 ? '#ffa502' : '#4ade80' }}>
                  {alerts.length} Warnings
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Document expirations pending</p>
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

            <div className="progress-item" style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="progress-label">
                <span>PUC / Document Expirations</span>
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
              <li><button className="tool-btn" onClick={() => navigate('/new-trip')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}><span>➕</span> Add New Trip</button></li>
              <li><button className="tool-btn" onClick={() => navigate('/vehicles/create')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}><span>🚛</span> Add Vehicle</button></li>
              <li><button className="tool-btn" onClick={() => navigate('/drivers/create')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}><span>👨‍✈️</span> Add Driver</button></li>
            </ul>
          </div>

          <div className="panel alerts">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>
                {alerts.length > 0 ? '⚠️ Document Alerts' : '📋 Document Status'}
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
              <p style={{ color: '#64748b', fontSize: '13px' }}>✅ All vehicle & driver documents are up to date.</p>
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


