import React, { useState, useEffect } from 'react';
import './Vehicles.css';

const TripReport = () => {
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({
    totalTrips: 0,
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/fleet/trips').then(res => res.json()).catch(() => []),
      fetch('/api/v1/finance/expenses').then(res => res.json()).catch(() => [])
    ])
      .then(([rawTrips, rawExpenses]) => {
        const tripsData = Array.isArray(rawTrips) ? rawTrips : [];
        const expensesData = Array.isArray(rawExpenses) ? rawExpenses : [];
        
        const expensesByTrip = expensesData.reduce((acc, exp) => {
          if (exp && exp.trip && exp.trip.id) {
            acc[exp.trip.id] = (acc[exp.trip.id] || 0) + (Number(exp.amount) || 0);
          }
          return acc;
        }, {});

        const tripsWithExpenses = tripsData.map(trip => ({
          ...trip,
          totalExpenses: expensesByTrip[trip.id] || 0
        }));

        setTrips(tripsWithExpenses);
        
        const income = tripsWithExpenses.reduce((acc, curr) => acc + (Number(curr.freightAmount) || 0), 0);
        const expense = tripsWithExpenses.reduce((acc, curr) => acc + (Number(curr.totalExpenses) || 0), 0);
        
        setSummary({
          totalTrips: tripsWithExpenses.length,
          totalIncome: income,
          totalExpense: expense,
          netProfit: income - expense
        });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="vehicles-container">
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 24px 0' }}>Trip Summary</h3>
        
        {/* Summary Cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Trips</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{summary.totalTrips}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Income</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2ed573' }}>₹{summary.totalIncome.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Expense</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e74c3c' }}>₹{summary.totalExpense.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Net Profit</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0984e3' }}>₹{summary.netProfit.toLocaleString()}</div>
          </div>
        </div>

        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>TRIP #</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>VEHICLE</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>ROUTE</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>FREIGHT</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>EXPENSE</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>PROFIT</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, index) => (
              <tr key={trip.id || index} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>{trip.tripNumber || `TRP-${String(trip.id).padStart(5, '0')}`}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>{trip.vehicle ? trip.vehicle.registrationNumber : 'N/A'}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>
                  {trip.route || 'N/A'}
                </td>
                <td style={{ padding: '16px 24px', color: '#2ed573', fontSize: '13px' }}>₹{Number(trip.freightAmount || 0).toLocaleString()}</td>
                <td style={{ padding: '16px 24px', color: '#e74c3c', fontSize: '13px' }}>₹{Number(trip.totalExpenses || 0).toLocaleString()}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                  ₹{Number((trip.freightAmount || 0) - (trip.totalExpenses || 0)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripReport;


