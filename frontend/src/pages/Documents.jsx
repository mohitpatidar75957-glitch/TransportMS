import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCloudUpload, MdFolderOpen, MdDelete, MdDescription } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';

const Documents = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch('/api/v1/management/documents', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
        }
      })
      .catch(err => {
        console.error(err);
        setDocuments([]);
      });
  }, []);

  const handleDelete = async (id) => {
    if (await showConfirm('Are you sure you want to delete this document?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`/api/v1/management/documents/${id}`, { 
          method: 'DELETE',
          headers
        });
        if (response.ok) {
          setDocuments(prev => prev.filter(d => d.id !== id));
          showAlert('Document deleted.');
        } else {
          showAlert('Failed to delete document.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="vehicles-container">

      {/* Main Content Area */}
      <div className="panel" style={{ padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Document Management</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Store and manage vehicle and driver documents</p>
          </div>
          <button 
            onClick={() => navigate('/documents/create')}
            style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MdCloudUpload size={18} /> Upload Document
          </button>
        </div>
        
        {documents.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <MdFolderOpen size={64} style={{ color: '#636e72', marginBottom: '16px' }} />
            <p style={{ fontSize: '15px', margin: 0 }}>No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Expiry Date</th>
                  <th>Linked Vehicle</th>
                  <th>Linked Driver</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const isExpiringSoon = doc.expiryDate && new Date(doc.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 30));
                  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                  
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MdDescription size={18} style={{ color: '#0984e3' }} />
                          <span style={{ fontWeight: 500 }}>{doc.title}</span>
                        </div>
                      </td>
                      <td><span className="status-badge" style={{ background: '#f1f2f6', color: '#57606f' }}>{doc.type}</span></td>
                      <td>
                        <span style={{ 
                          color: isExpired ? '#e74c3c' : isExpiringSoon ? '#f39c12' : 'inherit',
                          fontWeight: isExpired || isExpiringSoon ? 'bold' : 'normal'
                        }}>
                          {doc.expiryDate || 'N/A'}
                          {isExpired && ' (Expired)'}
                          {!isExpired && isExpiringSoon && ' (Expiring Soon)'}
                        </span>
                      </td>
                      <td>{doc.vehicle ? doc.vehicle.licensePlate : '-'}</td>
                      <td>{doc.driver ? doc.driver.name : '-'}</td>
                      <td>
                        <button className="action-icon delete" onClick={() => handleDelete(doc.id)} style={{ color: '#e74c3c' }}>
                          <MdDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;


