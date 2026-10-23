import React, { useState, useEffect } from 'react';
import { 
  MdBuild, MdAdd, MdClose, MdWarning, MdCheckCircle, 
  MdCalendarToday, MdSpeed, MdMiscellaneousServices,
  MdPayment, MdHourglassEmpty 
} from 'react-icons/md';
import { GiCarWheel } from 'react-icons/gi';
import { useModal } from '../context/ModalContext';
import './Vehicles.css';

const MaintenanceReport = () => {
  const { showAlert, showConfirm } = useModal();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tyreAlerts, setTyreAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'TYRE', 'ALERTS', 'SERVICE', 'BATTERY'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: 'Tyre Replacement',
    serviceDate: new Date().toISOString().split('T')[0],
    odometerReading: '',
    cost: '',
    vendorGarage: '',
    tyrePosition: 'Rear-Right-Outer',
    tyreSerialNumber: '',
    tyreBrand: 'Apollo EnduTrax',
    currentTreadDepthMm: '15',
    tyreRotationDueKm: '',
    tyreChangeDueKm: '',
    nextServiceDate: '',
    nextServiceKm: '',
    notes: ''
  });

  // Payment Settlement Modal State
  const [payModal, setPayModal] = useState({
    isOpen: false,
    record: null,
    amount: '',
    paymentMode: 'UPI',
    referenceNumber: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintRes, vehRes, tyreAlertsRes] = await Promise.all([
        fetch('/api/v1/fleet/maintenance'),
        fetch('/api/v1/fleet/vehicles'),
        fetch('/api/v1/fleet/maintenance/tyre-alerts').catch(() => null)
      ]);

      if (maintRes.ok) {
        const mData = await maintRes.json();
        setRecords(Array.isArray(mData) ? mData : []);
      }
      if (vehRes.ok) {
        const vData = await vehRes.json();
        setVehicles(Array.isArray(vData) ? vData : []);
      }
      if (tyreAlertsRes && tyreAlertsRes.ok) {
        const aData = await tyreAlertsRes.json();
        const list = Array.isArray(aData) ? aData : (aData.value || []);
        setTyreAlerts(list);
      }
    } catch (err) {
      console.error('Error fetching maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleId') {
      const selectedVeh = vehicles.find(v => v.id === parseInt(value));
      // Find latest logged odometer for this vehicle from existing records or default based on vehicle id
      const pastVehicleRecords = records.filter(r => r.vehicle && r.vehicle.id === parseInt(value) && r.odometerReading);
      const latestOdo = pastVehicleRecords.length > 0
        ? Math.max(...pastVehicleRecords.map(r => r.odometerReading))
        : (selectedVeh ? 45000 + (selectedVeh.id * 3200) : 50000);

      setFormData(prev => ({
        ...prev,
        vehicleId: value,
        odometerReading: latestOdo,
        tyreRotationDueKm: prev.tyreRotationDueKm || (latestOdo + 10000),
        tyreChangeDueKm: prev.tyreChangeDueKm || (latestOdo + 60000),
        nextServiceKm: prev.nextServiceKm || (latestOdo + 15000)
      }));
      return;
    }

    if (name === 'odometerReading') {
      const odoVal = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        odometerReading: value,
        ...(odoVal ? {
          tyreRotationDueKm: odoVal + 10000,
          tyreChangeDueKm: odoVal + 60000,
          nextServiceKm: odoVal + 15000
        } : {})
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      showAlert('Please select a vehicle!');
      return;
    }

    const payload = {
      vehicle: { id: parseInt(formData.vehicleId) },
      serviceType: formData.serviceType,
      serviceDate: formData.serviceDate,
      odometerReading: formData.odometerReading ? parseFloat(formData.odometerReading) : null,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      vendorGarage: formData.vendorGarage,
      tyrePosition: formData.serviceType === 'Tyre Replacement' ? formData.tyrePosition : null,
      tyreSerialNumber: formData.tyreSerialNumber || null,
      tyreBrand: formData.tyreBrand || null,
      currentTreadDepthMm: formData.currentTreadDepthMm ? parseFloat(formData.currentTreadDepthMm) : null,
      tyreRotationDueKm: formData.tyreRotationDueKm ? parseFloat(formData.tyreRotationDueKm) : null,
      tyreChangeDueKm: formData.tyreChangeDueKm ? parseFloat(formData.tyreChangeDueKm) : null,
      nextServiceDate: formData.nextServiceDate || null,
      nextServiceKm: formData.nextServiceKm ? parseFloat(formData.nextServiceKm) : null,
      notes: formData.notes
    };

    try {
      const res = await fetch('/api/v1/fleet/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showAlert('Maintenance / Tyre record saved successfully!');
        setIsModalOpen(false);
        setFormData({
          vehicleId: '',
          serviceType: 'Tyre Replacement',
          serviceDate: new Date().toISOString().split('T')[0],
          odometerReading: '',
          cost: '',
          vendorGarage: '',
          tyrePosition: 'Rear-Right-Outer',
          tyreSerialNumber: '',
          tyreBrand: 'Apollo EnduTrax',
          nextServiceDate: '',
          nextServiceKm: '',
          notes: ''
        });
        fetchData();
      } else {
        showAlert('Failed to save maintenance record.');
      }
    } catch (err) {
      console.error('Error saving record:', err);
      showAlert('Error connecting to backend database.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`/api/v1/fleet/maintenance/${id}/status?status=${encodeURIComponent(status)}&approverName=Super%20Admin`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        setRecords(prev => prev.map(r => r.id === id ? updated : r));
        showAlert(`Service record #${id} marked as ${status}!`);
      } else {
        showAlert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error updating status.');
    }
  };

  const openPayModal = (item) => {
    const vRegClean = (item.vehicle?.registrationNumber || 'VEH').replace(/[^a-zA-Z0-9]/g, '');
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const autoRefNumber = `BILL-${vRegClean}-${dateStr}-${randomSuffix}`;

    setPayModal({
      isOpen: true,
      record: item,
      amount: item.cost || '',
      paymentMode: 'UPI',
      referenceNumber: item.referenceNumber || autoRefNumber
    });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payModal.record || !payModal.amount) return;

    try {
      const res = await fetch(`/api/v1/fleet/maintenance/${payModal.record.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(payModal.amount),
          paymentMode: payModal.paymentMode,
          referenceNumber: payModal.referenceNumber
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        showAlert(`₹${parseFloat(payModal.amount).toLocaleString()} payment successfully recorded & debited from Cash/Bank!`);
        setPayModal({ isOpen: false, record: null, amount: '', paymentMode: 'UPI', referenceNumber: '' });
      } else {
        showAlert('Failed to record payment.');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error connecting to backend.');
    }
  };

  const handleDelete = async (id) => {
    if (await showConfirm('Are you sure you want to delete this maintenance record?')) {
      try {
        const res = await fetch(`/api/v1/fleet/maintenance/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setRecords(prev => prev.filter(r => r.id !== id));
        } else {
          showAlert('Failed to delete record.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filtered Records
  const filteredRecords = records.filter(r => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'TYRE') return r.serviceType === 'Tyre Replacement';
    if (activeTab === 'SERVICE') return r.serviceType === 'Scheduled Service' || r.serviceType === 'Routine Inspection';
    if (activeTab === 'BATTERY') return r.serviceType === 'Battery Replacement';
    return true;
  });

  const totalCost = records.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
  const totalTyreReplaces = records.filter(r => r.serviceType === 'Tyre Replacement').length;
  
  // Upcoming Service count (due in next 30 days)
  const today = new Date();
  const upcomingServices = records.filter(r => {
    if (!r.nextServiceDate) return false;
    const diffDays = Math.ceil((new Date(r.nextServiceDate) - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 45;
  });

  return (
    <div className="vehicles-container" style={{ gap: '12px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: 0 }}>
            <MdBuild style={{ color: '#38bdf8' }} />
            Vehicle Maintenance & Tyre Tracking
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Service intervals, Tyre serial numbers, and Odometer due reminders
          </p>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600 }}
        >
          <MdAdd size={18} /> Record Service / Tyre Change
        </button>
      </div>

      {/* Compact Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="panel" style={{ padding: '12px 16px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Service Records</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>{records.length}</div>
        </div>

        <div className="panel" style={{ padding: '12px 16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tyres Changed / Logged</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GiCarWheel size={20} /> {totalTyreReplaces} Tyres
          </div>
        </div>

        <div className="panel" style={{ padding: '12px 16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tyre Rotation & Odo Alerts</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚠️ {tyreAlerts.length} Due/Overdue
          </div>
        </div>

        <div className="panel" style={{ padding: '12px 16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Maintenance Spend</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>₹{totalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Area 3: Tyre Odometer Scheduling Alerts Banner */}
      {tyreAlerts.length > 0 && (
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid #fca5a5',
          borderRadius: '10px',
          padding: '14px 18px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🚨</span>
              <strong style={{ color: '#dc2626', fontSize: '13px' }}>
                Tyre Serial Number & Odometer Scheduling Alerts (Area 3 Automated Push)
              </strong>
            </div>
            <span style={{ fontSize: '11px', background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #fca5a5' }}>
              Live Odometer Threshold: ≤ 1,000 KM
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {tyreAlerts.map((alt, i) => (
              <div key={i} style={{
                background: 'var(--bg-primary, #f8fafc)',
                border: `1.5px solid ${alt.severity === 'HIGH' || alt.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                borderRadius: '8px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 'bold' }}>
                  <span style={{ color: '#0284c7' }}>{alt.vehicleReg} ({alt.vehicleName})</span>
                  <span style={{ color: alt.severity === 'HIGH' ? '#dc2626' : '#d97706', fontWeight: 800 }}>
                    {alt.kmUntilRotation <= 0 ? '🔴 OVERDUE' : `🟡 IN ${alt.kmUntilRotation} KM`}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary, #475569)', marginTop: '5px' }}>
                  <strong>Wheel Position:</strong> <span style={{ color: '#b45309', fontWeight: 700 }}>{alt.tyrePosition}</span> | <strong>S/N:</strong> <code style={{ color: '#6d28d9', fontWeight: 700 }}>{alt.tyreSerialNumber}</code>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary, #475569)', marginTop: '3px' }}>
                  Brand: <strong style={{ color: 'var(--text-primary)' }}>{alt.tyreBrand}</strong> | Tread: {alt.treadDepthMm}mm | Current Odo: {Number(alt.currentOdometerKm).toLocaleString()} KM
                </div>
                <div style={{ fontSize: '11.5px', color: alt.kmUntilRotation <= 0 ? '#b91c1c' : '#b45309', marginTop: '6px', fontWeight: 600 }}>
                  {alt.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
        <button 
          onClick={() => setActiveTab('ALL')} 
          style={{ 
            padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            backgroundColor: activeTab === 'ALL' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'ALL' ? '#0f172a' : 'var(--text-primary)'
          }}
        >
          All ({records.length})
        </button>
        <button 
          onClick={() => setActiveTab('ALERTS')} 
          style={{ 
            padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            backgroundColor: activeTab === 'ALERTS' ? '#ef4444' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'ALERTS' ? '#fff' : 'var(--text-primary)'
          }}
        >
          🚨 Tyre Alerts ({tyreAlerts.length})
        </button>
        <button 
          onClick={() => setActiveTab('TYRE')} 
          style={{ 
            padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            backgroundColor: activeTab === 'TYRE' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'TYRE' ? '#0f172a' : 'var(--text-primary)'
          }}
        >
          🛞 Tyres ({records.filter(r => r.serviceType === 'Tyre Replacement').length})
        </button>
        <button 
          onClick={() => setActiveTab('SERVICE')} 
          style={{ 
            padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            backgroundColor: activeTab === 'SERVICE' ? '#10b981' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'SERVICE' ? '#0f172a' : 'var(--text-primary)'
          }}
        >
          🔧 Servicing
        </button>
        <button 
          onClick={() => setActiveTab('BATTERY')} 
          style={{ 
            padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            backgroundColor: activeTab === 'BATTERY' ? '#6366f1' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'BATTERY' ? '#fff' : 'var(--text-primary)'
          }}
        >
          ⚡ Battery
        </button>
      </div>

      {/* Main Table */}
      <div className="panel" style={{ padding: '0px', overflowX: 'hidden', borderRadius: '10px' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary, rgba(0,0,0,0.03))' }}>
              <th style={{ width: '13%', padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>VEHICLE</th>
              <th style={{ width: '11%', padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>TYPE</th>
              <th style={{ width: '11%', padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>DATE & ODO</th>
              <th style={{ width: '16%', padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>SPECS / NOTES</th>
              <th style={{ width: '12%', padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>WORKSHOP</th>
              <th style={{ width: '11%', padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>NEXT DUE</th>
              <th style={{ width: '8%', padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>COST</th>
              <th style={{ width: '8%', padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>STATUS</th>
              <th style={{ width: '10%', padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading maintenance logs...</td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No records found in this category. Click "+ Record Service / Tyre Change" to add one!</td></tr>
            ) : (
              filteredRecords.map(item => {
                const isTyre = item.serviceType === 'Tyre Replacement';

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 6px', overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.vehicle ? item.vehicle.registrationNumber : 'N/A'}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.vehicle ? `${item.vehicle.name || ''} ${item.vehicle.model || ''}` : ''}
                      </div>
                    </td>

                    <td style={{ padding: '8px 6px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '5px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        backgroundColor: isTyre ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                        color: isTyre ? '#d97706' : '#0284c7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        whiteSpace: 'nowrap'
                      }}>
                        {isTyre ? <GiCarWheel /> : <MdBuild />}
                        {item.serviceType === 'Tyre Replacement' ? 'Tyre' : item.serviceType}
                      </span>
                    </td>

                    <td style={{ padding: '8px 6px', fontSize: '11px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.serviceDate}</div>
                      {item.odometerReading && (
                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px' }}>
                          <MdSpeed size={11} /> <span>{item.odometerReading.toLocaleString()} km</span>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '8px 6px', fontSize: '11px', overflow: 'hidden' }}>
                      {isTyre ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#d97706', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.tyreBrand || 'Radial Tyre'} ({item.tyrePosition || 'Pos'})
                          </div>
                          {item.tyreSerialNumber && (
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              S/N: {item.tyreSerialNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.notes}>
                          {item.notes || 'Routine maintenance'}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '8px 6px', fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.vendorGarage}>
                      {item.vendorGarage || 'Internal'}
                    </td>

                    <td style={{ padding: '8px 6px', fontSize: '11px' }}>
                      {item.nextServiceDate ? (
                        <div>
                          <div style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <MdCalendarToday size={11} /> <span>{item.nextServiceDate}</span>
                          </div>
                          {item.nextServiceKm && (
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                              ~{item.nextServiceKm.toLocaleString()} km
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>-</span>
                      )}
                    </td>

                    <td style={{ padding: '8px 6px', fontWeight: 700, color: '#dc2626', fontSize: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      ₹{parseFloat(item.cost || 0).toLocaleString()}
                    </td>

                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {item.paymentStatus === 'Paid' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '2px 5px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#15803d',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }} title={`Paid ${item.paymentMode || ''}`}>
                          <MdCheckCircle size={11} /> Paid
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '2px 5px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#b91c1c',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          Unpaid
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '8px 8px 8px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        {item.paymentStatus !== 'Paid' ? (
                          <button 
                            onClick={() => openPayModal(item)}
                            style={{ 
                              backgroundColor: '#16a34a',
                              border: 'none',
                              color: '#ffffff',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              flexShrink: 0
                            }}
                            title="Pay bill"
                          >
                            <MdPayment size={12} /> Pay
                          </button>
                        ) : null}

                        <button 
                          onClick={() => handleDelete(item.id)}
                          style={{ 
                            background: 'transparent', 
                            border: '1px solid var(--border-color)', 
                            color: 'var(--text-secondary)', 
                            cursor: 'pointer', 
                            padding: '4px 5px', 
                            borderRadius: '5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                          title="Delete record"
                        >
                          <MdClose size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Record Service / Tyre Change */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100, padding: '20px'
        }}>
          <div className="panel" style={{
            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
            position: 'relative', padding: '28px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <MdClose size={24} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdBuild style={{ color: '#38bdf8' }} /> Record Vehicle Maintenance & Tyres
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Log part replacements, tyre serials, and next service reminder dates
            </p>

            <form onSubmit={handleCreateRecord}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Select Vehicle <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    name="vehicleId" 
                    className="form-control" 
                    value={formData.vehicleId} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">-- Choose Truck / Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.model || v.name || 'Truck'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select 
                    name="serviceType" 
                    className="form-control" 
                    value={formData.serviceType} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="Tyre Replacement">🛞 Tyre Replacement / New Tyres</option>
                    <option value="Scheduled Service">🔧 Scheduled Periodic Servicing</option>
                    <option value="Battery Replacement">⚡ Battery Replacement</option>
                    <option value="Major Engine Repair">⚙️ Engine / Gearbox Overhaul</option>
                    <option value="Brake Overhaul">🛑 Brake & Suspension Repair</option>
                    <option value="Routine Inspection">🔍 General Fleet Inspection</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="date" 
                    name="serviceDate" 
                    className="form-control" 
                    value={formData.serviceDate} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ margin: 0 }}>Current Odometer (KM)</label>
                    {formData.vehicleId && formData.odometerReading && (
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>⚡ Auto-Fetched</span>
                    )}
                  </div>
                  <input 
                    type="number" 
                    name="odometerReading" 
                    className="form-control" 
                    placeholder="e.g. 52000" 
                    value={formData.odometerReading} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="form-group">
                  <label>Cost / Invoice Amount (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="number" 
                    name="cost" 
                    className="form-control" 
                    placeholder="e.g. 35000" 
                    value={formData.cost} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Workshop / Garage / Vendor</label>
                  <input 
                    type="text" 
                    name="vendorGarage" 
                    className="form-control" 
                    placeholder="e.g. Apollo Tyre Hub / Tata Motors" 
                    value={formData.vendorGarage} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              {/* Tyre Details Section (Only shown if Tyre Replacement selected) */}
              {formData.serviceType === 'Tyre Replacement' && (
                <div style={{ marginTop: '18px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GiCarWheel size={18} /> Tyre Details & Serial Number Tracking
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>Tyre Position</label>
                      <select name="tyrePosition" className="form-control" value={formData.tyrePosition} onChange={handleInputChange}>
                        <option value="Front-Left">Front Left</option>
                        <option value="Front-Right">Front Right</option>
                        <option value="Rear-Left-Outer">Rear Left (Outer)</option>
                        <option value="Rear-Left-Inner">Rear Left (Inner)</option>
                        <option value="Rear-Right-Outer">Rear Right (Outer)</option>
                        <option value="Rear-Right-Inner">Rear Right (Inner)</option>
                        <option value="Spare / Stepney">Spare / Stepney</option>
                        <option value="All Rear Axle (Set)">All Rear Axle (Set)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>Brand / Model</label>
                      <input 
                        type="text" 
                        name="tyreBrand" 
                        className="form-control" 
                        placeholder="e.g. Apollo EnduTrax / MRF" 
                        value={formData.tyreBrand} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>Serial / DOT Code <span style={{ color: '#ef4444' }}>*</span></label>
                      <input 
                        type="text" 
                        name="tyreSerialNumber" 
                        className="form-control" 
                        placeholder="e.g. AP-99482-Z" 
                        value={formData.tyreSerialNumber} 
                        onChange={handleInputChange} 
                        required={formData.serviceType === 'Tyre Replacement'}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>Tread Depth (mm)</label>
                      <input 
                        type="number" 
                        name="currentTreadDepthMm" 
                        className="form-control" 
                        placeholder="e.g. 15 (New)" 
                        value={formData.currentTreadDepthMm} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>Rotation Due (Odo KM)</label>
                      <input 
                        type="number" 
                        name="tyreRotationDueKm" 
                        className="form-control" 
                        placeholder="e.g. 60000 (+10,000 km)" 
                        value={formData.tyreRotationDueKm} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>Change Due (Odo KM)</label>
                      <input 
                        type="number" 
                        name="tyreChangeDueKm" 
                        className="form-control" 
                        placeholder="e.g. 110000 (+60,000 km)" 
                        value={formData.tyreChangeDueKm} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Next Scheduled Service Reminder */}
              <div style={{ marginTop: '18px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdCalendarToday size={16} /> Next Service Schedule & Reminder
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>Next Service Due Date</label>
                    <input 
                      type="date" 
                      name="nextServiceDate" 
                      className="form-control" 
                      value={formData.nextServiceDate} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px' }}>Next Service At (KM)</label>
                    <input 
                      type="number" 
                      name="nextServiceKm" 
                      className="form-control" 
                      placeholder="e.g. 65000" 
                      value={formData.nextServiceKm} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Work Description / Notes</label>
                <textarea 
                  name="notes" 
                  rows="2" 
                  className="form-control" 
                  placeholder="Detail parts changed, warranty periods, or driver feedback..."
                  value={formData.notes} 
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: '#334155', color: '#fff', padding: '11px', border: 'none', borderRadius: '8px' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', fontWeight: 600 }}
                >
                  Save Maintenance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Payment / Settle Bill */}
      {payModal.isOpen && payModal.record && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1200, padding: '20px'
        }}>
          <div className="panel" style={{
            width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', position: 'relative'
          }}>
            <button 
              onClick={() => setPayModal({ isOpen: false, record: null, amount: '', paymentMode: 'UPI', referenceNumber: '' })}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <MdClose size={24} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Settle & Pay Workshop Bill
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {payModal.record.serviceType} for <strong>{payModal.record.vehicle?.registrationNumber}</strong> at {payModal.record.vendorGarage || 'Garage'}
            </p>

            {/* Vehicle & Maintenance Details Card */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', fontWeight: 600 }}>Vehicle Under Service</span>
                <span style={{ 
                  backgroundColor: '#3b82f6', 
                  color: '#ffffff', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  letterSpacing: '0.5px'
                }}>
                  🚛 {payModal.record.vehicle?.registrationNumber || 'N/A'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span><strong>Vehicle:</strong> {payModal.record.vehicle?.name || payModal.record.vehicle?.model || 'Commercial Truck'}</span>
                <span><strong>Workshop:</strong> {payModal.record.vendorGarage || 'Authorized Workshop'}</span>
              </div>
              {payModal.record.tyreSerialNumber && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(148, 163, 184, 0.2)', fontSize: '11.5px', color: '#38bdf8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🛞 <strong>Tyre:</strong> {payModal.record.tyreBrand || 'Radial'} ({payModal.record.tyrePosition || 'Position'})</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>S/N: {payModal.record.tyreSerialNumber}</span>
                </div>
              )}
              {payModal.record.odometerReading && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  ⏱️ Odometer: {payModal.record.odometerReading.toLocaleString()} KM
                </div>
              )}
            </div>

            <form onSubmit={handlePaySubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Amount to Pay (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={payModal.amount} 
                  onChange={e => setPayModal(prev => ({ ...prev, amount: e.target.value }))}
                  required 
                  style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Payment Mode <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  className="form-control" 
                  value={payModal.paymentMode} 
                  onChange={e => setPayModal(prev => ({ ...prev, paymentMode: e.target.value }))}
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                  <option value="Bank Transfer">NEFT / RTGS / IMPS (Bank Transfer)</option>
                  <option value="Cash">Cash Voucher (Cash In Hand)</option>
                  <option value="Company Card">Company Debit/Credit Card</option>
                  <option value="Driver Advance">Deducted from Driver Advance</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Reference / Bill / UTR Number</label>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>⚡ Auto-Generated</span>
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. BILL-MH04AB1234-261015-8491"
                  value={payModal.referenceNumber} 
                  onChange={e => setPayModal(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc', letterSpacing: '0.5px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: '#334155', color: '#fff', padding: '10px', border: 'none', borderRadius: '8px' }}
                  onClick={() => setPayModal({ isOpen: false, record: null, amount: '', paymentMode: 'UPI', referenceNumber: '' })}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 700 }}
                >
                  Confirm & Debit Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceReport;
