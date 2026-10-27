import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import './Vehicles.css';
import { useModal } from '../context/ModalContext';
import { normalizeRegistrationNumber } from '../utils/registrationUtils';

const Vehicles = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [activeSelectedType, setActiveSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [activeSelectedStatus, setActiveSelectedStatus] = useState('All Status');
  const [dbVehicles, setDbVehicles] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const [vehicles, setVehicles] = useState([]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/v1/fleet/vehicles');
      if (response.ok) {
        const data = await response.json();
        setDbVehicles(data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles from database:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const processExcelData = async (data) => {
    try {
        const payload = data.map(row => ({
            registrationNumber: normalizeRegistrationNumber(row['Registration Number'] || row['registrationNumber'] || row['Vehicle Number'] || ''),
            name: row['Name'] || row['name'] || '',
            type: row['Type'] || row['type'] || 'Truck',
            capacity: row['Capacity'] || row['capacity'] || '',
            status: row['Status'] || row['status'] || 'Active',
            ownership: row['Ownership'] || row['ownership'] || 'Owned',
            mileage: row['Mileage'] || row['mileage'] || 0,
            model: row['Model'] || row['model'] || '',
            chassisNumber: row['Chassis Number'] || row['chassisNumber'] || '',
            engineNumber: row['Engine Number'] || row['engineNumber'] || '',
            insuranceExpiry: row['Insurance Expiry'] || row['insuranceExpiry'] || '',
            pucExpiry: row['PUC Expiry'] || row['pucExpiry'] || '',
            permitExpiry: row['Permit Expiry'] || row['permitExpiry'] || '',
            fitnessExpiry: row['Fitness Expiry'] || row['fitnessExpiry'] || ''
        })).filter(v => v.registrationNumber); // ensure at least reg number is present

        if (payload.length === 0) {
            showAlert("No valid vehicles found in the file. Make sure 'Registration Number' column exists.");
            return;
        }

        const response = await fetch('/api/v1/fleet/vehicles/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showAlert(`Successfully uploaded ${payload.length} vehicles!`);
            fetchVehicles();
        } else {
            showAlert("Failed to upload vehicles to the server.");
        }
    } catch (error) {
        console.error(error);
        showAlert("An error occurred during bulk upload.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processExcelData(data);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleZipUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    JSZip.loadAsync(file).then(async (zip) => {
        let excelProcessed = false;
        for (let filename of Object.keys(zip.files)) {
            if (filename.endsWith('.xlsx') || filename.endsWith('.csv')) {
                const fileData = await zip.files[filename].async("binarystring");
                const wb = XLSX.read(fileData, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                processExcelData(data);
                excelProcessed = true;
                break;
            }
        }
        if (!excelProcessed) {
            showAlert("No Excel (.xlsx or .csv) file found inside the ZIP.");
        }
    }).catch((err) => {
        console.error(err);
        showAlert("Failed to read ZIP file.");
    });
    e.target.value = null;
  };

  const uniqueDbVehicles = useMemo(() => {
    const seen = new Set();
    const result = [];
    const sorted = [...dbVehicles].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    for (const v of sorted) {
      const reg = normalizeRegistrationNumber(v.registrationNumber || '');
      if (reg && !seen.has(reg)) {
        seen.add(reg);
        result.push(v);
      }
    }
    return result;
  }, [dbVehicles]);

  const allVehicles = [
    ...uniqueDbVehicles.map(v => {
      // Helper to evaluate document status (valid > 30d, expiring-soon <= 30d, invalid <= 0d)
      const getDateStatus = (dateStr) => {
        if (!dateStr || dateStr === 'N/A') return 'none';
        try {
          const cleanDate = typeof dateStr === 'string' && dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
          const target = new Date(cleanDate);
          const now = new Date();
          now.setHours(0,0,0,0);
          const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) return 'invalid';
          if (diffDays <= 30) return 'expiring-soon';
          return 'valid';
        } catch(e) {
          return 'none';
        }
      };
      
      return {
        id: `db-${v.id}`,
        displayId: v.id,
        dbId: v.id,
        number: normalizeRegistrationNumber(v.registrationNumber),
        name: v.name || 'Unknown', 
        type: v.type,
        capacity: v.capacity ? (v.capacity.toString().toLowerCase().includes('ton') ? v.capacity : `${v.capacity} Tons`) : 'N/A',
        model: v.model || 'N/A',
        owner: (!v.ownership || v.ownership === 'RK' || v.ownership === 'Unknown' || v.ownership.includes('R.K.') || v.ownership.includes('TRADERS') || v.ownership === 'Owned') ? 'R.K. Logistics' : v.ownership,
        insurance: v.insuranceExpiry || 'N/A',
        puc: v.pucExpiry || 'N/A',
        permit: v.permitExpiry || 'N/A',
        fitness: v.fitnessExpiry || 'N/A',
        status: v.status || 'Active',
        insuranceStatus: getDateStatus(v.insuranceExpiry),
        pucStatus: getDateStatus(v.pucExpiry),
        permitStatus: getDateStatus(v.permitExpiry),
        fitnessStatus: getDateStatus(v.fitnessExpiry),
        isReal: true
      };
    })
  ];

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this vehicle?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/fleet/vehicles/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbVehicles(dbVehicles.filter(v => v.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setVehicles(vehicles.filter(v => v.id !== id));
      }
    }
  };

  const filteredVehicles = allVehicles.filter(v => {
    const numStr = String(v.number || '');
    const nameStr = String(v.name || '');
    const typeStr = String(v.type || '');
    const searchStr = String(activeSearchTerm || '').toLowerCase();
    
    const matchesSearch = numStr.toLowerCase().includes(searchStr) || 
                          nameStr.toLowerCase().includes(searchStr) ||
                          typeStr.toLowerCase().includes(searchStr);
    const matchesType = activeSelectedType === 'All Types' || v.type === activeSelectedType;
    const matchesStatus = activeSelectedStatus === 'All Status' || v.status === activeSelectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSearch = () => {
    setIsSearching(true);
    // Add artificial delay to give "feel" of searching
    setTimeout(() => {
      setActiveSearchTerm(searchTerm);
      setActiveSelectedType(selectedType);
      setActiveSelectedStatus(selectedStatus);
      setIsSearching(false);
    }, 400);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('All Types');
    setSelectedStatus('All Status');
    setActiveSearchTerm('');
    setActiveSelectedType('All Types');
    setActiveSelectedStatus('All Status');
  };

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Vehicle Management</h2>
          <p>Manage your fleet vehicles</p>
        </div>
        <div className="header-actions" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
          <input type="file" ref={zipInputRef} style={{display: 'none'}} accept=".zip" onChange={handleZipUpload} />
          
          <button className="secondary-btn" style={{backgroundColor: '#0984e3', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'}} onClick={() => fileInputRef.current.click()}>
            <MdAdd size={18} /> Bulk Upload XL
          </button>
          
          <button className="secondary-btn" style={{backgroundColor: '#6c5ce7', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'}} onClick={() => zipInputRef.current.click()}>
            <MdAdd size={18} /> Upload ZIP
          </button>

          <button className="primary-btn" onClick={() => navigate('/vehicles/create')}>
            <MdAdd size={20} />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="filter-section panel">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search vehicle number, name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select" 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option>All Types</option>
          <option>Truck</option>
          <option>Tempo</option>
          <option>Pickup</option>
          <option>Bolero</option>
          <option>Tata 1512</option>
          <option>Trailer</option>
          <option>Container</option>
          <option>Mini Truck</option>
          <option>Other</option>
        </select>
        
        <select 
          className="filter-select" 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Under Maintenance</option>
          <option>Sold</option>
        </select>

        <button className="search-btn" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <span style={{ width: '20px', height: '20px', display: 'inline-block', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span> : <MdSearch size={20} />}
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="table-container panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>VEHICLE</th>
              <th>TYPE / MODEL</th>
              <th>CAPACITY</th>
              <th>OWNER</th>
              <th>INSURANCE</th>
              <th>PUC</th>
              <th>PERMIT</th>
              <th>FITNESS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="11" style={{textAlign: 'center', padding: '20px'}}>No vehicles found matching your criteria.</td>
              </tr>
            ) : (
              filteredVehicles.map((v, index) => (
              <tr key={v.id} style={{ opacity: (v.status === 'Active' || v.status === 'Available') ? 1 : 0.4, transition: 'opacity 0.2s' }}>
                <td>{index + 1}</td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-num">{v.number}</span>
                    <span className="vehicle-name">{v.name}</span>
                  </div>
                </td>
                <td>
                  <div className="vehicle-info">
                    <span className="vehicle-type">{v.type}</span>
                    <span className="vehicle-model">{v.model}</span>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#2d3436', 
                    backgroundColor: '#f1f2f6', 
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    display: 'inline-block'
                  }}>
                    {v.capacity}
                  </span>
                </td>
                <td title="R.K. TRADERS & LOGISTICS">{v.owner}</td>
                <td>
                  <span className={`date-badge ${v.insuranceStatus}`}>
                    {v.insurance}
                  </span>
                </td>
                <td>
                  <span className={`date-badge ${v.pucStatus}`}>
                    {v.puc}
                  </span>
                </td>
                <td>
                  <span className={`date-badge ${v.permitStatus}`}>
                    {v.permit}
                  </span>
                </td>
                <td>
                  <span className={`date-badge ${v.fitnessStatus}`}>
                    {v.fitness}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${(v.status || 'Active').toLowerCase().replace(' ', '-')}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon view" title="View" onClick={() => navigate(`/vehicles/${v.id}`)}><MdVisibility /></button>
                    <button className="action-icon edit" title="Edit" onClick={() => navigate(`/vehicles/${v.id}/edit`)}><MdEdit /></button>
                    <button className="action-icon delete" title="Delete" onClick={() => handleDelete(v.id, v.isReal, v.dbId)}><MdDelete /></button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vehicles;


