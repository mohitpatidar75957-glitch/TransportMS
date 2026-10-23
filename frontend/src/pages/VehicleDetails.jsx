import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdInfoOutline, MdInsertDriveFile } from 'react-icons/md';
import './VehicleDetails.css';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Recent Trips');
  const [vehicle, setVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelHistory, setFuelHistory] = useState([]);
  const [loans, setLoans] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const dbId = id.startsWith('db-') ? id.replace('db-', '') : id;
        
        // Fetch Vehicle
        const vRes = await fetch(`/api/v1/fleet/vehicles/${dbId}`);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVehicle(vData);
        }

        // Fetch Trips
        const tRes = await fetch(`/api/v1/fleet/trips`);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTrips(tData.filter(t => t.vehicle && t.vehicle.id === Number(dbId)));
        }
        
        // Fetch Expenses
        const eRes = await fetch(`/api/v1/finance/expenses`);
        if (eRes.ok) {
          const eData = await eRes.json();
          setExpenses(eData.filter(e => e.vehicle && e.vehicle.id === Number(dbId)));
        }

        // Fetch Fuel
        const fRes = await fetch(`/api/v1/resources/fuel`);
        if (fRes.ok) {
          const fData = await fRes.json();
          setFuelHistory(fData.filter(f => f.vehicle && f.vehicle.id === Number(dbId)));
        }

        // Fetch Maintenance & Tyre records
        const mRes = await fetch(`/api/v1/fleet/vehicles/${dbId}/maintenance`);
        if (mRes.ok) {
          const mData = await mRes.json();
          setMaintenanceList(Array.isArray(mData) ? mData : []);
        }

        const lRes = await fetch(`/api/v1/finance/loans`);
        if (lRes.ok) {
          const lData = await lRes.json();
          setLoans(lData.filter(l => l.vehicle && l.vehicle.id === Number(dbId)));
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [id]);

  if (loading) {
    return <div style={{padding: '20px', color: 'white'}}>Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return <div style={{padding: '20px', color: 'white'}}>Vehicle not found!</div>;
  }

  return (
    <div className="vehicle-details-container">
      <div className="details-header">
        <div className="header-titles">
          <h2>{vehicle.registrationNumber}</h2>
          <p>{vehicle.name || 'Unknown'} | {vehicle.type || 'N/A'}</p>
        </div>
        <div className="header-actions">
          <button className="action-btn edit-btn">
            <MdEdit /> Edit
          </button>
          <button className="action-btn delete-btn">
            <MdDelete /> Delete
          </button>
        </div>
      </div>

      <div className="details-grid">
        {/* Left Column */}
        <div className="left-column">
          <div className="info-card">
            <div className="card-header">
              <MdInfoOutline className="card-icon" />
              <h3>Basic Information</h3>
            </div>
            <div className="card-content">
              <div className="info-group">
                <label>Vehicle Number</label>
                <p className="highlight">{vehicle.registrationNumber}</p>
              </div>
              <div className="info-group">
                <label>Owner Name</label>
                <p>{vehicle.ownership || 'Unknown'}</p>
              </div>
              <div className="info-row">
                <div className="info-group half">
                  <label>Model</label>
                  <p>{vehicle.model || 'N/A'}</p>
                </div>
                <div className="info-group half">
                  <label>Capacity</label>
                  <p>{vehicle.capacity || 'N/A'}</p>
                </div>
              </div>
              <div className="info-group">
                <label>Chassis / Engine</label>
                <p>C: {vehicle.chassisNumber || 'N/A'}<br/>E: {vehicle.engineNumber || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Status</label>
                <p className="notes-text">{vehicle.status || 'Active'}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <MdInsertDriveFile className="card-icon" />
              <h3>Documents Expiry</h3>
              <span className="add-doc-icon">+</span>
            </div>
            <div className="card-content no-padding">
              <ul className="doc-list">
                <li>
                  <span>Insurance</span>
                  <span className={`date-badge ${vehicle.insuranceExpiry ? 'valid' : 'invalid'}`}>{vehicle.insuranceExpiry || 'N/A'}</span>
                </li>
                <li>
                  <span>PUC</span>
                  <span className={`date-badge ${vehicle.pucExpiry ? 'valid' : 'invalid'}`}>{vehicle.pucExpiry || 'N/A'}</span>
                </li>
                <li>
                  <span>Permit</span>
                  <span className={`date-badge ${vehicle.permitExpiry ? 'valid' : 'invalid'}`}>{vehicle.permitExpiry || 'N/A'}</span>
                </li>
                <li>
                  <span>Fitness</span>
                  <span className={`date-badge ${vehicle.fitnessExpiry ? 'valid' : 'invalid'}`}>{vehicle.fitnessExpiry || 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="tabs-container panel">
            <div className="tabs-header">
              {['Recent Trips', 'Expenses', 'Fuel History', 'Maintenance & Tyres', 'Loan / EMI'].map(tab => (
                <button 
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="tab-content">
              {activeTab === 'Recent Trips' && (
                <table className="tab-table">
                  <thead>
                    <tr>
                      <th>TRIP #</th>
                      <th>DATE</th>
                      <th>ROUTE</th>
                      <th>FREIGHT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.length === 0 ? (
                      <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No recent trips found for this vehicle.</td></tr>
                    ) : (
                      trips.map(trip => (
                      <tr key={trip.id}>
                        <td className="link-text">{trip.tripNumber || `TRP-${trip.id}`}</td>
                        <td>{trip.startDate || 'N/A'}</td>
                        <td className="route-text">{trip.route || 'N/A'}</td>
                        <td>₹{trip.freightAmount || 0}</td>
                        <td>
                          <span className={`status-badge ${(trip.status || 'running').toLowerCase()}`}>
                            {trip.status || 'Running'}
                          </span>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Expenses' && (
                <table className="tab-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>CATEGORY</th>
                      <th>AMOUNT</th>
                      <th>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No expense records found for this vehicle.</td></tr>
                    ) : (
                      expenses.map((exp, idx) => (
                      <tr key={idx}>
                        <td>{exp.date}</td>
                        <td><span className="category-badge">{exp.category}</span></td>
                        <td>{exp.amount}</td>
                        <td>{exp.notes}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Fuel History' && (
                <table className="tab-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>LITERS</th>
                      <th>AMOUNT</th>
                      <th>ODOMETER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelHistory.length === 0 ? (
                      <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No fuel records found for this vehicle.</td></tr>
                    ) : (
                      fuelHistory.map((fuel, idx) => (
                      <tr key={idx}>
                        <td>{fuel.date}</td>
                        <td>{fuel.liters}</td>
                        <td>{fuel.amount}</td>
                        <td>{fuel.odometer}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Maintenance & Tyres' && (
                <table className="tab-table">
                  <thead>
                    <tr>
                      <th>SERVICE DATE</th>
                      <th>CATEGORY</th>
                      <th>TYRE / PART INFO</th>
                      <th>FITMENT ODOMETER</th>
                      <th>ROTATION / SERVICE DUE</th>
                      <th>COST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceList.length === 0 ? (
                      <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No maintenance or tyre records logged for this vehicle.</td></tr>
                    ) : (
                      maintenanceList.map((m, idx) => {
                        const curOdo = vehicle.currentOdometer || (vehicle.lastKnownOdometer || 0);
                        const isTyre = m.serviceType === 'Tyre Replacement' || !!m.tyrePosition;
                        const rotDueKm = m.tyreRotationDueKm || (m.odometerReading ? m.odometerReading + 10000 : null);
                        const kmToRot = rotDueKm && curOdo ? rotDueKm - curOdo : null;
                        const isAlert = kmToRot !== null && kmToRot <= 1000;

                        return (
                          <tr key={m.id || idx}>
                            <td>{m.serviceDate}</td>
                            <td>
                              <span className="category-badge" style={{ backgroundColor: isTyre ? '#f59e0b' : '#38bdf8' }}>
                                {m.serviceType}
                              </span>
                            </td>
                            <td>
                              {isTyre ? (
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ 
                                      backgroundColor: '#3b82f6', 
                                      color: '#fff', 
                                      padding: '2px 7px', 
                                      borderRadius: '4px', 
                                      fontSize: '11px', 
                                      fontWeight: 700 
                                    }}>
                                      {m.tyrePosition || 'Position N/A'}
                                    </span>
                                    <strong>{m.tyreBrand || 'Radial'}</strong>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                                    S/N: <span style={{ fontFamily: 'monospace', color: '#e2e8f0', fontWeight: 600 }}>{m.tyreSerialNumber || 'N/A'}</span>
                                    {m.currentTreadDepthMm && ` • Tread: ${m.currentTreadDepthMm}mm`}
                                  </div>
                                </div>
                              ) : (
                                <span>{m.notes || m.vendorGarage || 'Periodic service'}</span>
                              )}
                            </td>
                            <td>{m.odometerReading ? `${m.odometerReading.toLocaleString()} KM` : '—'}</td>
                            <td>
                              {isTyre && rotDueKm ? (
                                <div>
                                  <div style={{ fontWeight: 600, color: isAlert ? '#ef4444' : '#10b981' }}>
                                    {rotDueKm.toLocaleString()} KM
                                  </div>
                                  {curOdo > 0 && (
                                    <div style={{ 
                                      fontSize: '10.5px', 
                                      marginTop: '2px', 
                                      display: 'inline-block', 
                                      padding: '1px 5px', 
                                      borderRadius: '3px',
                                      backgroundColor: kmToRot <= 0 ? 'rgba(239, 68, 68, 0.2)' : kmToRot <= 1000 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                      color: kmToRot <= 0 ? '#ef4444' : kmToRot <= 1000 ? '#f59e0b' : '#10b981',
                                      fontWeight: 600
                                    }}>
                                      {kmToRot <= 0 ? `🚨 Overdue by ${Math.abs(kmToRot)} KM` : kmToRot <= 1000 ? `⚠️ Due in ${kmToRot} KM` : `In ${kmToRot} KM`}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: '#10b981', fontWeight: 600 }}>
                                  {m.nextServiceDate ? `${m.nextServiceDate} ${m.nextServiceKm ? `(~${m.nextServiceKm.toLocaleString()} KM)` : ''}` : '—'}
                                </span>
                              )}
                            </td>
                            <td style={{ color: '#ef4444', fontWeight: 600 }}>₹{parseFloat(m.cost || 0).toLocaleString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'Loan / EMI' && (
                <div className={loans.length === 0 ? "empty-state" : ""}>
                  {loans.length === 0 ? (
                    <p>No active loans for this vehicle.</p>
                  ) : (
                    <table className="tab-table">
                      <thead>
                        <tr>
                          <th>BANK NAME</th>
                          <th>LOAN AMOUNT</th>
                          <th>EMI AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map(loan => (
                          <tr key={loan.id}>
                            <td>{loan.bankName}</td>
                            <td>₹{loan.amount}</td>
                            <td>₹{loan.emiAmount}</td>
                            <td>
                              <span className={`status-badge ${loan.status ? loan.status.toLowerCase() : 'active'}`}>
                                {loan.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;


