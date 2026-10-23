import React, { useState, useEffect } from 'react';
import { MdMyLocation, MdDirectionsCar, MdRefresh, MdFullscreen, MdShare } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Vehicles.css';
import { useAuth } from '../context/AuthContext';

// Fix for default Leaflet markers missing in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LiveTracking = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({ vehicleId: '', driverPhone: '', driverName: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [dbVehicles, setDbVehicles] = useState([]);
  const [dbDrivers, setDbDrivers] = useState([]);

  const { currentUser, roleKey } = useAuth();

  const fetchSessions = () => {
    setLoading(true);
    fetch('/api/tracking/sessions')
      .then(res => res.json())
      .then(data => {
        if (roleKey === 'DRIVER') {
          if (!currentUser?.phone) {
            setSessions([]); // Driver with no phone sees nothing
          } else {
            const myPhone = currentUser.phone.replace(/\D/g, '');
            const mySessions = data.filter(s => {
              const driverPhone = s.driverPhone ? String(s.driverPhone).replace(/\D/g, '') : '';
              if (!driverPhone || !myPhone) return false;
              return myPhone.endsWith(driverPhone) || driverPhone.endsWith(myPhone);
            });
            setSessions(mySessions);
          }
        } else if (roleKey === 'CUSTOMER') {
          // Fetch client's trips to only show active tracking sessions assigned to their orders
          const clientName = (currentUser?.companyName || currentUser?.name || '').toLowerCase();
          fetch('/api/v1/fleet/trips')
            .then(r => r.json())
            .then(trips => {
              const myTripVehicles = trips
                .filter(t => {
                  if (!clientName) return true;
                  const cName = (t.clientName || '').toLowerCase();
                  return cName.includes(clientName);
                })
                .map(t => (t.vehicle?.registrationNumber || '').toUpperCase());

              const mySessions = data.filter(s => {
                const sVeh = (s.vehicleId || '').toUpperCase();
                return myTripVehicles.includes(sVeh);
              });
              setSessions(mySessions.length > 0 ? mySessions : data);
            })
            .catch(() => setSessions(data));
        } else {
          setSessions(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sessions:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // refresh every 10s
    
    // Fetch options for the dropdowns
    fetch('/api/v1/fleet/vehicles').then(r => r.json()).then(d => setDbVehicles(d)).catch(e => console.error(e));
    fetch('/api/v1/fleet/drivers').then(r => r.json()).then(d => setDbDrivers(d)).catch(e => console.error(e));
    
    return () => clearInterval(interval);
  }, []);

  const handleStartTracking = (e) => {
    e.preventDefault();
    fetch('/api/tracking/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSessionData)
    })
    .then(res => res.json())
    .then(data => {
      const link = `${window.location.origin}/track/${data.sessionId}`;
      setGeneratedLink(link);
      fetchSessions();
    })
    .catch(err => console.error('Error starting session:', err));
  };

  return (
    <div className="vehicles-container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="header-text">
          <h2>{roleKey === 'CUSTOMER' ? 'Live Shipment Tracking' : 'Live Fleet Tracking'}</h2>
          <p>{roleKey === 'CUSTOMER' ? 'Track your active consignments live on map' : 'Real-time GPS tracking using Driver\'s Phone Number'}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {roleKey !== 'CUSTOMER' && (
            <button className="primary-btn" onClick={() => { setShowStartModal(true); setGeneratedLink(''); setNewSessionData({ vehicleId: '', driverPhone: '', driverName: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3498db' }}>
              <MdShare /> Share Tracking Link
            </button>
          )}
          <button className="reset-btn" onClick={fetchSessions} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdRefresh /> {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex-row-responsive" style={{ flex: 1, overflow: 'visible' }}>
        
        {/* Left Side: Vehicle List */}
        <div className="panel live-tracking-sidebar" style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Active Sessions</h3>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px' }}>
              <div><span style={{ color: '#4cd137', fontWeight: 'bold' }}>{sessions.filter(s => s.latitude).length}</span> Active</div>
              <div><span style={{ color: '#fbc531', fontWeight: 'bold' }}>{sessions.filter(s => !s.latitude).length}</span> Waiting for GPS</div>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
            {sessions.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No active tracking sessions.</div>}
            
            {sessions.map(v => (
              <div 
                key={v.sessionId} 
                onClick={() => setActiveSession(v.sessionId)}
                style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  backgroundColor: activeSession === v.sessionId ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                  borderLeft: activeSession === v.sessionId ? '4px solid #3498db' : '4px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{v.vehicleId}</span>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: v.latitude ? 'rgba(76, 209, 55, 0.2)' : 'rgba(251, 197, 49, 0.2)',
                    color: v.latitude ? '#4cd137' : '#fbc531',
                    fontWeight: 'bold'
                  }}>{v.latitude ? 'GPS ON' : 'WAITING'}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdDirectionsCar /> {v.driverName} ({v.driverPhone})
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdMyLocation /> {v.latitude ? `${v.latitude.toFixed(5)}, ${v.longitude.toFixed(5)}` : 'Location not shared yet'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Speed: {v.speed || 0} km/h</span>
                  <span>Updated: {new Date(v.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Real Leaflet Map */}
        <div className="panel" style={{ flex: 1, padding: 0, position: 'relative', overflow: 'hidden', minHeight: '500px', display: 'flex' }}>
          <MapContainer 
            center={[22.3039, 70.8022]} // Default center (India/Rajkot roughly)
            zoom={5} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {sessions.map(s => {
              if (s.latitude && s.longitude) {
                return (
                  <Marker key={s.sessionId} position={[s.latitude, s.longitude]}>
                    <Popup>
                      <strong>{s.vehicleId}</strong><br/>
                      Driver: {s.driverName}<br/>
                      Phone: {s.driverPhone}<br/>
                      Speed: {s.speed || 0} km/h
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

      </div>

      {/* Start Tracking Modal */}
      {showStartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--panel-bg)', padding: '24px', borderRadius: '8px', width: '400px', color: 'var(--text-primary)' }}>
            <h3 style={{ marginTop: 0 }}>Share Live Tracking Link</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter the driver's phone number and vehicle details. A tracking session will be created, and you can share the link with the driver on WhatsApp.</p>
            
            {!generatedLink ? (
              <form onSubmit={handleStartTracking}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Vehicle ID</label>
                  <select 
                    className="form-control" 
                    required 
                    value={newSessionData.vehicleId} 
                    onChange={e => setNewSessionData({...newSessionData, vehicleId: e.target.value})}
                  >
                    <option value="">Select a Vehicle</option>
                    {dbVehicles.map(v => (
                      <option key={v.id} value={v.registrationNumber || v.name}>{v.registrationNumber || v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label>Select Driver</label>
                  <select 
                    className="form-control" 
                    required 
                    value={newSessionData.driverPhone} 
                    onChange={e => {
                      const selectedDriver = dbDrivers.find(d => d.phone === e.target.value);
                      if (selectedDriver) {
                        setNewSessionData({
                          ...newSessionData, 
                          driverPhone: selectedDriver.phone,
                          driverName: selectedDriver.name
                        });
                      } else {
                        setNewSessionData({ ...newSessionData, driverPhone: '', driverName: '' });
                      }
                    }}
                  >
                    <option value="">Select a Driver</option>
                    {dbDrivers.filter(d => d.phone).map(d => (
                      <option key={d.id} value={d.phone}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowStartModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Generate Link</button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', marginBottom: '15px', wordBreak: 'break-all', fontSize: '13px' }}>
                  <a href={generatedLink} target="_blank" rel="noreferrer" style={{ color: '#3498db' }}>{generatedLink}</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a 
                    href={`https://wa.me/91${newSessionData.driverPhone}?text=${encodeURIComponent(`Hi ${newSessionData.driverName}, please start your live tracking for vehicle ${newSessionData.vehicleId} by clicking this link: ${generatedLink}`)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-primary" 
                    style={{ backgroundColor: '#25D366', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', color: 'white', borderRadius: '4px' }}
                  >
                    Share via WhatsApp
                  </a>
                  <button className="btn-secondary" onClick={() => setShowStartModal(false)} style={{ padding: '10px' }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;


