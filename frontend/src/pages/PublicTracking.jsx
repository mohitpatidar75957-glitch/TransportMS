import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MdLocalShipping, MdAccessTime, MdCloud, MdWarning, MdLocationOn } from 'react-icons/md';

const PublicTracking = () => {
  const { trackingId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/public/tracking/${trackingId}`)
      .then(res => {
        if (!res.ok) throw new Error('Tracking link invalid or expired.');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [trackingId]);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading live tracking details...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '50px', color: 'red'}}><h3>Error</h3><p>{error}</p></div>;

  const getStatusColor = () => {
    if (data.status === 'Delivered' || data.status === 'Completed') return '#2ecc71'; // Green
    if (data.delayHours > 0) return '#e74c3c'; // Red if delayed
    return '#3498db'; // Blue normally
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Live Shipment Tracker</h2>
        <p style={{ color: '#7f8c8d', margin: '8px 0 0' }}>Order #{data.tripNumber}</p>
      </div>

      {data.delayHours > 0 && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdWarning size={24} />
          <div>
            <strong>Delay Alert:</strong> {data.delayReason}
          </div>
        </div>
      )}

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: getStatusColor(), display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <MdLocalShipping size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{data.status}</h3>
            <div style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <MdLocationOn /> {data.currentLocation}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>Expected Delivery</p>
            <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{data.expectedDelivery.replace('T', ' ')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>Weather Conditions</p>
            <p style={{ margin: '4px 0 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <MdCloud /> {data.weatherCondition}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px' }}>Route Details</h4>
        <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px dashed #ccc' }}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #ccc' }}></span>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Pickup</p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#555' }}>{data.pickup || 'Origin'}</p>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #ccc' }}></span>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Delivery</p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#555' }}>{data.delivery || 'Destination'}</p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px' }}>Driver Details</h4>
        <p style={{ margin: 0 }}><strong>Name:</strong> {data.driverName}</p>
        <p style={{ margin: '4px 0 0' }}><strong>Phone:</strong> {data.driverPhone}</p>
        <p style={{ margin: '4px 0 0' }}><strong>Vehicle:</strong> {data.vehicleNo}</p>
      </div>
    </div>
  );
};

export default PublicTracking;
