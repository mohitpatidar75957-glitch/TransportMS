import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { MdAdd, MdClose, MdEdit, MdDelete } from 'react-icons/md';

import { 
  isValidGST, 
  isValidPhone, 
  isValidName, 
  sanitizeNameInput, 
  sanitizeDigitsOnly, 
  sanitizeAlphaNumericUpper 
} from '../utils/validationUtils';

const UsersManagement = () => {
  const { userRole } = useAuth();
  const { showConfirm, showAlert } = useModal();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [defaultCompany, setDefaultCompany] = useState('RK trader');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MANAGER', // Default role
    phone: '',
    joinDate: '',
    address: '',
    companyName: '',
    gstNumber: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetch('/api/v1/management/settings')
      .then(res => res.json())
      .then(data => {
        const companySetting = data.find(item => item.key === 'companyName');
        if (companySetting && companySetting.value) {
          setDefaultCompany(companySetting.value);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;

    if (name === 'name') {
      finalVal = sanitizeNameInput(value);
    } else if (name === 'companyName') {
      finalVal = sanitizeNameInput(value);
    } else if (name === 'phone') {
      finalVal = sanitizeDigitsOnly(value, 10);
    } else if (name === 'gstNumber') {
      finalVal = sanitizeAlphaNumericUpper(value, 15);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalVal }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave password blank on edit unless they want to change it
      role: user.role,
      phone: user.phone || '',
      joinDate: user.joinDate || '',
      address: user.address || '',
      companyName: user.companyName || '',
      gstNumber: user.gstNumber || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm('Are you sure you want to delete this user?');
    if (!isConfirmed) return;
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': userRole.key
        }
      });
      if (response.ok) {
        fetchUsers();
      } else {
        const errData = await response.json();
        showAlert(errData.message || 'Failed to delete user');
      }
    } catch (err) {
      showAlert('Network error while deleting');
    }
  };

  const validateUserForm = () => {
    const errs = {};

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (!isValidName(formData.name)) {
      errs.name = 'Name should only contain letters and spaces';
    }

    if (!formData.email || !formData.email.trim()) {
      errs.email = 'Email address is required';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!isValidPhone(formData.phone, true)) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!editUserId) {
      const cleanPass = (formData.password || '').trim();
      if (!cleanPass) {
        errs.password = 'Password cannot be empty or contain only spaces';
      } else if (cleanPass.length < 4) {
        errs.password = 'Password must be at least 4 characters';
      }
    } else if (formData.password) {
      const cleanPass = formData.password.trim();
      if (!cleanPass) {
        errs.password = 'Password cannot be only spaces';
      }
    }

    if (formData.role === 'CUSTOMER') {
      if (!formData.companyName || !formData.companyName.trim()) {
        errs.companyName = 'Company name is required for Client / Customer';
      }
      if (formData.gstNumber && formData.gstNumber.trim()) {
        if (!isValidGST(formData.gstNumber)) {
          errs.gstNumber = 'Invalid GST format (15 characters alphanumeric, e.g. 23AADCR1234F1Z5)';
        }
      }
    }

    setFormErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const errs = validateUserForm();
    if (Object.keys(errs).length > 0) {
      const firstMsg = Object.values(errs)[0];
      setError(firstMsg);
      return;
    }

    try {
      const url = editUserId ? `/api/users/${editUserId}` : '/api/users';
      const method = editUserId ? 'PUT' : 'POST';

      const payload = { 
        ...formData,
        name: (formData.name || '').trim(),
        email: (formData.email || '').trim(),
        password: formData.password ? formData.password.trim() : formData.password,
        phone: (formData.phone || '').trim()
      };
      if (editUserId && !payload.password) {
        delete payload.password;
      }
      
      if (payload.role !== 'CUSTOMER') {
        payload.companyName = null;
        payload.gstNumber = null;
      } else {
        payload.companyName = (payload.companyName || '').trim();
        payload.gstNumber = payload.gstNumber ? payload.gstNumber.trim() : null;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole.key
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSuccess(`User ${editUserId ? 'updated' : 'created'} successfully!`);
        setFormData({ name: '', email: '', password: '', role: 'MANAGER', phone: '', joinDate: '', address: '', companyName: '', gstNumber: '' });
        setEditUserId(null);
        fetchUsers();
        setIsModalOpen(false);
      } else {
        const errData = await response.json();
        setError(errData.message || `Failed to ${editUserId ? 'update' : 'create'} user`);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Users Management</h2>
          <p>Manage internal company staff (Admins, Managers, HR, Accountants, Drivers, Dispatchers)</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="All">All Roles</option>
            <option value="CUSTOMER">🏢 B2B Clients (Customers)</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="MANAGER">Managers</option>
            <option value="HR">HR Executive</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="DRIVER">Drivers</option>
            <option value="DISPATCHER">Dispatchers</option>
          </select>

          <button className="btn btn-primary" onClick={() => {
            setEditUserId(null);
            setFormData({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '', joinDate: '', address: '', companyName: '', gstNumber: '' });
            setIsModalOpen(true);
          }}>
            <MdAdd /> Create User
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Join Date</th>
              <th>Company Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(u => roleFilter === 'All' || u.role === roleFilter)
              .map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || 'N/A'}</td>
                <td>{u.joinDate || 'N/A'}</td>
                <td><strong>{u.companyName || (u.role === 'CUSTOMER' ? u.name : defaultCompany)}</strong></td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    backgroundColor: u.role === 'SUPER_ADMIN' ? '#8e44ad' :
                                     u.role === 'MANAGER' ? '#2980b9' :
                                     u.role === 'HR' ? '#e056fd' :
                                     u.role === 'ACCOUNTANT' ? '#00b894' :
                                     u.role === 'DISPATCHER' ? '#e67e22' :
                                     u.role === 'DRIVER' ? '#27ae60' :
                                     u.role === 'CUSTOMER' ? '#16a085' : '#4facfe',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    {u.role === 'CUSTOMER' ? 'CLIENT / CUSTOMER' : u.role}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0984e3', marginRight: '10px' }} title="Edit">
                    <MdEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }} title="Delete">
                    <MdDelete size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content panel" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>
            <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsModalOpen(false)}>
              <MdClose size={24} />
            </button>
            <h3 style={{ margin: 0, paddingRight: '30px' }}>{editUserId ? 'Edit User' : 'Create New User'}</h3>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
            
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Name <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="e.g. Rahul Sharma"
                    required 
                  />
                  {formErrors.name && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="user@example.com"
                    required 
                  />
                  {formErrors.email && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="text" 
                    name="phone" 
                    className="form-control" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="10-digit mobile"
                    maxLength="10"
                    required 
                  />
                  {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Join Date</label>
                  <input type="date" name="joinDate" className="form-control" value={formData.joinDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Password {editUserId && '(Leave blank to keep current)'}</label>
                  <input 
                    type="password" 
                    name="password" 
                    className="form-control" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder={editUserId ? 'New password (optional)' : 'Password'}
                    required={!editUserId} 
                  />
                  {formErrors.password && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.password}</span>}
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" className="form-control" value={formData.role} onChange={handleChange}>
                    <option value="CUSTOMER">🏢 Client / Customer (B2B Portal)</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR Executive</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="DRIVER">Driver</option>
                    <option value="DISPATCHER">Dispatcher (Operations)</option>
                  </select>
                </div>
                {formData.role === 'CUSTOMER' && (
                  <>
                    <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                      <label>Company Name (Exact match for LR/Bilty) <span style={{color: 'red'}}>*</span></label>
                      <input 
                        type="text" 
                        name="companyName" 
                        className="form-control" 
                        value={formData.companyName} 
                        onChange={handleChange} 
                        required 
                        placeholder="Enter Company / Client Name" 
                      />
                      {formErrors.companyName && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.companyName}</span>}
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
                      <label>GST Number</label>
                      <input 
                        type="text" 
                        name="gstNumber" 
                        className="form-control" 
                        value={formData.gstNumber} 
                        onChange={handleChange} 
                        placeholder="15-digit GST (e.g. 23AADCR1234F1Z5)" 
                        maxLength="15" 
                      />
                      {formErrors.gstNumber && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.gstNumber}</span>}
                    </div>
                  </>
                )}
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Address</label>
                <textarea name="address" className="form-control" value={formData.address} onChange={handleChange} required rows="2" />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>{editUserId ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;


