import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSettingsApplications } from 'react-icons/md';
import './AddVehicle.css'; 
import { useModal } from '../context/ModalContext';


const InventoryForm = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Spare Parts',
    sku: '',
    initialStock: '0',
    unit: 'Pieces',
    lowStockAlert: '10',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      quantity: parseInt(formData.initialStock) || 0,
      unitPrice: 0 // Optional / Not in this form
    };

    try {
      const response = await fetch('/api/v1/resources/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Inventory item saved to database successfully');
        navigate('/inventory');
      } else {
        console.error('Failed to save inventory item');
        showAlert('Failed to save inventory item to database.');
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ color: '#e67e22', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MdSettingsApplications size={24} /> Add New Inventory Item
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid-2-mixed">
            <div className="form-group">
              <label>Item Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Engine Oil (15W-40)" />
            </div>
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="Spare Parts">Spare Parts</option>
                <option value="Lubricants">Lubricants / Oils</option>
                <option value="Tyres">Tyres</option>
                <option value="Filters">Filters</option>
                <option value="Tools">Tools</option>
              </select>
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Item SKU Code</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Initial Stock Qty</label>
              <input type="number" name="initialStock" value={formData.initialStock} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Measuring Unit <span className="required">*</span></label>
              <select name="unit" value={formData.unit} onChange={handleChange} required>
                <option value="Pieces">Pieces (Pcs)</option>
                <option value="Sets">Sets</option>
                <option value="Liters">Liters (L)</option>
                <option value="Kg">Kilograms (Kg)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Low Stock Alert</label>
              <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group full-width" style={{ marginTop: '12px' }}>
            <label>Item Description / Specifications</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
          </div>

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="save-btn" style={{ backgroundColor: '#e67e22', color: '#fff' }}>Save Item</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/inventory')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
