import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdEmail, MdArrowBack, MdReply, MdDeleteOutline, MdPhone, MdMailOutline } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';

const ContactMessageDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert, showConfirm } = useModal();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (id === 'mock-1') {
          setMessage({
            id: 'mock-1',
            sender: 'Nagesh Tondare',
            email: 'tondaretransport@gmail.com',
            phone: '+91 98765 43210',
            date: '11 Aug 2026',
            time: '04:45 PM',
            company: 'Tondare Transport Logistics',
            fleetSize: '25 Trucks',
            teamSize: '40 Drivers & Staff',
            subject: 'New contact request from website',
            body: 'Hello Team, We are looking for an integrated Fleet & Transport Management solution to manage our interstate routes, e-way bills, fastag tracking and trip billing. Please share your commercial quote and arrange a product demonstration.'
          });
          setLoading(false);
          return;
        }

        const res = await fetch('/api/v1/management/contact-messages');
        if (res.ok) {
          const data = await res.json();
          const dbId = String(id).replace('db-', '');
          const found = data.find(m => String(m.id) === dbId || String(m.id) === String(id));
          if (found) {
            setMessage({
              id: found.id,
              sender: found.senderName || found.name || 'Anonymous Sender',
              email: found.email || found.senderEmail || 'N/A',
              phone: found.phone || found.mobile || 'N/A',
              date: (found.dateReceived || found.createdAt) ? new Date(found.dateReceived || found.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
              time: (found.dateReceived || found.createdAt) ? new Date(found.dateReceived || found.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
              company: found.company || 'N/A',
              fleetSize: found.fleetSize || 'N/A',
              teamSize: found.teamSize || 'N/A',
              subject: found.subject || 'Website Inquiry',
              body: found.messageBody || found.message || 'No Content'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching message details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDelete = () => {
    showConfirm(
      'Delete Contact Message',
      'Are you sure you want to delete this message?',
      async () => {
        if (String(id).startsWith('db-')) {
          const dbId = id.replace('db-', '');
          try {
            const res = await fetch(`/api/v1/management/contact-messages/${dbId}`, { method: 'DELETE' });
            if (res.ok) {
              showAlert('Message deleted successfully.');
              navigate('/contact-messages');
            } else {
              showAlert('Failed to delete message from database.');
            }
          } catch (err) {
            console.error('Error deleting message:', err);
            showAlert('Error connecting to backend database.');
          }
        } else {
          showAlert('Message deleted successfully.');
          navigate('/contact-messages');
        }
      }
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading message details...</div>;
  }

  if (!message) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Message not found.</p>
        <button onClick={() => navigate('/contact-messages')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="vehicles-container" style={{ width: '100%', maxWidth: '100%', padding: '24px 32px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        
        {/* Panel Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdEmail size={22} style={{ color: '#0984e3' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Message Details</h3>
          </div>
        </div>

        {/* Message Content */}
        <div style={{ padding: '24px' }}>
          
          {/* Top Section: Sender Info and Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>SENDER INFORMATION</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{message.sender}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0984e3', fontSize: '14px', marginBottom: '4px' }}>
                <MdMailOutline size={16} color="var(--text-secondary)" />
                <a href={`mailto:${message.email}`} style={{ color: '#0984e3', textDecoration: 'none' }}>{message.email}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <MdPhone size={16} />
                {message.phone}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>DATE RECEIVED</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{message.date}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{message.time}</div>
            </div>
          </div>

          {/* Middle Section: Company Info Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>COMPANY</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{message.company}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>FLEET SIZE</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{message.fleetSize}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>TEAM SIZE</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{message.teamSize}</div>
            </div>
          </div>

          {/* Bottom Section: Message Body */}
          <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Subject: {message.subject}
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
              {message.body}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              onClick={() => window.location.href = `mailto:${message.email}`}
              style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MdReply size={18} /> Reply via Email
            </button>
            <button 
              onClick={handleDelete}
              style={{ backgroundColor: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MdDeleteOutline size={18} /> Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactMessageDetails;
