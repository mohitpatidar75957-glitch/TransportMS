import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdPerson, MdAssignment } from 'react-icons/md';
import './VehicleDetails.css'; // Reusing details layout styles

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Trip History');

  const driver = {
    id: id,
    name: id === '1' ? 'Rakesh Dalai' : `TEST-DRV-${id}`,
    mobile: '+91 9876543210',
    license: 'DL-14-2015-1234567',
    licenseExpiry: '31 Dec 2028',
    aadhar: 'xxxx-xxxx-1234',
    address: 'New Delhi, DL',
    bloodGroup: 'O+',
    assignedVehicle: 'UP-16-BD-9012',
    status: 'Active',
    joinDate: '01 Sep 2026',
    salaryType: 'Monthly Fixed',
    salaryAmount: '₹18,000'
  };

  const trips = [
    { id: 'TRP-1050', date: '25 Aug 2026', route: 'Delhi → Mumbai', vehicle: 'UP-16-BD-9012', status: 'Completed' },
    { id: 'TRP-1062', date: '01 Sep 2026', route: 'Mumbai → Pune', vehicle: 'UP-16-BD-9012', status: 'Completed' }
  ];

  const salaries = [
    { month: 'August 2026', basic: '₹18,000', tripBonus: '₹2,500', deductions: '₹500', netPay: '₹20,000', status: 'Paid' },
    { month: 'July 2026', basic: '₹18,000', tripBonus: '₹1,200', deductions: '₹0', netPay: '₹19,200', status: 'Paid' }
  ];

  return (
    <div className="vehicle-details-container">
      <div className="details-header">
        <div className="header-titles">
          <h2>{driver.name}</h2>
          <p>Driver | ID: {driver.id}</p>
        </div>
        <div className="header-actions">
          <button className="action-btn edit-btn" onClick={() => navigate(`/drivers/${id}/edit`)}>
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
              <MdPerson className="card-icon" />
              <h3>Personal Information</h3>
            </div>
            <div className="card-content">
              <div className="info-group">
                <label>Mobile Number</label>
                <p className="highlight">{driver.mobile}</p>
              </div>
              <div className="info-row">
                <div className="info-group half">
                  <label>Blood Group</label>
                  <p>{driver.bloodGroup}</p>
                </div>
                <div className="info-group half">
                  <label>Join Date</label>
                  <p>{driver.joinDate}</p>
                </div>
              </div>
              <div className="info-group">
                <label>Address</label>
                <p>{driver.address}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <MdAssignment className="card-icon" />
              <h3>Employment & Documents</h3>
            </div>
            <div className="card-content">
              <div className="info-group">
                <label>Assigned Vehicle</label>
                <p className="highlight link-text">{driver.assignedVehicle}</p>
              </div>
              <div className="info-row">
                <div className="info-group half">
                  <label>Salary Basis</label>
                  <p>{driver.salaryType}</p>
                </div>
                <div className="info-group half">
                  <label>Rate / Amount</label>
                  <p>{driver.salaryAmount}</p>
                </div>
              </div>
            </div>
            <div className="card-content no-padding">
              <ul className="doc-list">
                <li>
                  <span>License ({driver.license})</span>
                  <span className="date-badge valid">Exp: {driver.licenseExpiry}</span>
                </li>
                <li>
                  <span>Aadhar Card</span>
                  <span className="date-badge valid">Verified</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="tabs-container panel">
            <div className="tabs-header">
              {['Trip History', 'Salary Payments', 'Attendance'].map(tab => (
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
              {activeTab === 'Trip History' && (
                <table className="tab-table">
                  <thead>
                    <tr>
                      <th>TRIP #</th>
                      <th>DATE</th>
                      <th>ROUTE</th>
                      <th>VEHICLE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(trip => (
                      <tr key={trip.id}>
                        <td className="link-text">{trip.id}</td>
                        <td>{trip.date}</td>
                        <td className="route-text">{trip.route}</td>
                        <td>{trip.vehicle}</td>
                        <td>
                          <span className={`status-badge ${trip.status.toLowerCase()}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Salary Payments' && (
                <table className="tab-table">
                  <thead>
                    <tr>
                      <th>MONTH</th>
                      <th>BASIC PAY</th>
                      <th>TRIP BONUS</th>
                      <th>DEDUCTIONS</th>
                      <th>NET PAY</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map((sal, idx) => (
                      <tr key={idx}>
                        <td>{sal.month}</td>
                        <td>{sal.basic}</td>
                        <td>{sal.tripBonus}</td>
                        <td style={{color: '#ff4757'}}>{sal.deductions}</td>
                        <td style={{fontWeight: 600}}>{sal.netPay}</td>
                        <td>
                           <span className="status-badge active">{sal.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Attendance' && (
                <div className="empty-state">
                  <p>No attendance records available for this month.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;


