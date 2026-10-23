import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountBalance, MdAdd } from 'react-icons/md';
import './Vehicles.css';

const Loans = () => {
  const navigate = useNavigate();
  const [dbLoans, setDbLoans] = useState([]);
  
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch('/api/v1/finance/loans');
        if (response.ok) {
          const data = await response.json();
          setDbLoans(data);
        }
      } catch (error) {
        console.error('Failed to fetch loans:', error);
      }
    };
    fetchLoans();
  }, []);

  const dummyLoans = [
    { id: 'L-1', vehicle: 'UP-16-BD-9012', account: 'LN98765432', bank: 'HDFC Bank', amount: 800000, emi: 25000, date: '10 Sep 2026', status: 'Active' },
    { id: 'L-2', vehicle: 'GJ-05-MM-1111', account: 'LN12345678', bank: 'Cholamandalam', amount: 1200000, emi: 32000, date: '15 Sep 2026', status: 'Active' }
  ];

  const allLoans = [
    ...dbLoans.map(loan => ({
      id: `DB-${loan.id}`,
      vehicle: `DB-V-${loan.id}`,
      account: `DB-A-${loan.id}`,
      bank: loan.bankName || 'Unknown',
      amount: loan.amount || 0,
      emi: loan.emiAmount || 0,
      date: loan.startDate || 'Unknown',
      status: loan.status || 'Active'
    })),
    ...dummyLoans
  ];

  const totalOutstanding = allLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalEmi = allLoans.reduce((sum, loan) => sum + loan.emi, 0);

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Vehicle Loans & EMI</h2>
          <p>Track your active vehicle loans and upcoming EMI payments</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/loans/create')}>
          <MdAdd size={20} />
          Add New Loan
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #e74c3c' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Outstanding</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹ {totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #fbc531' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Upcoming EMI (This Month)</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹ {totalEmi.toLocaleString()}</p>
        </div>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>VEHICLE / LOAN A/C</th>
              <th>FINANCIER</th>
              <th>LOAN AMOUNT</th>
              <th>EMI AMOUNT</th>
              <th>NEXT DUE DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {allLoans.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No loans found.</td>
              </tr>
            ) : (
              allLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <div className="vehicle-info">
                      <span className="vehicle-num">{loan.vehicle}</span>
                      <span className="vehicle-name">A/C: {loan.account}</span>
                    </div>
                  </td>
                  <td>{loan.bank}</td>
                  <td>₹ {Number(loan.amount).toLocaleString()}</td>
                  <td style={{ fontWeight: 'bold', color: '#e74c3c' }}>₹ {Number(loan.emi).toLocaleString()}</td>
                  <td>{loan.date}</td>
                  <td><span className={`status-badge ${(loan.status || 'Active').toLowerCase()}`}>{loan.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Loans;


