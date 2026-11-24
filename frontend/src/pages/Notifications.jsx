import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdNotificationsOff, MdDoneAll } from 'react-icons/md';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [docAlerts, setDocAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/centralized').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setDocAlerts(data.documentAlerts || []);
        const sysNotifs = data.systemAlerts || [];
        sysNotifs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotifications(sysNotifs);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const unreadSysCount = notifications.filter(n => !n.read).length;
  const totalAlerts = unreadSysCount + docAlerts.length;

  return (
    <div className="notifications-page">
      <div className="notification-page-card">
        <div className="notification-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="notification-page-title">
              <MdNotifications style={{ color: '#f59e0b' }} /> Notification Center
            </div>
            <div className="notification-page-subtitle">You have {totalAlerts} active alert(s)</div>
          </div>
          {unreadSysCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="mark-read-btn" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#3b82f6', color: '#fff', borderColor: '#3b82f6' }}
            >
              <MdDoneAll size={16} /> Mark All as Read
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="notification-page-body">
            <p>Loading notifications...</p>
          </div>
        ) : (notifications.length === 0 && docAlerts.length === 0) ? (
          <div className="notification-page-body">
            <div className="empty-notification-circle">
              <MdNotificationsOff size={48} color="#94a3b8" />
            </div>
            <h3>All Caught Up!</h3>
            <p>
              There are no pending alerts or notifications in your inbox.
            </p>
          </div>
        ) : (
          <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Document Expiry Alerts Section */}
            {docAlerts.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#d97706', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  ⚠️ Pending Document Expiries ({docAlerts.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {docAlerts.map((alert, idx) => (
                    <div 
                      key={`doc-${idx}`}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '8px',
                        border: '1px solid ' + (alert.type === 'danger' ? '#fecaca' : '#fed7aa'),
                        borderLeft: `4px solid ${alert.type === 'danger' ? '#ef4444' : '#f59e0b'}`,
                        backgroundColor: alert.type === 'danger' ? '#fef2f2' : '#fffbeb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: alert.type === 'danger' ? '#991b1b' : '#92400e' }}>{alert.title}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>{alert.message}</p>
                      </div>
                      {alert.targetUrl && (
                        <button 
                          onClick={() => navigate(alert.targetUrl)}
                          className="mark-read-btn"
                          style={{ 
                            backgroundColor: alert.type === 'danger' ? '#ef4444' : '#f59e0b', 
                            borderColor: alert.type === 'danger' ? '#ef4444' : '#f59e0b',
                            color: '#ffffff' 
                          }}
                        >
                          Update Document
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Notifications Section */}
            {notifications.length > 0 && (
              <div>
                <h4 style={{ color: '#64748b', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  🔔 System Activity & Alerts ({unreadSysCount} Unread)
                </h4>
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div>
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <small>{new Date(notification.date).toLocaleString()}</small>
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mark-read-btn"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
