import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { 
  MdEdit, 
  MdToggleOn, 
  MdToggleOff, 
  MdAutoMode, 
  MdManageHistory, 
  MdScheduleSend, 
  MdSend, 
  MdCheckCircle, 
  MdDoneAll 
} from 'react-icons/md';
import './WhatsApp.css';
import { useModal } from '../context/ModalContext';


const WhatsApp = () => {
  const { showAlert, showConfirm } = useModal();
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ invoiceId: '', clientName: '', amount: '', phone: '', content: '' });
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);

  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulateData, setSimulateData] = useState({ recipient: '+91 9876543210', templateName: '' });

  const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...extraHeaders };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const compId = localStorage.getItem('activeCompanyId');
    if (compId) {
      headers['X-Company-Id'] = compId;
      headers['X-Tenant-Id'] = compId;
    }
    return headers;
  };

  const fetchWaData = async () => {
    try {
      const headers = getAuthHeaders();
      const templatesRes = await fetch('/api/whatsapp/templates', { headers });
      if (templatesRes.ok) setTemplates(await templatesRes.json());

      const logsRes = await fetch('/api/whatsapp/logs', { headers });
      if (logsRes.ok) setLogs(await logsRes.json());

      const invoicesRes = await fetch('/api/v1/finance/invoices', { headers });
      if (invoicesRes.ok) {
        const invs = await invoicesRes.json();
        setUnpaidInvoices(invs.filter(i => i.status !== 'Paid'));
      }
    } catch (error) {
      console.error("Failed to fetch WhatsApp data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaData();
  }, []);

  const toggleTemplate = async (id) => {
    try {
      const res = await fetch(`/api/whatsapp/templates/${id}/toggle`, { 
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedTemplate = await res.json();
        setTemplates(templates.map(t => t.id === id ? updatedTemplate : t));
      }
    } catch (error) {
      console.error("Failed to toggle template", error);
    }
  };

  const handleOpenSimulateModal = (templateName) => {
    setSimulateData({ ...simulateData, templateName });
    setIsSimulateModalOpen(true);
  };

  const submitSimulateMessage = async (e) => {
    e.preventDefault();
    try {
      const { recipient, templateName } = simulateData;
      const res = await fetch(`/api/whatsapp/simulate?recipient=${encodeURIComponent(recipient)}&template=${encodeURIComponent(templateName)}`, { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setIsSimulateModalOpen(false);
        fetchWaData(); // Refresh logs
      } else {
        showAlert("Failed to simulate message. Please ensure your backend is updated and running.");
      }
    } catch (error) {
      console.error("Failed to simulate message", error);
      showAlert("Error: " + error.message);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.phone || !newTemplate.content) {
      showAlert("Phone number and message content are required!");
      return;
    }
    
    // Format Phone number for wa.me link (remove spaces, plus, dashes)
    let formattedPhone = newTemplate.phone.replace(/[\s\-\+]/g, '');
    // If it's a 10 digit Indian number without country code, add 91
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    try {
      // 1. Log it to our backend so it shows in "Recent Messages"
      await fetch(`/api/whatsapp/simulate?recipient=${encodeURIComponent(newTemplate.phone)}&template=${encodeURIComponent(newTemplate.content)}`, { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      // 2. Open WhatsApp Web/App directly
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(newTemplate.content)}`;
      window.open(waUrl, '_blank');
      
      setIsTemplateModalOpen(false);
      fetchWaData(); // Refresh logs
      setNewTemplate({ invoiceId: '', clientName: '', amount: '', phone: '', content: '' });
      
    } catch (error) {
      console.error("Failed to send reminder", error);
      showAlert("Error: " + error.message);
    }
  };

  return (
    <div className="wa-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">WhatsApp Integration</h1>
          <p className="page-subtitle">Manage automated notifications for drivers, clients, and staff.</p>
        </div>
      </div>

      <div className="wa-top-section">
        <div className="wa-status-card">
          <div className="status-header">
            <div className="wa-icon-container">
              <FaWhatsapp size={32} color="#25D366" />
            </div>
            <div>
              <h3>WhatsApp Business API</h3>
              <p className="status-active"><MdCheckCircle size={16} /> Connected successfully</p>
            </div>
          </div>
          <div className="status-details">
            <div className="detail-row">
              <span>Connected Number:</span>
              <strong>+91 98XXXXXX12</strong>
            </div>
            <div className="detail-row">
              <span>Account Status:</span>
              <strong style={{ color: '#25D366' }}>Active (Approved)</strong>
            </div>
            <div className="detail-row">
              <span>Messages Sent (This Month):</span>
              <strong>1,245 / 10,000</strong>
            </div>
          </div>
          <button className="btn-secondary" style={{ width: '100%', marginTop: '16px' }}>Manage Connection</button>
        </div>

        <div className="wa-quick-actions">
          <div className="action-card">
            <div className="action-icon" style={{ backgroundColor: 'rgba(9, 132, 227, 0.1)', color: '#0984e3' }}>
              <MdAutoMode size={26} />
            </div>
            <h4>Automated Rules</h4>
            <p>Configure trigger-based messages</p>
          </div>
          <div className="action-card">
            <div className="action-icon" style={{ backgroundColor: 'rgba(253, 160, 133, 0.1)', color: '#fda085' }}>
              <MdManageHistory size={26} />
            </div>
            <h4>Message Logs</h4>
            <p>View history and delivery status</p>
          </div>
        </div>
      </div>

      <div className="data-section">
        <div className="section-header">
          <h2>Message Templates & Automated Reminders</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              style={{ backgroundColor: '#10ac84', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={async () => {
                try {
                  const res = await fetch('/api/whatsapp/run-due-reminders', { 
                    method: 'POST',
                    headers: getAuthHeaders()
                  });
                  if (res.ok) {
                    const result = await res.json();
                    showAlert(`Automated Reminders Processed! Total Sent: ${result.total_sent} (Upcoming: ${result.reminders_sent_before_due}, Today: ${result.reminders_sent_due_today}, Overdue: ${result.reminders_sent_overdue})`);
                    fetchWaData();
                  } else {
                    showAlert('Failed to run due reminders.');
                  }
                } catch (e) {
                  showAlert('Error running due reminders: ' + e.message);
                }
              }}
            >
              <MdScheduleSend size={18} /> Run Auto Reminders (3-Day / Due / Overdue)
            </button>
            <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsTemplateModalOpen(true)}>
              <MdSend size={16} /> Send Invoice Reminder
            </button>
          </div>
        </div>
        
        <div className="templates-grid">
          {templates.map(template => (
            <div className={`template-card ${!template.active ? 'inactive' : ''}`} key={template.id}>
              <div className="template-header">
                <h3>{template.name}</h3>
                <div className="template-actions">
                  <button className="icon-btn" onClick={() => handleOpenSimulateModal(template.name)} title="Simulate Send"><MdSend size={16} /></button>
                  <button className="icon-btn"><MdEdit size={18} /></button>
                  <button className="icon-btn toggle-btn" onClick={() => toggleTemplate(template.id)}>
                    {template.active ? <MdToggleOn size={28} color="#20c997" /> : <MdToggleOff size={28} color="#636e72" />}
                  </button>
                </div>
              </div>
              <div className="template-trigger"><strong>Trigger:</strong> {template.trigger}</div>
              <div className="template-content-box">
                {template.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="data-section">
        <div className="section-header">
          <h2>Recent Messages Log</h2>
          <div className="filter-group">
            <select className="filter-select"><option>Today</option><option>Last 7 Days</option></select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Template / Event</th>
                <th>Sent At</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Loading logs...</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td><strong>{log.recipientNumber}</strong></td>
                  <td>{log.templateName}</td>
                  <td>{new Date(log.sentAt).toLocaleString()}</td>
                  <td>
                    <span className={`wa-status ${log.status ? log.status.toLowerCase() : ''}`}>
                      {log.status === 'Read' && <MdDoneAll size={16} color="#34B7F1" style={{marginRight:'6px'}}/>}
                      {log.status === 'Delivered' && <MdDoneAll size={16} color="#b2bec3" style={{marginRight:'6px'}}/>}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Template Modal */}
      {isTemplateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Send Invoice Reminder</h2>
              <button className="close-btn" onClick={() => setIsTemplateModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                <div className="form-group">
                  <label>Select Unpaid Invoice</label>
                  <select 
                    required
                    value={newTemplate.invoiceId}
                    onChange={(e) => {
                      const invId = e.target.value;
                      if (!invId) {
                        setNewTemplate({ invoiceId: '', clientName: '', amount: '', phone: '', content: '' });
                        return;
                      }
                      const inv = unpaidInvoices.find(i => String(i.id) === invId);
                      if (inv) {
                        const cName = inv.clientName || inv.trip?.clientName || 'Client';
                        const cPhone = inv.trip?.customerContact || '';
                        const amt = inv.amount || 0;
                        const invNum = inv.invoiceNumber || `INV-${inv.id}`;
                        setNewTemplate({
                          invoiceId: invId,
                          clientName: cName,
                          amount: amt,
                          phone: cPhone,
                          content: `Dear ${cName}, your payment of ₹${amt} for invoice ${invNum} is pending. Please pay at the earliest.`
                        });
                      }
                    }}
                  >
                    <option value="">-- Select Invoice --</option>
                    {unpaidInvoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber || `INV-${inv.id}`} - {inv.clientName || inv.trip?.clientName} (₹{inv.amount})
                      </option>
                    ))}
                  </select>
                </div>
                
                {newTemplate.invoiceId && (
                  <div style={{ backgroundColor: 'rgba(9, 132, 227, 0.05)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(9, 132, 227, 0.2)' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Client Details:</p>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{newTemplate.clientName}</p>
                    <p style={{ margin: 0, color: '#e74c3c', fontWeight: 'bold' }}>Pending: ₹{newTemplate.amount}</p>
                  </div>
                )}

                <div className="form-group">
                  <label>Recipient Phone Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. +91 9876543210" 
                    value={newTemplate.phone}
                    onChange={(e) => setNewTemplate({...newTemplate, phone: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Type your message here..." 
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsTemplateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#25D366', color: 'white', display: 'inline-flex', alignItems: 'center' }}>
                  <MdSend size={16} style={{ marginRight: '8px' }} /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulate Message Modal */}
      {isSimulateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Send Test Message</h2>
              <button className="close-btn" onClick={() => setIsSimulateModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={submitSimulateMessage}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Selected Template</label>
                  <input 
                    type="text" 
                    disabled
                    value={simulateData.templateName}
                    style={{ opacity: 0.7 }}
                  />
                </div>
                <div className="form-group">
                  <label>Recipient Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={simulateData.recipient}
                    onChange={(e) => setSimulateData({...simulateData, recipient: e.target.value})}
                  />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '0' }}>
                  This will simulate sending a message and add an entry to the logs below, but no actual SMS/WhatsApp will be sent.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsSimulateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#25D366', color: 'white', display: 'inline-flex', alignItems: 'center' }}>
                  <MdSend size={16} style={{ marginRight: '8px' }} /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp;


