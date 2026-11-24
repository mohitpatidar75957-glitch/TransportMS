import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdVisibility, MdDeleteOutline } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';

const ContactMessages = () => {
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();

  const defaultMessages = [
    { 
      id: 'mock-1',
      date: '11 Aug 2026, 04:45 PM', 
      sender: 'Nagesh Tondare', 
      email: 'tondaretransport@gmail.com', 
      subject: 'New contact request from website', 
      status: 'Read' 
    }
  ];

  const [messages, setMessages] = useState(defaultMessages);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/v1/management/contact-messages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(m => ({
            id: `db-${m.id}`,
            dbId: m.id,
            sender: m.name || m.senderName || 'Anonymous Sender',
            email: m.email || m.senderEmail || 'N/A',
            subject: m.subject || 'Website Inquiry',
            status: m.status || 'Unread',
            date: m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '11 Aug 2026, 04:45 PM'
          }));
          setMessages(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = (id, senderName) => {
    showConfirm(
      'Delete Contact Message',
      `Are you sure you want to delete the message from "${senderName || 'this sender'}"?`,
      async () => {
        if (String(id).startsWith('db-')) {
          const dbId = id.replace('db-', '');
          try {
            const res = await fetch(`/api/v1/management/contact-messages/${dbId}`, { method: 'DELETE' });
            if (res.ok) {
              setMessages(prev => prev.filter(m => m.id !== id));
              showAlert('Message deleted successfully.');
            } else {
              showAlert('Failed to delete message from database.');
            }
          } catch (err) {
            console.error('Error deleting message:', err);
            showAlert('Error connecting to backend database.');
          }
        } else {
          setMessages(prev => prev.filter(m => m.id !== id));
          showAlert('Message deleted successfully.');
        }
      }
    );
  };

  return (
    <div className="vehicles-container">
      <div className="panel" style={{ padding: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <MdEmail size={20} style={{ color: '#0984e3' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Website Contact Messages</h3>
        </div>

        <div style={{ padding: '0' }}>
          {messages.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No contact messages found.
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="contact-msg-card" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div className="flex-between-responsive">
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{msg.sender}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', wordBreak: 'break-all' }}>{msg.email}</div>
                  </div>
                  <span style={{ 
                    backgroundColor: 'var(--border-color)', 
                    color: 'var(--text-primary)', 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    alignSelf: 'flex-start'
                  }}>
                    {msg.status}
                  </span>
                </div>

                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>SUBJECT</div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{msg.subject}</div>
                </div>

                <div className="flex-between-responsive" style={{ marginTop: '4px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {msg.date}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => navigate(`/contact-messages/${msg.id}`)}
                      style={{ 
                        backgroundColor: 'transparent', 
                        border: '1px solid #0984e3', 
                        color: '#0984e3', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <MdVisibility size={14} /> View
                    </button>
                    <button 
                      onClick={() => handleDelete(msg.id, msg.sender)}
                      title="Delete Message"
                      style={{ 
                        backgroundColor: 'transparent', 
                        border: '1px solid #e74c3c', 
                        color: '#e74c3c', 
                        padding: '6px 8px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <MdDeleteOutline size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;


