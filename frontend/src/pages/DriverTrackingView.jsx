import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MdMyLocation, MdStop, MdPlayArrow, MdLanguage } from 'react-icons/md';

const DriverTrackingView = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');
  const [watchId, setWatchId] = useState(null);
  const [lastSent, setLastSent] = useState(null);
  
  // Language State
  const [lang, setLang] = useState('hi'); // Default to Hindi for drivers

  // Translations Dictionary
  const texts = {
    en: {
      title: "Transport MS",
      subtitle: "Driver Live Tracking",
      driver: "Driver Name",
      vehicle: "Vehicle No.",
      status: "Status",
      start: "Start Sharing Location",
      stop: "Stop Sharing",
      on: "Location Sharing is ON",
      lastUpdated: "Last updated",
      loading: "Loading trip details...",
      errorGPS: "Error accessing GPS. Please enable Location in your phone settings."
    },
    hi: {
      title: "Transport MS",
      subtitle: "ड्राइवर लाइव ट्रैकिंग",
      driver: "ड्राइवर का नाम",
      vehicle: "गाड़ी नंबर",
      status: "स्थिति",
      start: "लोकेशन भेजना शुरू करें",
      stop: "लोकेशन भेजना बंद करें",
      on: "लोकेशन भेजी जा रही है",
      lastUpdated: "अंतिम अपडेट",
      loading: "ट्रिप की जानकारी लोड हो रही है...",
      errorGPS: "GPS चालू नहीं है। कृपया अपने फोन की सेटिंग में लोकेशन चालू करें।"
    }
  };

  const t = texts[lang];

  const backendBase = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
    : 'https://transport-ms-backend.onrender.com';

  useEffect(() => {
    // Fetch session info with direct fallback
    const fetchSession = async () => {
      try {
        let res = await fetch(`/api/tracking/sessions/${sessionId}`);
        if (!res.ok) {
          // Fallback to direct backend
          res = await fetch(`${backendBase}/api/tracking/sessions/${sessionId}`);
        }
        if (!res.ok) {
          throw new Error('Tracking session not found or expired.');
        }
        const data = await res.json();
        setSessionData(data);
      } catch (err) {
        console.error('Session fetch error:', err);
        setError(err.message || 'Tracking session not found or expired.');
      }
    };

    fetchSession();
      
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [sessionId]);

  const sendLocation = async (position) => {
    const { latitude, longitude, speed } = position.coords;
    const speedKmh = speed ? (speed * 3.6).toFixed(1) : 0;
    
    try {
      let res = await fetch(`/api/tracking/update/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, speed: speedKmh })
      });
      if (!res.ok) {
        res = await fetch(`${backendBase}/api/tracking/update/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude, speed: speedKmh })
        });
      }
      if (res.ok) {
        setLastSent(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to send location:', err);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError(lang === 'hi' ? 'आपका फोन GPS सपोर्ट नहीं करता।' : 'Geolocation is not supported by your browser.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      sendLocation,
      (err) => setError(t.errorGPS),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    
    setWatchId(id);
    setIsTracking(true);
    setError('');
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  if (error && !sessionData) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>{error}</div>;
  }

  if (!sessionData) {
    return <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>{t.loading}</div>;
  }

  return (
    <div style={{ padding: '10px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#0f111a', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#1a1a24', padding: '25px 20px', borderRadius: '16px', color: 'white', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        
        {/* Language Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px' }}
          >
            <MdLanguage size={18} /> {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#74b9ff' }}>{t.title}</h2>
        <p style={{ color: '#aaa', margin: '0 0 25px 0', fontSize: '16px' }}>{t.subtitle}</p>
        
        {/* Trip Details Card for Mobile */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '30px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '12px', fontSize: '16px' }}>
            <span style={{ color: '#aaa', display: 'block', fontSize: '12px', marginBottom: '2px' }}>{t.driver}</span>
            <strong>{sessionData.driverName || sessionData.driverPhone}</strong>
          </div>
          <div style={{ marginBottom: '12px', fontSize: '16px' }}>
            <span style={{ color: '#aaa', display: 'block', fontSize: '12px', marginBottom: '2px' }}>{t.vehicle}</span>
            <strong>{sessionData.vehicleId}</strong>
          </div>
          <div style={{ fontSize: '16px' }}>
            <span style={{ color: '#aaa', display: 'block', fontSize: '12px', marginBottom: '2px' }}>{t.status}</span>
            <strong style={{ color: '#4cd137' }}>{sessionData.status}</strong>
          </div>
        </div>

        {error && <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#ff4757', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '15px' }}>{error}</div>}

        {/* Large Touchable Buttons */}
        {!isTracking ? (
          <button 
            onClick={startTracking}
            style={{ width: '100%', padding: '20px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(9, 132, 227, 0.4)' }}
          >
            <MdPlayArrow size={28} /> {t.start}
          </button>
        ) : (
          <div>
            <div style={{ marginBottom: '20px', color: '#00b894', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
              <MdMyLocation size={24} className="pulse-icon" /> {t.on}
            </div>
            {lastSent && <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '25px' }}>{t.lastUpdated}: <strong style={{color: 'white'}}>{lastSent}</strong></div>}
            
            <button 
              onClick={stopTracking}
              style={{ width: '100%', padding: '20px', backgroundColor: '#d63031', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(214, 48, 49, 0.4)' }}
            >
              <MdStop size={28} /> {t.stop}
            </button>
          </div>
        )}
      </div>
      <style>{`
        body { margin: 0; background-color: #0f111a; }
        .pulse-icon { animation: pulse 1.5s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DriverTrackingView;
