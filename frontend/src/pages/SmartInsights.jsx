import React, { useState, useEffect } from 'react';
import { MdShowChart, MdReceipt, MdWarning, MdInsights } from 'react-icons/md';

const SmartInsights = () => {
  const [activeTab, setActiveTab] = useState('loss_routes'); // 'loss_routes', 'unpaid_invoices', 'expiring_docs'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchInsights = (query) => {
    setLoading(true);
    fetch(`/api/v1/smart-query?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData.data || []);
        setMessage(resData.message || '');
        if (resData.totalAmount) setTotalAmount(resData.totalAmount);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'loss_routes') fetchInsights('Which routes lost money last month?');
    else if (activeTab === 'unpaid_invoices') fetchInsights('Show unpaid invoices');
    else if (activeTab === 'expiring_docs') fetchInsights('Vehicles with expiring documents');
  }, [activeTab]);

  return (
    <div className="notifications-container">
      <div className="panel" style={{ minHeight: '80vh', padding: '24px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6', padding: '12px', borderRadius: '12px' }}>
            <MdInsights size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-primary)' }}>Business & Fleet Insights</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Automated analysis of your trips and accounts</p>
          </div>
        </div>

        {/* Top Options / Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          
          <button 
            onClick={() => setActiveTab('loss_routes')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
              borderRadius: '8px', cursor: 'pointer', border: 'none',
              backgroundColor: activeTab === 'loss_routes' ? 'rgba(255, 71, 87, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'loss_routes' ? '#ff4757' : '#a4b0be',
              fontWeight: activeTab === 'loss_routes' ? 'bold' : 'normal',
              border: activeTab === 'loss_routes' ? '1px solid rgba(255, 71, 87, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <MdShowChart size={20} /> Loss Making Routes
          </button>

          <button 
            onClick={() => setActiveTab('unpaid_invoices')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
              borderRadius: '8px', cursor: 'pointer', border: 'none',
              backgroundColor: activeTab === 'unpaid_invoices' ? 'rgba(255, 165, 2, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'unpaid_invoices' ? '#ffa502' : '#a4b0be',
              fontWeight: activeTab === 'unpaid_invoices' ? 'bold' : 'normal',
              border: activeTab === 'unpaid_invoices' ? '1px solid rgba(255, 165, 2, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <MdReceipt size={20} /> Unpaid Invoices
          </button>

          <button 
            onClick={() => setActiveTab('expiring_docs')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
              borderRadius: '8px', cursor: 'pointer', border: 'none',
              backgroundColor: activeTab === 'expiring_docs' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'expiring_docs' ? '#2ed573' : '#a4b0be',
              fontWeight: activeTab === 'expiring_docs' ? 'bold' : 'normal',
              border: activeTab === 'expiring_docs' ? '1px solid rgba(46, 213, 115, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <MdWarning size={20} /> Expiring Documents
          </button>

        </div>

        {/* Content Area */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', minHeight: '300px' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-primary)', marginBottom: '20px', fontSize: '16px', fontWeight: '500' }}>{message}</h3>
          
          {loading ? (
             <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading insights from database...</div>
          ) : (
            <div>
              {/* 1. Loss Routes List */}
              {activeTab === 'loss_routes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.length === 0 && <div style={{ color: '#2ed573', padding: '20px', backgroundColor: 'rgba(46, 213, 115, 0.1)', borderRadius: '8px', borderLeft: '4px solid #2ed573' }}>Awesome! No trips are running in loss right now.</div>}
                  {data.map((r, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ff4757', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}>Trip: {r.tripNo} <span style={{ color: '#888', fontWeight: 'normal', fontSize: '14px', marginLeft: '8px' }}>({r.route})</span></div>
                        <div style={{ fontSize: '14px', color: '#a4b0be' }}>Freight Amount: <strong style={{color: '#fff'}}>₹{r.freight}</strong> <span style={{margin: '0 8px'}}>|</span> Total Expenses: <strong style={{color: '#ff4757'}}>₹{r.expense}</strong></div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Net Loss</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4757' }}>- ₹{r.loss}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Unpaid Invoices */}
              {activeTab === 'unpaid_invoices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', padding: '20px', backgroundColor: 'rgba(255, 165, 2, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 165, 2, 0.2)' }}>
                    <div style={{ backgroundColor: 'rgba(255, 165, 2, 0.2)', color: '#ffa502', padding: '16px', borderRadius: '50%' }}>
                      <MdReceipt size={32} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Outstanding Amount</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffa502' }}>₹{totalAmount}</div>
                      <div style={{ fontSize: '13px', color: '#a4b0be', marginTop: '4px' }}>From {data.length} pending invoices</div>
                    </div>
                  </div>
                  
                  {data.length === 0 && <div style={{ color: '#2ed573', padding: '20px' }}>All invoices are paid!</div>}
                  
                  {data.map((inv, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '16px', color: '#fff', fontWeight: '500' }}>{inv.client}</div>
                      <div style={{ fontSize: '16px', color: '#ffa502', fontWeight: 'bold' }}>₹{inv.amount} Due</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 3. Expiring Docs */}
              {activeTab === 'expiring_docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.length === 0 && <div style={{ color: '#2ed573', padding: '20px', backgroundColor: 'rgba(46, 213, 115, 0.1)', borderRadius: '8px', borderLeft: '4px solid #2ed573' }}>No documents expiring in the next 30 days.</div>}
                  {data.map((d, i) => (
                    <div key={i} style={{ padding: '16px', backgroundColor: 'rgba(255, 71, 87, 0.05)', borderLeft: '4px solid #ff4757', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4757' }}>{d.vehicle}</div>
                      <div style={{ fontSize: '14px', color: '#a4b0be' }}>{d.docType} expires on <span style={{ color: '#fff', fontWeight: 'bold', marginLeft: '6px' }}>{d.expiry}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;
