import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountBalanceWallet, MdAdd } from 'react-icons/md';
import './Vehicles.css';

const CashBank = () => {
  const navigate = useNavigate();
  const [dbTransactions, setDbTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/v1/finance/transactions');
        if (response.ok) {
          const data = await response.json();
          setDbTransactions(data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };
    fetchTransactions();
  }, []);

  const dummyTxns = [
    { id: 'T-1', date: '02 Sep 2026', account: 'HDFC Current A/C', particulars: 'Payment from Reliance Ind.', type: 'Credit', amount: 22000, balance: 545200 },
    { id: 'T-2', date: '01 Sep 2026', account: 'Cash Account', particulars: 'Driver Advance - TRP-1065', type: 'Debit', amount: 5000, balance: 42500 }
  ];

  const allTxns = [
    ...dbTransactions.map(t => ({
      id: `DB-${t.id}`,
      date: t.date || 'Unknown',
      account: 'Database Account', // Fallback
      particulars: t.description || 'No description',
      type: t.type || 'Credit',
      amount: t.amount || 0,
      balance: 0 // Cannot compute easily without starting balance
    })),
    ...dummyTxns
  ];

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Cash & Bank Accounts</h2>
          <p>Manage company bank accounts and cash in hand</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/cash-bank/create')}>
          <MdAdd size={20} />
          Add Transaction
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #3498db' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Bank Balance</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹ 5,45,200</p>
        </div>
        <div className="panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid #fbc531' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Cash in Hand</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>₹ 42,500</p>
        </div>
      </div>

      <div className="table-container panel">
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Recent Transactions</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>ACCOUNT</th>
              <th>PARTICULARS</th>
              <th>TYPE</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
              <th style={{ textAlign: 'right' }}>BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {allTxns.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No transactions found.</td>
              </tr>
            ) : (
              allTxns.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.date}</td>
                  <td>{txn.account}</td>
                  <td>{txn.particulars}</td>
                  <td>
                    <span 
                      className={`status-badge ${txn.type.toLowerCase() === 'credit' ? 'active' : 'inactive'}`} 
                      style={{ 
                        backgroundColor: txn.type.toLowerCase() === 'credit' ? 'rgba(76,209,55,0.1)' : 'rgba(231,76,60,0.1)', 
                        color: txn.type.toLowerCase() === 'credit' ? '#4cd137' : '#e74c3c' 
                      }}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: txn.type.toLowerCase() === 'credit' ? '#4cd137' : '#e74c3c' }}>
                    {txn.type.toLowerCase() === 'credit' ? '+' : '-'} ₹ {Number(txn.amount).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹ {Number(txn.balance || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashBank;


