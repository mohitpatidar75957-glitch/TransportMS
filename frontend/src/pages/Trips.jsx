import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete, MdFileDownload } from 'react-icons/md';
import './Vehicles.css'; // Reusing common table styles
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';


const Trips = () => {
  const { showAlert, showConfirm } = useModal();
  const { roleKey, currentUser } = useAuth();
  const isDriver = roleKey === 'DRIVER';
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbTrips, setDbTrips] = useState([]);
  const [trips, setTrips] = useState([]);
  
  const [recordingId, setRecordingId] = useState(null);
  const [recognitionObj, setRecognitionObj] = useState(null);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/v1/fleet/trips');
      if (response.ok) {
        const data = await response.json();
        if (isDriver) {
          // Filter trips where the assigned driver's userId matches currentUser.id
          const currentUserId = currentUser ? currentUser.id : -1; // -1 to match nothing if null
          const driverTrips = data.filter(t => t.driver && t.driver.userId === currentUserId);
          setDbTrips(driverTrips);
        } else if (roleKey === 'CUSTOMER') {
          const clientName = (currentUser?.companyName || currentUser?.name || '').toLowerCase();
          const customerTrips = data.filter(t => {
            if (!clientName) return true;
            const cName = (t.clientName || '').toLowerCase();
            const cons = (t.consignorName || '').toLowerCase();
            const rec = (t.consigneeName || '').toLowerCase();
            return cName.includes(clientName) || cons.includes(clientName) || rec.includes(clientName);
          });
          setDbTrips(customerTrips);
        } else {
          setDbTrips(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch trips from database:', error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Merge dummy trips with real database trips
  const allTrips = [
    ...dbTrips.map(t => ({
      id: t.tripNumber || `TRP-DB-${t.id}`,
      dbId: t.id,
      date: t.startDate || 'Unknown',
      customer: t.clientName || 'Unknown',
      route: t.route || 'N/A',
      vehicle: t.vehicle ? t.vehicle.registrationNumber : 'N/A',
      driver: t.driver ? t.driver.name : 'N/A',
      freight: `₹${(t.freightAmount || 0) + (t.gstAmount || 0) + (t.biltyCharge || 0) + (t.loadingCharge || 0)}`,
      status: t.status || 'Pending',
      isReal: true
    }))
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (isDriver) return; // Driver cannot delete
    if (await showConfirm('Are you sure you want to delete this trip?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/fleet/trips/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbTrips(dbTrips.filter(t => t.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setTrips(trips.filter(t => t.id !== id));
      }
    }
  };

  const filteredTrips = allTrips.filter(t => {
    const idStr = String(t.id || '');
    const custStr = String(t.customer || '');
    const routeStr = String(t.route || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    return idStr.toLowerCase().includes(searchStr) || 
           custStr.toLowerCase().includes(searchStr) ||
           routeStr.toLowerCase().includes(searchStr);
  });

  const [lang, setLang] = useState(localStorage.getItem('driverLang') || 'hi'); 
  const t = {
    en: { title: "My Assigned Trips", subtitle: "View your assigned trips", search: "Search by Trip #...", tripNum: "Trip #", date: "Date", route: "Route", vehicle: "Vehicle", freight: "Freight", status: "Status", viewBtn: "View Trip", noTrips: "No trips found." },
    hi: { title: "मेरी ट्रिप्स", subtitle: "अपनी असाइन की गई ट्रिप्स देखें", search: "ट्रिप नंबर से खोजें...", tripNum: "ट्रिप नंबर", date: "तारीख", route: "रास्ता", vehicle: "गाड़ी", freight: "भाड़ा", status: "स्थिति", viewBtn: "ट्रिप देखें", noTrips: "कोई ट्रिप नहीं मिली।" }
  };
  const txt = isDriver ? t[lang] : t['en'];

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('driverLang', newLang);
  };

  return (
    <div className="vehicles-container" style={isDriver ? { padding: '15px', backgroundColor: '#0f111a', minHeight: '100vh', margin: 0, width: '100%' } : {}}>
      
      {/* Mobile Driver Header with Language Toggle */}
      {isDriver && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={toggleLanguage} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', 
              borderRadius: '20px', cursor: 'pointer', fontSize: '15px',
              fontWeight: 'bold'
            }}
          >
            <span style={{ fontSize: '18px' }}>🌐</span> {lang === 'en' ? 'English' : 'हिंदी'}
          </button>
        </div>
      )}

      {/* Standard Header for Admin/Manager */}
      {/* Standard Header for Admin/Manager */}
      {!isDriver && (
        <div className="page-header">
          <div className="header-text">
            <h2>{roleKey === 'CUSTOMER' ? 'My Shipments & Trips' : 'Freight Trips'}</h2>
            <p>{roleKey === 'CUSTOMER' ? 'Track your active and completed freight consignments' : 'Manage all your ongoing and completed trips'}</p>
          </div>
          {roleKey !== 'CUSTOMER' && (
            <button className="primary-btn" onClick={() => navigate('/trips/create')}>
              <MdAdd size={20} /> Create Trip
            </button>
          )}
        </div>
      )}

      <div className={`filter-section panel ${isDriver ? 'mobile-filter' : ''}`} style={isDriver ? { padding: '15px', background: '#1a1a24', border: 'none' } : {}}>
        <div className="search-box" style={{ flex: 1, maxWidth: isDriver ? '100%' : '400px' }}>
          <input 
            type="text" 
            placeholder={isDriver ? txt.search : "Search by Trip #, Customer or Route..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={isDriver ? { background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } : {}}
          />
        </div>
        {!isDriver && (
          <>
            <button className="search-btn"><MdSearch size={20} /> Search</button>
            <button className="reset-btn" onClick={() => setSearchTerm('')}>Reset</button>
          </>
        )}
      </div>

      {isDriver ? (
        <div className="mobile-trips-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          {filteredTrips.length === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '30px' }}>{txt.noTrips}</div>
          ) : (
            filteredTrips.map(t => (
              <div key={t.id} style={{ background: '#1a1a24', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  <span style={{ color: '#0984e3', fontWeight: 'bold', fontSize: '18px' }}>{t.id}</span>
                  <span style={{ background: t.status === 'Completed' || t.status === 'CLOSED' ? '#00b894' : '#fdcb6e', color: '#000', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                    {t.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa', fontSize: '13px' }}>{txt.date}</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{t.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa', fontSize: '13px' }}>{txt.route}</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{t.route}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa', fontSize: '13px' }}>{txt.vehicle}</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{t.vehicle}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa', fontSize: '13px' }}>{txt.freight}</span>
                    <span style={{ color: '#00b894', fontWeight: 'bold' }}>{t.freight}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/trips/${t.id}`)}
                  style={{ width: '100%', padding: '14px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '15px' }}
                >
                  <MdVisibility size={20} /> {txt.viewBtn}
                </button>

                {/* Voice Notes Feature for Driver directly on the card */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>🎙️ {lang === 'hi' ? 'बोल कर नोट्स लिखें' : 'Voice Notes'}</span>
                  </div>
                  {t.notes && (
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', whiteSpace: 'pre-wrap', color: '#e0e0e0' }}>
                      {t.notes}
                    </div>
                  )}
                  <textarea 
                    id={`voiceNoteInput_${t.id}`}
                    placeholder={lang === 'hi' ? 'यहाँ नोट्स आएँगे...' : 'Driver notes...'}
                    style={{ width: '100%', height: '60px', marginBottom: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '14px' }}
                    onKeyUp={async (e) => {
                      if (lang !== 'hi') return;
                      if (e.key === ' ' || e.code === 'Space') {
                        const el = e.target;
                        const text = el.value;
                        const words = text.split(' ');
                        // The last word before the space is at index length-2 because of the trailing space
                        const lastWordIndex = words.length - 2; 
                        const lastWord = words[lastWordIndex];
                        
                        if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
                          try {
                            const res = await fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`);
                            const data = await res.json();
                            if (data[0] === 'SUCCESS' && data[1][0] && data[1][0][1][0]) {
                              words[lastWordIndex] = data[1][0][1][0];
                              el.value = words.join(' ');
                            }
                          } catch (err) { console.error('Transliteration failed', err); }
                        }
                      }
                    }}
                  ></textarea>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      style={{ flex: 1, backgroundColor: recordingId === t.id ? '#c0392b' : '#e67e22', padding: '12px', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                      onClick={() => {
                        if (recordingId === t.id && recognitionObj) {
                          recognitionObj.stop();
                          setRecordingId(null);
                          setRecognitionObj(null);
                          return;
                        }
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if(SpeechRecognition) {
                          const recognition = new SpeechRecognition();
                          recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
                          recognition.onresult = (event) => {
                            const el = document.getElementById(`voiceNoteInput_${t.id}`);
                            el.value += (el.value ? ' ' : '') + event.results[0][0].transcript;
                          };
                          recognition.onend = () => {
                            setRecordingId(null);
                            setRecognitionObj(null);
                          };
                          recognition.start();
                          setRecordingId(t.id);
                          setRecognitionObj(recognition);
                        } else {
                          alert('Voice recognition not supported in this browser.');
                        }
                      }}
                    >
                      {recordingId === t.id ? (lang === 'hi' ? '⏹ रोकें' : '⏹ Stop') : (lang === 'hi' ? '🎤 रिकॉर्ड करें' : '🎤 Record')}
                    </button>
                    <button 
                      style={{ flex: 1, backgroundColor: '#27ae60', padding: '12px', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                      onClick={async () => {
                        const noteText = document.getElementById(`voiceNoteInput_${t.id}`).value;
                        if(noteText) {
                          const driverName = isDriver ? (currentUser?.name || t.driver || 'Driver') : 'User';
                          const note = `${driverName}: ${noteText}`;
                          try {
                            const res = await fetch(`/api/trips/${t.dbId || t.id}/notes`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                              body: JSON.stringify({ note })
                            });
                            if (res.ok) {
                              const updatedTripData = await res.json();
                              // Update local state without reload
                              setAllTrips(prev => prev.map(tripItem => tripItem.id === t.id ? {...tripItem, notes: updatedTripData.notes} : tripItem));
                              showAlert(lang === 'hi' ? 'नोट एडमिन को भेज दिया गया है!' : 'Note sent to Admin successfully!');
                              document.getElementById(`voiceNoteInput_${t.id}`).value = '';
                            } else {
                              showAlert('Failed to send note.');
                            }
                          } catch (err) {
                            showAlert('Error: ' + err.message);
                          }
                        }
                      }}
                    >
                      📤 {lang === 'hi' ? 'भेजें' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-container panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>TRIP #</th>
                <th>DATE</th>
                <th>CUSTOMER & ROUTE</th>
                <th>VEHICLE / DRIVER</th>
                <th>FREIGHT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No trips found.</td>
                </tr>
              ) : (
                filteredTrips.map((t) => (
                <tr key={t.id}>
                  <td className="link-text" onClick={() => navigate(`/trips/${t.id}`)}>{t.id}</td>
                  <td>{t.date}</td>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num">{t.customer}</span>
                      <span className="vehicle-name route-text">{t.route}</span>
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num">{t.vehicle}</span>
                      <span className="vehicle-name">{t.driver}</span>
                    </div>
                  </td>
                  <td>{t.freight}</td>
                  <td>
                    <span className={`status-badge ${(t.status || 'Pending').toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon view" title="View Details" onClick={() => navigate(`/trips/${t.id}`)}><MdVisibility /></button>
                      {roleKey !== 'CUSTOMER' && (
                        <>
                          <button 
                            className="action-icon view" 
                            title={(t.status === 'Completed' || t.status === 'Delivered') ? "E-Way Bill cannot be generated for Completed trips" : "1-Click Generate E-Way Bill"} 
                            style={{ 
                              color: (t.status === 'Completed' || t.status === 'Delivered') ? 'var(--text-secondary, #888)' : '#27ae60',
                              opacity: (t.status === 'Completed' || t.status === 'Delivered') ? 0.45 : 1,
                              cursor: (t.status === 'Completed' || t.status === 'Delivered') ? 'not-allowed' : 'pointer'
                            }} 
                            disabled={t.status === 'Completed' || t.status === 'Delivered'}
                            onClick={async () => {
                              try {
                                const tripIdToUse = t.dbId || t.id;
                                const res = await fetch('/api/v1/compliance/eway-bill/generate', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    tripId: Number(tripIdToUse),
                                    distanceKm: 250
                                  })
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  showAlert(`Govt E-Way Bill Generated! No: ${data.ewayBillNumber} (Valid for ${data.validityDays} days, Exp: ${data.ewayBillExpiry})`);
                                  fetchTrips();
                                } else {
                                  const err = await res.json();
                                  showAlert(err.error || 'Failed to generate E-Way bill');
                                }
                              } catch(e) {
                                console.error('E-Way Bill generation error:', e);
                                showAlert('Could not create the E-Way Bill. Please check vehicle/trip details and try again.');
                              }
                            }}
                          >
                            🚚
                          </button>
                          <button 
                            className="action-icon view" 
                            title="Govt NIC E-Way Bill JSON Export" 
                            style={{ color: '#e67e22' }} 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const tripIdToFetch = t.dbId || t.id;
                                const res = await fetch(`/api/v1/compliance/eway-bill/${encodeURIComponent(tripIdToFetch)}/export/json`, {
                                  headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                                });
                                if (res.ok) {
                                  const blob = await res.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `eway_bill_${t.id}.json`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  showAlert('E-Way Bill NIC JSON exported successfully! Ready for direct portal upload.');
                                } else {
                                  let errMessage = 'Failed to download E-Way JSON.';
                                  try {
                                    const errJson = await res.json();
                                    if (errJson && errJson.error) errMessage = errJson.error;
                                  } catch (_) {}
                                  showAlert(errMessage);
                                }
                              } catch(e) {
                                showAlert('Error: ' + e.message);
                              }
                            }}
                          >
                            <MdFileDownload />
                          </button>
                          <button className="action-icon edit" title="Edit" onClick={() => navigate(`/trips/${t.id}/edit`)}><MdEdit /></button>
                          <button className="action-icon delete" title="Delete" onClick={() => handleDelete(t.id, t.isReal, t.dbId)}><MdDelete /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Trips;


