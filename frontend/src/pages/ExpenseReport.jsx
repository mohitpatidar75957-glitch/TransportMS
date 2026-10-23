import React, { useState, useEffect } from 'react';
import './Vehicles.css';

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [filterFlaggedOnly, setFilterFlaggedOnly] = useState(false);

  useEffect(() => {
    fetch('/api/v1/finance/expenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(Array.isArray(data) ? data : []);
        const sum = (Array.isArray(data) ? data : []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setTotal(sum);
      })
      .catch(err => console.error(err));
  }, []);

  const flaggedCount = expenses.filter(e => e.isFlagged).length;
  const displayedExpenses = filterFlaggedOnly ? expenses.filter(e => e.isFlagged) : expenses;

  return (
    <div className="vehicles-container">
      <div className="panel" style={{ padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Expense Analysis & Anomaly Report</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Review all cost vouchers and red-flagged anomalies</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={() => setFilterFlaggedOnly(!filterFlaggedOnly)}
              style={{
                backgroundColor: filterFlaggedOnly ? '#ff4757' : 'rgba(255, 71, 87, 0.15)',
                color: filterFlaggedOnly ? '#fff' : '#ff4757',
                border: '1px solid #ff4757',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🚨 {filterFlaggedOnly ? 'Show All Expenses' : `Show Red Flags Only (${flaggedCount})`}
            </button>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#e74c3c' }}>
              Total: ₹{total.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ padding: '0' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>DATE</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>TITLE</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>CATEGORY</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>AMOUNT</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>VEHICLE</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>AUDIT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {displayedExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {filterFlaggedOnly ? '🎉 No red-flagged anomalies found!' : 'No expense records found.'}
                  </td>
                </tr>
              ) : (
                displayedExpenses.map((expense, index) => (
                  <tr key={expense.id || index} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: expense.isFlagged ? 'rgba(255, 71, 87, 0.05)' : (index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)') }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '13px' }}>{expense.date || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '13px', textTransform: 'uppercase' }}>{expense.title || expense.description}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>{expense.category}</td>
                    <td style={{ padding: '16px 24px', color: expense.isFlagged ? '#ff4757' : '#e74c3c', fontSize: '14px', fontWeight: 600 }}>₹{Number(expense.amount).toLocaleString()}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>{expense.vehicle ? expense.vehicle.registrationNumber : 'N/A'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '12px' }}>
                      {expense.isFlagged ? (
                        <span 
                          title={expense.flagReason}
                          style={{ backgroundColor: '#ff4757', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'help' }}
                        >
                          🚨 RED FLAG
                        </span>
                      ) : (
                        <span style={{ color: '#2ed573', fontWeight: 500 }}>
                          ✅ Normal
                        </span>
                      )}
                    </td>
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

export default ExpenseReport;
