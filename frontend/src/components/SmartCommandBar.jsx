import React from 'react';
import { useNavigate } from 'react-router-dom';

const SmartCommandBar = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button 
        onClick={() => navigate('/smart-insights')}
        className="icon-btn" 
        style={{ 
          background: 'none',
          border: 'none',
          padding: '6px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#334155',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-color, #f1f5f9)';
          e.currentTarget.style.color = '#0f172a';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#334155';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Analytics & Insights"
      >
        {/* Exact Clean Analytics Vector Icon (4 Pill Rounded Bars + Smooth Connected Trend Line) */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          style={{ display: 'block' }}
        >
          {/* 4 Pill Rounded Vertical Bars */}
          <rect x="2" y="14" width="2.8" height="8" rx="1.4" fill="currentColor" />
          <rect x="7" y="11" width="2.8" height="11" rx="1.4" fill="currentColor" />
          <rect x="12" y="13.5" width="2.8" height="8.5" rx="1.4" fill="currentColor" />
          <rect x="17" y="7.5" width="3" height="14.5" rx="1.5" fill="currentColor" />

          {/* Connected Trend Line */}
          <polyline 
            points="3.4,10 8.4,7.5 13.4,10.2 19,3" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Circular Nodes on the Trend Line */}
          <circle cx="3.4" cy="10" r="1.3" fill="currentColor" />
          <circle cx="8.4" cy="7.5" r="1.3" fill="currentColor" />
          <circle cx="13.4" cy="10.2" r="1.3" fill="currentColor" />
          <circle cx="19" cy="3" r="1.4" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

export default SmartCommandBar;
