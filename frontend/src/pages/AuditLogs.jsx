import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdSearch, 
  MdHistory, 
  MdRefresh, 
  MdFilterList, 
  MdArrowForward,
  MdAddCircleOutline,
  MdEditNote,
  MdDeleteOutline,
  MdSwapHoriz,
  MdCheckCircle,
  MdClear
} from 'react-icons/md';
import './AuditLogs.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/v1/audit', { headers });
      if (res.ok) {
        const data = await res.json();
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const entities = useMemo(() => {
    return ['ALL', ...Array.from(new Set(logs.map(l => l.entityName).filter(Boolean)))];
  }, [logs]);

  const getActionCategory = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE')) return 'DELETED';
    if (act.includes('EDIT') || act.includes('UPDATE') || act.includes('STATUS') || act.includes('CLOSED') || act.includes('NOTE') || act.includes('PAYMENT') || act.includes('UPLOAD') || act.includes('POD')) return 'EDITED';
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('AUTO_CREATED')) return 'CREATED';
    return 'OTHER';
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesEntity = entityFilter === 'ALL' || l.entityName === entityFilter;
      let matchesAction = true;
      if (actionFilter === 'ALL') {
        matchesAction = true;
      } else if (actionFilter === 'CREATED') {
        matchesAction = getActionCategory(l.action) === 'CREATED' || l.action === 'CREATED';
      } else if (actionFilter === 'EDITED') {
        matchesAction = getActionCategory(l.action) === 'EDITED' || l.action === 'EDITED';
      } else if (actionFilter === 'DELETED') {
        matchesAction = getActionCategory(l.action) === 'DELETED' || l.action === 'DELETED';
      } else {
        matchesAction = l.action === actionFilter;
      }
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || (
        String(l.entityId || '').toLowerCase().includes(search) ||
        String(l.action || '').toLowerCase().includes(search) ||
        String(l.entityName || '').toLowerCase().includes(search) ||
        String(l.actionBy || '').toLowerCase().includes(search) ||
        String(l.description || '').toLowerCase().includes(search) ||
        String(l.oldValue || '').toLowerCase().includes(search) ||
        String(l.newValue || '').toLowerCase().includes(search)
      );
      return matchesEntity && matchesAction && matchesSearch;
    });
  }, [logs, entityFilter, actionFilter, searchTerm]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [entityFilter, actionFilter, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    let display = action;
    let className = 'status';
    let Icon = MdSwapHoriz;

    if (act.includes('CREATE') || act.includes('ADD')) {
      className = 'created';
      Icon = MdAddCircleOutline;
      if (act === 'AUTO_CREATED_ON_DELIVERY') display = 'Auto Created';
      else if (act === 'PAYMENT_ADDED') display = 'Payment Added';
      else if (act === 'CREATED') display = 'Created';
      else display = action.replace(/_/g, ' ');
    } else if (act.includes('EDIT') || act.includes('UPDATE')) {
      className = 'edited';
      Icon = MdEditNote;
      if (act === 'EDITED') display = 'Edited';
      else display = action.replace(/_/g, ' ');
    } else if (act.includes('DELETE') || act.includes('REMOVE')) {
      className = 'deleted';
      Icon = MdDeleteOutline;
      if (act === 'DELETED') display = 'Deleted';
      else display = action.replace(/_/g, ' ');
    } else {
      display = action.replace(/_/g, ' ');
    }

    return (
      <span className={`action-pill ${className}`} title={action}>
        <Icon size={13} style={{ flexShrink: 0 }} />
        <span className="action-text">{display}</span>
      </span>
    );
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return { primary: '—', secondary: '' };
    try {
      const d = new Date(dateStr);
      const primary = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const secondary = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      return { primary, secondary };
    } catch {
      return { primary: dateStr, secondary: '' };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SYS';
    const clean = name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const createdCount = logs.filter(l => getActionCategory(l.action) === 'CREATED').length;
  const editedCount = logs.filter(l => getActionCategory(l.action) === 'EDITED').length;
  const deletedCount = logs.filter(l => getActionCategory(l.action) === 'DELETED').length;

  return (
    <div className="audit-page-wrapper">
      {/* Top Banner */}
      <div className="audit-header-banner">
        <div className="audit-title-area">
          <div className="audit-icon-box">
            <MdHistory size={26} />
          </div>
          <div>
            <h2>System Audit Trail</h2>
            <p>Complete historical log tracking every entity creation, modification, & deletion</p>
          </div>
        </div>

        <button 
          className="audit-refresh-btn" 
          onClick={fetchLogs} 
          disabled={loading}
        >
          <MdRefresh size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="audit-metrics-grid">
        <div 
          className={`audit-metric-card ${actionFilter === 'ALL' && entityFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => { setActionFilter('ALL'); setEntityFilter('ALL'); }}
        >
          <div className="metric-icon-bubble" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <MdHistory />
          </div>
          <div className="metric-info">
            <div className="metric-num">{logs.length}</div>
            <div className="metric-label">Total Activities</div>
          </div>
        </div>

        <div 
          className={`audit-metric-card ${actionFilter === 'CREATED' ? 'active' : ''}`}
          onClick={() => setActionFilter(actionFilter === 'CREATED' ? 'ALL' : 'CREATED')}
        >
          <div className="metric-icon-bubble" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <MdAddCircleOutline />
          </div>
          <div className="metric-info">
            <div className="metric-num">{createdCount}</div>
            <div className="metric-label">Created Items</div>
          </div>
        </div>

        <div 
          className={`audit-metric-card ${actionFilter === 'EDITED' ? 'active' : ''}`}
          onClick={() => setActionFilter(actionFilter === 'EDITED' ? 'ALL' : 'EDITED')}
        >
          <div className="metric-icon-bubble" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <MdEditNote />
          </div>
          <div className="metric-info">
            <div className="metric-num">{editedCount}</div>
            <div className="metric-label">Modifications</div>
          </div>
        </div>

        <div 
          className={`audit-metric-card ${actionFilter === 'DELETED' ? 'active' : ''}`}
          onClick={() => setActionFilter(actionFilter === 'DELETED' ? 'ALL' : 'DELETED')}
        >
          <div className="metric-icon-bubble" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <MdDeleteOutline />
          </div>
          <div className="metric-info">
            <div className="metric-num">{deletedCount}</div>
            <div className="metric-label">Deleted Items</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="audit-toolbar">
        <div className="audit-search-input-wrap">
          <MdSearch size={19} style={{ color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by user, entity, ref ID, action, description, values..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <MdClear 
              size={16} 
              style={{ color: '#94a3b8', cursor: 'pointer' }} 
              onClick={() => setSearchTerm('')} 
            />
          )}
        </div>

        <div className="audit-filters-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdFilterList size={18} style={{ color: '#94a3b8' }} />
            <select 
              className="audit-select"
              value={entityFilter} 
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              {entities.map(e => (
                <option key={e} value={e}>{e === 'ALL' ? 'All Entities' : e}</option>
              ))}
            </select>
          </div>

          <select 
            className="audit-select"
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="CREATED">Created</option>
            <option value="EDITED">Edited</option>
            <option value="DELETED">Deleted</option>
            <option value="STATUS_CHANGED">Status Changed</option>
          </select>

          {(searchTerm || entityFilter !== 'ALL' || actionFilter !== 'ALL') && (
            <button 
              className="audit-reset-link" 
              onClick={() => { setSearchTerm(''); setEntityFilter('ALL'); setActionFilter('ALL'); }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="audit-table-card">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>Date & Time</th>
              <th style={{ width: '17%' }}>User / Actor</th>
              <th style={{ width: '14%' }}>Entity & Ref</th>
              <th style={{ width: '14%' }}>Action</th>
              <th style={{ width: '22%' }}>Value Changes</th>
              <th style={{ width: '20%' }}>Event Summary</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                    {loading ? 'Fetching audit records...' : 'No matching audit records found'}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    {loading ? 'Please wait a moment' : 'Try adjusting your search keyword or selected filters'}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const time = formatTimestamp(log.timestamp);
                const hasDiff = Boolean(log.oldValue || log.newValue);

                return (
                  <tr key={log.id}>
                    {/* Date & Time */}
                    <td>
                      <div className="audit-timestamp">
                        <span className="time-primary">{time.primary}</span>
                        <span className="time-secondary">{time.secondary}</span>
                      </div>
                    </td>

                    {/* User / Actor */}
                    <td>
                      <div className="audit-user-cell">
                        <div className="user-avatar-initials">
                          {getInitials(log.actionBy)}
                        </div>
                        <span className="user-name-text" title={log.actionBy || 'SYSTEM'}>
                          {log.actionBy || 'SYSTEM'}
                        </span>
                      </div>
                    </td>

                    {/* Entity & Ref ID */}
                    <td>
                      <div className="entity-ref-box">
                        <span className="entity-tag" title={log.entityName}>
                          {log.entityName ? log.entityName.replace(/_/g, ' ') : 'General'}
                        </span>
                        {log.entityId && (
                          <span className="ref-id-tag" title={`Ref: #${log.entityId}`}>
                            #{log.entityId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Pill */}
                    <td>
                      {getActionBadge(log.action)}
                    </td>

                    {/* Changes (Old / New Stacked Cleanly without strike lines) */}
                    <td>
                      {hasDiff ? (
                        <div className="diff-container">
                          {log.oldValue && (
                            <div className="diff-box old" title={log.oldValue}>
                              <span className="diff-label">Old:</span>
                              <span className="diff-value">{log.oldValue}</span>
                            </div>
                          )}
                          {log.newValue && (
                            <div className="diff-box new" title={log.newValue}>
                              <span className="diff-label">New:</span>
                              <span className="diff-value">{log.newValue}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Event Description */}
                    <td>
                      <div className="audit-desc" title={log.description}>
                        {log.description || 'System operation executed successfully.'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="audit-pagination">
            <div>
              Showing <span style={{ color: '#f8fafc', fontWeight: 600 }}>{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
              </span> of{' '}
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{filteredLogs.length}</span> audit logs
            </div>

            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span style={{ padding: '0 8px', fontSize: '0.82rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
