import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdEdit, MdDelete } from 'react-icons/md';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';


const Staff = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [dbEmployees, setDbEmployees] = useState([]);

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/v1/hr/staff');
        if (response.ok) {
          const data = await response.json();
          setDbEmployees(data);
        }
      } catch (error) {
        console.error('Failed to fetch staff from database:', error);
      }
    };
    fetchStaff();
  }, []);

  const allEmployees = [
    ...dbEmployees.map(e => ({
      id: `EMP-DB-${e.id}`,
      dbId: e.id,
      name: e.name || 'Unknown',
      role: e.role || 'Labor',
      mobile: e.phone || 'N/A',
      salary: e.salary || 0,
      advance: 0,
      status: 'Active',
      isReal: true
    }))
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this employee?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/hr/staff/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbEmployees(dbEmployees.filter(e => e.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setEmployees(employees.filter(e => e.id !== id));
      }
    }
  };

  const filtered = allEmployees.filter(emp => {
    const nameStr = String(emp.name || '');
    const mobStr = String(emp.mobile || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    const matchesSearch = nameStr.toLowerCase().includes(searchStr) ||
      mobStr.includes(searchStr);
    const matchesRole = selectedRole === 'All Roles' || emp.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRole('All Roles');
  };

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Staff & Labor Management</h2>
          <p>Manage your office staff and labor force</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/staff/create')}>
          <MdAdd size={20} />
          Add Employee
        </button>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search name, mobile..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <option>All Roles</option>
          <option>Labor</option>
          <option>Office Staff</option>
          <option>Other</option>
        </select>
        <button className="search-btn"><MdSearch size={20} /> Search</button>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Mobile</th>
              <th>Salary</th>
              <th>Advance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No employees found.</td>
              </tr>
            ) : (
              filtered.map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 500 }}>{emp.name}</td>
                  <td>{emp.role}</td>
                  <td>{emp.mobile}</td>
                  <td>₹{Number(emp.salary).toLocaleString()}</td>
                  <td style={{ color: emp.advance > 0 ? '#2ed573' : 'var(--text-secondary)' }}>₹{Number(emp.advance).toLocaleString()}</td>
                  <td><span className={`status-badge ${(emp.status || 'Active').toLowerCase()}`}>{emp.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon edit" title="Edit" onClick={() => navigate(`/staff/${emp.id}/edit`)}><MdEdit /></button>
                      <button className="action-icon delete" title="Delete" onClick={() => handleDelete(emp.id, emp.isReal, emp.dbId)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Staff;


