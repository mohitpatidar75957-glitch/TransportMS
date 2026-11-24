import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet, MdLocalShipping, MdLocalGasStation, MdReceipt, MdFilterList } from 'react-icons/md';
import './Vehicles.css';

const ProfitLoss = () => {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); // Last day of current month
    return d.toISOString().split('T')[0];
  });
  
  const [summary, setSummary] = useState({ income: 0, expenses: 0, fuel: 0, profit: 0, margin: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rawTrips, setRawTrips] = useState([]);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawFuel, setRawFuel] = useState([]);
  const [rawPayroll, setRawPayroll] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripRes, expRes, fuelRes, payrollRes] = await Promise.all([
          fetch('/api/v1/fleet/trips'),
          fetch('/api/v1/finance/expenses'),
          fetch('/api/v1/resources/fuel'),
          fetch('/api/v1/hr/payroll')
        ]);
        
        if (tripRes.ok) setRawTrips(await tripRes.json());
        if (expRes.ok) setRawExpenses(await expRes.json());
        if (fuelRes.ok) setRawFuel(await fuelRes.json());
        if (payrollRes.ok) setRawPayroll(await payrollRes.json());
      } catch (err) {
        console.error("Failed to fetch P&L data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilter = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    
    let totalIncome = 0;
    let totalExp = 0;
    let totalFuel = 0;

    const monthGroups = {};
    const transactions = [];

    // Process Trips (Income)
    rawTrips.forEach(trip => {
      if (!trip.startDate) return;
      const tripDate = new Date(trip.startDate);
      if (tripDate >= from && tripDate <= to) {
        const amount = Number(trip.freightAmount) || 0;
        totalIncome += amount;
        
        const mKey = tripDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthGroups[mKey]) monthGroups[mKey] = { month: mKey, income: 0, expense: 0, sortDate: tripDate };
        monthGroups[mKey].income += amount;

        transactions.push({
          id: `TRP-${trip.id}`,
          date: tripDate,
          type: 'Income',
          category: 'Freight Revenue',
          desc: `Trip ${trip.route || 'N/A'} (${trip.clientName || 'Unknown'})`,
          amount: amount,
          icon: <MdLocalShipping style={{ color: '#2ed573' }} />
        });
      }
    });

    // Process General Expenses
    rawExpenses.forEach(exp => {
      if (!exp.date) return;
      const expDate = new Date(exp.date);
      if (expDate >= from && expDate <= to) {
        const amount = Number(exp.amount) || 0;
        totalExp += amount;
        
        const mKey = expDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthGroups[mKey]) monthGroups[mKey] = { month: mKey, income: 0, expense: 0, sortDate: expDate };
        monthGroups[mKey].expense += amount;

        transactions.push({
          id: `EXP-${exp.id}`,
          date: expDate,
          type: 'Expense',
          category: exp.category || 'General',
          desc: exp.description || 'Misc Expense',
          amount: amount,
          icon: <MdReceipt style={{ color: '#ff4757' }} />
        });
      }
    });

    // Process Fuel Expenses
    rawFuel.forEach(f => {
      if (!f.date) return;
      const fDate = new Date(f.date);
      if (fDate >= from && fDate <= to) {
        const amount = Number(f.totalAmount) || 0;
        totalFuel += amount;
        totalExp += amount;
        
        const mKey = fDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthGroups[mKey]) monthGroups[mKey] = { month: mKey, income: 0, expense: 0, sortDate: fDate };
        monthGroups[mKey].expense += amount;

        transactions.push({
          id: `FUEL-${f.id}`,
          date: fDate,
          type: 'Expense',
          category: 'Fuel',
          desc: `${f.liters}L @ ₹${f.rate} for ${f.vehicle?.registrationNumber || 'Unknown'}`,
          amount: amount,
          icon: <MdLocalGasStation style={{ color: '#ffa502' }} />
        });
      }
    });

    // Process Payroll (Salary)
    rawPayroll.forEach(p => {
      if (!p.monthYear || p.status !== 'Paid') return;
      
      // Parse MM/YYYY or YYYY-MM
      let pDate;
      if (p.monthYear.includes('/')) {
        const [m, y] = p.monthYear.split('/');
        pDate = new Date(`${y}-${m}-28`); // Estimate end of month
      } else {
        pDate = new Date(`${p.monthYear}-28`);
      }

      if (pDate >= from && pDate <= to) {
        const amount = Number(p.netPayable) || 0;
        totalExp += amount;
        
        const mKey = pDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthGroups[mKey]) monthGroups[mKey] = { month: mKey, income: 0, expense: 0, sortDate: pDate };
        monthGroups[mKey].expense += amount;

        transactions.push({
          id: `PAY-${p.id}`,
          date: pDate,
          type: 'Expense',
          category: 'Salary / Payroll',
          desc: `${p.employeeType} Salary (${p.monthYear})`,
          amount: amount,
          icon: <MdAccountBalanceWallet style={{ color: '#ff4757' }} />
        });
      }
    });

    const netProfit = totalIncome - totalExp;
    const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    setSummary({
      income: totalIncome,
      expenses: totalExp,
      fuel: totalFuel,
      profit: netProfit,
      margin: margin
    });

    // Sort transactions latest first
    transactions.sort((a, b) => b.date - a.date);
    setRecentTransactions(transactions.slice(0, 15)); // Top 15

    // Sort months chronologically
    const sortedMonths = Object.values(monthGroups).sort((a, b) => a.sortDate - b.sortDate);
    
    // Calculate max value for charting scale
    const maxVal = Math.max(...sortedMonths.map(m => Math.max(m.income, m.expense)), 1);
    
    setMonthlyData(sortedMonths.map(m => ({
      ...m,
      profit: m.income - m.expense,
      incomeHeight: `${(m.income / maxVal) * 100}%`,
      expenseHeight: `${(m.expense / maxVal) * 100}%`
    })));
  };

  useEffect(() => {
    if (!loading) {
      handleFilter();
    }
  }, [loading, fromDate, toDate, rawTrips, rawExpenses, rawFuel, rawPayroll]);

  return (
    <div className="vehicles-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="header-text">
          <h2>Profit & Loss</h2>
          <p>Real-time financial performance and analytics</p>
        </div>
        <div className="search-box" style={{ background: 'var(--panel-bg)', padding: '10px 15px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <MdFilterList color="var(--text-secondary)" size={20} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>From:</span>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>To:</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Loading financial data...</div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            <div className="panel" style={{ padding: '20px', borderTop: '4px solid #2ed573' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
                  <h3 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>₹{summary.income.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'rgba(46, 213, 115, 0.1)', padding: '10px', borderRadius: '50%' }}>
                  <MdTrendingUp size={24} color="#2ed573" />
                </div>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px', borderTop: '4px solid #ff4757' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Expenses</p>
                  <h3 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>₹{summary.expenses.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'rgba(255, 71, 87, 0.1)', padding: '10px', borderRadius: '50%' }}>
                  <MdTrendingDown size={24} color="#ff4757" />
                </div>
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Includes ₹{summary.fuel.toLocaleString()} Fuel
              </p>
            </div>

            <div className="panel" style={{ padding: '20px', borderTop: `4px solid ${summary.profit >= 0 ? '#3742fa' : '#ff4757'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Profit</p>
                  <h3 style={{ margin: 0, fontSize: '28px', color: summary.profit >= 0 ? '#3742fa' : '#ff4757' }}>
                    {summary.profit < 0 ? '-' : ''}₹{Math.abs(summary.profit).toLocaleString()}
                  </h3>
                </div>
                <div style={{ background: summary.profit >= 0 ? 'rgba(55, 66, 250, 0.1)' : 'rgba(255, 71, 87, 0.1)', padding: '10px', borderRadius: '50%' }}>
                  <MdAccountBalanceWallet size={24} color={summary.profit >= 0 ? '#3742fa' : '#ff4757'} />
                </div>
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: summary.profit >= 0 ? '#2ed573' : '#ff4757', fontWeight: 600 }}>{summary.margin}%</span> Profit Margin
              </p>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            {/* MONTHLY CHART */}
            <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>Monthly Performance</h3>
              
              {monthlyData.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No data for this period
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', flex: 1, paddingTop: '40px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', position: 'relative', minHeight: '200px' }}>
                  {monthlyData.map((data, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'flex-end', width: '60px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '150px', width: '100%' }}>
                        
                        {/* Income Bar */}
                        <div style={{ flex: 1, height: data.incomeHeight, backgroundColor: '#2ed573', borderRadius: '4px 4px 0 0', position: 'relative', minHeight: data.income > 0 ? '2px' : '0' }} title={`Income: ₹${data.income.toLocaleString()}`}>
                          <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'var(--text-secondary)' }}>
                            {data.income > 0 ? (data.income / 1000).toFixed(1) + 'k' : ''}
                          </span>
                        </div>
                        
                        {/* Expense Bar */}
                        <div style={{ flex: 1, height: data.expenseHeight, backgroundColor: '#ff4757', borderRadius: '4px 4px 0 0', position: 'relative', minHeight: data.expense > 0 ? '2px' : '0' }} title={`Expense: ₹${data.expense.toLocaleString()}`}>
                        <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'var(--text-secondary)' }}>
                            {data.expense > 0 ? (data.expense / 1000).toFixed(1) + 'k' : ''}
                          </span>
                        </div>

                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{data.month.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#2ed573', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#ff4757', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Expenses</span>
                </div>
              </div>
            </div>

            {/* LIVE TRANSACTIONS STREAM */}
            <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>Live Transactions Stream</h3>
              
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px' }}>
                {recentTransactions.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No transactions found.</p>
                ) : (
                  recentTransactions.map(tx => (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: tx.type === 'Income' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0
                        }}>
                          {tx.icon}
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.category}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {tx.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {tx.desc}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: tx.type === 'Income' ? '#2ed573' : '#ff4757' }}>
                          {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLoss;


