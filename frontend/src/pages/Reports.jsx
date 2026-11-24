import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdShowChart, MdSettingsSuggest, MdAttachMoney, 
  MdReceipt, MdLocalGasStation, MdTimeline, 
  MdPeople, MdBuild, MdChevronRight 
} from 'react-icons/md';
import './Vehicles.css';

const Reports = () => {
  const navigate = useNavigate();

  const financialReports = [
    {
      title: 'Profit & Loss Report',
      description: 'Overview of revenue vs operating expenses',
      icon: <MdAttachMoney size={20} />,
      color: '#2ed573',
      bg: 'rgba(46, 213, 115, 0.15)',
      link: '/profit-loss'
    },
    {
      title: 'Expense Analysis',
      description: 'Breakdown of costs by category and vehicle',
      icon: <MdReceipt size={20} />,
      color: '#ff4757',
      bg: 'rgba(255, 71, 87, 0.15)',
      link: '/reports/expenses'
    },
    {
      title: 'Fuel Efficiency Report',
      description: 'Tracking mileage and fuel consumption trends',
      icon: <MdLocalGasStation size={20} />,
      color: '#ffa502',
      bg: 'rgba(255, 165, 2, 0.15)',
      link: '/reports/fuel'
    }
  ];

  const operationalReports = [
    {
      title: 'Trip Performance',
      description: 'Completed vs Pending trips with driver details',
      icon: <MdTimeline size={20} />,
      color: '#70a1ff',
      bg: 'rgba(112, 161, 255, 0.15)',
      link: '/reports/trips'
    },
    {
      title: 'Attendance Report',
      description: 'Monthly driver presence and leave summary',
      icon: <MdPeople size={20} />,
      color: '#3742fa',
      bg: 'rgba(55, 66, 250, 0.15)',
      link: '/attendance'
    },
    {
      title: 'Vehicle Maintenance',
      description: 'History of repairs and spare parts used',
      icon: <MdBuild size={20} />,
      color: '#747d8c',
      bg: 'rgba(116, 125, 140, 0.15)',
      link: '/reports/maintenance'
    }
  ];

  const ReportListItem = ({ item }) => (
    <div 
      onClick={() => navigate(item.link)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 14px', 
        borderBottom: '1px solid var(--border-color)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
      }}
      className="report-list-item"
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        backgroundColor: item.bg, color: item.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '16px', flexShrink: 0
      }}>
        {item.icon}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{item.title}</h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{item.description}</p>
      </div>
      <MdChevronRight size={22} className="report-chevron" style={{ color: 'var(--text-secondary)', opacity: 0.6, transition: 'transform 0.2s ease, opacity 0.2s ease' }} />
    </div>
  );

  return (
    <div className="vehicles-container">

      {/* Main Content Area */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Analytics & Reports</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Generate and export business performance reports</p>
      </div>

      <div className="report-grid">
        {/* Financial Reports Panel */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <MdShowChart size={20} style={{ color: '#3742fa' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Financial Reports</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {financialReports.map((report, idx) => (
              <ReportListItem key={idx} item={report} />
            ))}
          </div>
        </div>

        {/* Operational Reports Panel */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <MdSettingsSuggest size={20} style={{ color: '#3742fa' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Operational Reports</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {operationalReports.map((report, idx) => (
              <ReportListItem key={idx} item={report} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Clean hover effect without layout shift or edge clipping */}
      <style>{`
        .report-list-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .report-list-item:hover .report-chevron {
          transform: translateX(4px);
          opacity: 1 !important;
          color: var(--accent-color) !important;
        }
        .report-list-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default Reports;


