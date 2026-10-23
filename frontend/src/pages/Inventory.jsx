import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdBuild, MdEdit, MdDelete, MdAddShoppingCart, MdRemoveShoppingCart, MdClose } from 'react-icons/md';
import './Vehicles.css'; 
import { useModal } from '../context/ModalContext';


const Inventory = () => {
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dbInventory, setDbInventory] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustType, setAdjustType] = useState('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemName, setEditItemName] = useState('');
  
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/v1/resources/inventory');
        if (response.ok) {
          const data = await response.json();
          setDbInventory(data);
        }
      } catch (error) {
        console.error('Failed to fetch inventory from database:', error);
      }
    };
    fetchInventory();
  }, []);

  const allInventory = [
    ...dbInventory.map(i => ({
      id: `INV-DB-${i.id}`,
      dbId: i.id,
      name: i.name || 'Unknown',
      category: 'Spare Parts',
      sku: `SKU-${i.id}`,
      stock: i.quantity || 0,
      unit: 'Pieces',
      lowStockAlert: 10,
      isReal: true
    }))
  ];

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustType('add');
    setAdjustQty('');
    setAdjustNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditItemName(item.name !== 'Unknown' ? item.name : '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItemName.trim()) {
      showAlert('Name cannot be empty.');
      return;
    }
    
    if (selectedItem.isReal) {
      try {
        const response = await fetch(`/api/v1/resources/inventory/${selectedItem.dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editItemName, quantity: selectedItem.stock })
        });
        
        if (response.ok) {
          setDbInventory(prev => prev.map(item => {
            if (item.id === selectedItem.dbId) {
              return { ...item, name: editItemName };
            }
            return item;
          }));
          showAlert('Item updated successfully.');
        } else {
          showAlert('Failed to update item.');
        }
      } catch (error) {
        console.error(error);
        showAlert('Network error updating item.');
      }
    }
    setIsEditModalOpen(false);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(adjustQty, 10);
    if (!isNaN(qty) && qty > 0) {
      if (selectedItem.isReal) {
        try {
          const newStock = adjustType === 'add' ? selectedItem.stock + qty : selectedItem.stock - qty;
          const updatedStock = newStock >= 0 ? newStock : 0;
          
          const response = await fetch(`/api/v1/resources/inventory/${selectedItem.dbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: updatedStock })
          });

          if (response.ok) {
            setDbInventory(prev => prev.map(item => {
              if (item.id === selectedItem.dbId) {
                return { ...item, quantity: updatedStock };
              }
              return item;
            }));
            showAlert(`Stock updated successfully. New balance: ${updatedStock}`);
          } else {
            showAlert('Failed to update stock in database.');
          }
        } catch (error) {
          console.error(error);
          showAlert('Network error updating stock.');
        }
      } else {
        setInventory(prev => prev.map(item => {
          if (item.id === selectedItem.id) {
            const newStock = adjustType === 'add' ? item.stock + qty : item.stock - qty;
            return { ...item, stock: newStock >= 0 ? newStock : 0 };
          }
          return item;
        }));
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id, isReal, dbId) => {
    if (await showConfirm('Are you sure you want to delete this item?')) {
      if (isReal) {
        try {
          const response = await fetch(`/api/v1/resources/inventory/${dbId}`, { method: 'DELETE' });
          if (response.ok) {
            setDbInventory(dbInventory.filter(i => i.id !== dbId));
          } else {
            showAlert('Failed to delete from database.');
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setInventory(inventory.filter(i => i.id !== id));
      }
    }
  };

  const filteredInventory = allInventory.filter(item => {
    const nameStr = String(item.name || '');
    const skuStr = String(item.sku || '');
    const searchStr = String(searchTerm || '').toLowerCase();
    
    return nameStr.toLowerCase().includes(searchStr) || 
           skuStr.toLowerCase().includes(searchStr);
  });

  return (
    <div className="vehicles-container">
      <div className="page-header">
        <div className="header-text">
          <h2>Inventory & Spares</h2>
          <p>Manage spare parts, lubricants, tyres, and stock levels</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/inventory/create')}>
          <MdAdd size={20} />
          Add New Item
        </button>
      </div>

      <div className="filter-section panel">
        <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search parts, SKUs, categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="search-btn">
          <MdSearch size={20} />
          Search
        </button>
      </div>

      {/* Inventory Grid Layout */}
      <div className="inventory-grid">
        {filteredInventory.length === 0 ? (
          <div className="panel" style={{ padding: '20px', gridColumn: '1 / -1', textAlign: 'center' }}>
            No inventory items found.
          </div>
        ) : (
          filteredInventory.map((item) => (
          <div key={item.id} className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className="category-badge" style={{ backgroundColor: '#f1f2f6', color: '#57606f', fontSize: '12px' }}>
                {item.category}
              </span>
              <div className="action-buttons" style={{ gap: '4px' }}>
                <button className="action-icon edit" title="Edit Item" style={{ padding: '4px' }} onClick={() => openEditModal(item)}><MdEdit size={16} /></button>
                <button className="action-icon delete" title="Delete Item" style={{ padding: '4px' }} onClick={() => handleDelete(item.id, item.isReal, item.dbId)}><MdDelete size={16} /></button>
              </div>
            </div>
            
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text-primary)' }}>{item.name}</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>SKU: {item.sku}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '12px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>CURRENT STOCK</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.stock <= item.lowStockAlert ? '#e74c3c' : '#2ecc71', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  {item.stock} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>{item.unit}</span>
                </div>
              </div>
              {item.stock <= item.lowStockAlert && (
                <span style={{ fontSize: '11px', color: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  Low Stock
                </span>
              )}
            </div>
            
            <button 
              style={{ marginTop: '16px', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500' }}
              onClick={() => openAdjustModal(item)}
            >
              <MdBuild size={18} /> Adjust Stock
            </button>
          </div>
        )))}
      </div>

      {/* Adjust Stock Modal */}
      {isModalOpen && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '400px', padding: '24px', position: 'relative' }}>
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <MdClose size={24} />
            </button>
            
            <h3 style={{ margin: '0 0 8px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Adjust Stock: {selectedItem.name}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Stock:</span>
              <span style={{ fontWeight: 'bold' }}>{selectedItem.stock} {selectedItem.unit}</span>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: adjustType === 'add' ? '2px solid #2ecc71' : '1px solid #ddd', backgroundColor: adjustType === 'add' ? 'rgba(46,204,113,0.1)' : 'transparent', color: adjustType === 'add' ? '#2ecc71' : '#7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => setAdjustType('add')}
                >
                  <MdAddShoppingCart /> Add (In)
                </button>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: adjustType === 'reduce' ? '2px solid #e74c3c' : '1px solid #ddd', backgroundColor: adjustType === 'reduce' ? 'rgba(231,76,60,0.1)' : 'transparent', color: adjustType === 'reduce' ? '#e74c3c' : '#7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => setAdjustType('reduce')}
                >
                  <MdRemoveShoppingCart /> Reduce (Out)
                </button>
              </div>

              <div className="form-group">
                <label>Quantity to {adjustType === 'add' ? 'Add' : 'Reduce'} <span className="required">*</span></label>
                <input 
                  type="number" 
                  value={adjustQty} 
                  onChange={(e) => setAdjustQty(e.target.value)} 
                  required 
                  min="1"
                  max={adjustType === 'reduce' ? selectedItem.stock : undefined}
                />
              </div>

              <div className="form-group">
                <label>Notes / Reference</label>
                <input 
                  type="text" 
                  value={adjustNotes} 
                  onChange={(e) => setAdjustNotes(e.target.value)} 
                  placeholder="e.g. Added from Invoice #1234, Used in UP-16-BD-9012" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn" style={{ backgroundColor: '#3498db' }}>Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="panel" style={{ width: '400px', padding: '24px', position: 'relative' }}>
            
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <MdClose size={24} />
            </button>
            
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Edit Inventory Item
            </h3>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Item Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={editItemName} 
                  onChange={(e) => setEditItemName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn" style={{ backgroundColor: '#e67e22' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Inventory;


