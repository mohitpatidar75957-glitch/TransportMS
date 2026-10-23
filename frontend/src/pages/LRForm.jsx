import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEdit, MdOutlineReceiptLong } from 'react-icons/md';
import './AddVehicle.css'; // Reusing form styles
import { useModal } from '../context/ModalContext';
import CitySearchInput from '../components/CitySearchInput';
import { 
  isValidGST, 
  isValidPhone, 
  isValidName, 
  sanitizeNameInput, 
  sanitizeDigitsOnly, 
  sanitizeAlphaNumericUpper 
} from '../utils/validationUtils';

const LRForm = () => {
  const { showAlert, showConfirm } = useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    lrNumber: isEdit ? id : `LR-0000${Math.floor(10 + Math.random() * 90)}`,
    date: new Date().toISOString().split('T')[0],
    tripId: '',
    consignorName: '',
    consignorContact: '',
    consignorAddress: '',
    consignorGST: '',
    consigneeName: '',
    consigneeContact: '',
    consigneeAddress: '',
    consigneeGST: '',
    fromLocation: '',
    toLocation: '',
    materialDescription: '',
    noOfArticles: '',
    weight: '',
    weightUnit: 'Kg',
    chargedWeight: '',
    freightRate: '',
    freightAmount: '',
    advanceAmount: '',
    toPay: '',
    gstPercent: '',
    gstAmount: '',
    biltyCharge: '',
    loadingCharge: '',
    status: 'In Transit',
    dbId: null
  });

  useEffect(() => {
    if (isEdit) {
      const fetchLr = async () => {
        try {
          const res = await fetch('/api/v1/fleet/lr');
          if (res.ok) {
            const data = await res.json();
            const found = data.find(item => item.lrNumber === id || `DB-LR-${item.id}` === id || String(item.id) === id);
            if (found) {
              setFormData(prev => ({
                ...prev,
                lrNumber: found.lrNumber,
                date: found.lrDate || (found.createdAt ? new Date(found.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                consignorName: found.consignor || '',
                consignorContact: found.consignorContact || '',
                consignorAddress: found.consignorAddress || '',
                consignorGST: found.consignorGST || '',
                consigneeName: found.consignee || '',
                consigneeContact: found.consigneeContact || '',
                consigneeAddress: found.consigneeAddress || '',
                consigneeGST: found.consigneeGST || '',
                fromLocation: found.fromLocation || '',
                toLocation: found.toLocation || '',
                materialDescription: found.materialDescription || '',
                noOfArticles: found.noOfArticles || '',
                weight: found.weight || '',
                weightUnit: found.weightUnit || 'Kg',
                chargedWeight: found.chargedWeight || '',
                freightRate: found.freightRate || '',
                freightAmount: found.amount || '',
                gstPercent: found.gstPercent || '',
                gstAmount: found.gstAmount || '',
                biltyCharge: found.biltyCharge || '',
                loadingCharge: found.loadingCharge || '',
                advanceAmount: found.advanceAmount || '',
                toPay: found.toPay || '',
                status: found.status || 'In Transit',
                dbId: found.id
              }));
            }
          }
        } catch (err) {
          console.error('Failed to fetch LR details for edit:', err);
        }
      };
      fetchLr();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;

    if (name === 'consignorName' || name === 'consigneeName') {
      finalVal = sanitizeNameInput(value);
    } else if (name === 'consignorContact' || name === 'consigneeContact') {
      finalVal = sanitizeDigitsOnly(value, 10);
    } else if (name === 'consignorGST' || name === 'consigneeGST') {
      finalVal = sanitizeAlphaNumericUpper(value, 15);
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: finalVal };
      
      // Auto-calculate GST and To Pay
      if (['freightAmount', 'gstPercent', 'advanceAmount', 'biltyCharge', 'loadingCharge'].includes(name)) {
        const freight = parseFloat(updated.freightAmount) || 0;
        const gstP = parseFloat(updated.gstPercent) || 0;
        const advance = parseFloat(updated.advanceAmount) || 0;
        const bilty = parseFloat(updated.biltyCharge) || 0;
        const loading = parseFloat(updated.loadingCharge) || 0;
        
        const gstA = (freight * gstP) / 100;
        updated.gstAmount = gstA;
        updated.toPay = freight + gstA + bilty + loading - advance;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateLRForm = () => {
    const errs = {};

    if (!formData.lrNumber || !formData.lrNumber.trim()) {
      errs.lrNumber = 'LR Number is required';
    }

    if (!formData.consignorName || !formData.consignorName.trim()) {
      errs.consignorName = 'Consignor (Sender) name is required';
    } else if (!isValidName(formData.consignorName)) {
      errs.consignorName = 'Consignor name must only contain letters and spaces';
    }

    if (formData.consignorContact && formData.consignorContact.trim()) {
      if (!isValidPhone(formData.consignorContact, true)) {
        errs.consignorContact = 'Enter valid 10-digit mobile for consignor';
      }
    }

    if (formData.consignorGST && formData.consignorGST.trim()) {
      if (!isValidGST(formData.consignorGST)) {
        errs.consignorGST = 'Invalid 15-digit GST format for Consignor (e.g. 23AADCR1234F1Z5)';
      }
    }

    if (!formData.consigneeName || !formData.consigneeName.trim()) {
      errs.consigneeName = 'Consignee (Receiver) name is required';
    } else if (!isValidName(formData.consigneeName)) {
      errs.consigneeName = 'Consignee name must only contain letters and spaces';
    }

    if (formData.consigneeContact && formData.consigneeContact.trim()) {
      if (!isValidPhone(formData.consigneeContact, true)) {
        errs.consigneeContact = 'Enter valid 10-digit mobile for consignee';
      }
    }

    if (formData.consigneeGST && formData.consigneeGST.trim()) {
      if (!isValidGST(formData.consigneeGST)) {
        errs.consigneeGST = 'Invalid 15-digit GST format for Consignee (e.g. 23AADCR1234F1Z5)';
      }
    }

    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrs = validateLRForm();
    if (Object.keys(formErrs).length > 0) {
      const firstMsg = Object.values(formErrs)[0];
      showAlert(`⚠️ Please correct the error:\n${firstMsg}`);
      return;
    }
    
    const payload = {
      lrNumber: formData.lrNumber,
      lrDate: formData.date,
      consignor: (formData.consignorName || '').trim(),
      consignorContact: (formData.consignorContact || '').trim() || null,
      consignorAddress: formData.consignorAddress,
      consignorGST: (formData.consignorGST || '').trim() || null,
      consignee: (formData.consigneeName || '').trim(),
      consigneeContact: (formData.consigneeContact || '').trim() || null,
      consigneeAddress: formData.consigneeAddress,
      consigneeGST: (formData.consigneeGST || '').trim() || null,
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      materialDescription: formData.materialDescription,
      noOfArticles: formData.noOfArticles,
      weight: parseFloat(formData.weight) || 0,
      weightUnit: formData.weightUnit,
      chargedWeight: parseFloat(formData.chargedWeight) || 0,
      freightRate: parseFloat(formData.freightRate) || 0,
      amount: parseFloat(formData.freightAmount) || 0,
      gstPercent: parseFloat(formData.gstPercent) || 0,
      gstAmount: parseFloat(formData.gstAmount) || 0,
      biltyCharge: parseFloat(formData.biltyCharge) || 0,
      loadingCharge: parseFloat(formData.loadingCharge) || 0,
      advanceAmount: parseFloat(formData.advanceAmount) || 0,
      toPay: parseFloat(formData.toPay) || 0,
      status: formData.status,
      podStatus: 'Pending'
      // Trip mapping can be complex, skipping trip relationship for now
    };

    try {
      const url = (isEdit && formData.dbId) ? `/api/v1/fleet/lr/${formData.dbId}` : '/api/v1/fleet/lr';
      const method = (isEdit && formData.dbId) ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('LR saved to database successfully');
        navigate('/lr');
      } else {
        console.error('Failed to save LR');
        showAlert('Failed to save Lorry Receipt to database.');
      }
    } catch (error) {
      console.error('Error saving LR:', error);
      showAlert('Error connecting to backend database.');
    }
  };

  const fileInputRef = React.useRef(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [doubtfulFields, setDoubtfulFields] = useState([]);
  const [ocrUsed, setOcrUsed] = useState(false);
  const [ocrVerified, setOcrVerified] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setOcrLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      try {
        const res = await fetch('/api/v1/ocr/extract', {
          method: 'POST',
          body: formDataUpload
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setFormData(prev => {
              const updated = {
                ...prev,
                consignorName: data.customer || prev.consignorName,
                weight: data.weight || prev.weight,
                freightAmount: data.freightAmount || prev.freightAmount,
                date: data.date || prev.date
              };
              
              // Auto-calculate GST and To Pay
              const freight = parseFloat(updated.freightAmount) || 0;
              const gstP = parseFloat(updated.gstPercent) || 0;
              const advance = parseFloat(updated.advanceAmount) || 0;
              const bilty = parseFloat(updated.biltyCharge) || 0;
              const loading = parseFloat(updated.loadingCharge) || 0;
              
              const gstA = (freight * gstP) / 100;
              updated.gstAmount = gstA;
              updated.toPay = freight + gstA + bilty + loading - advance;
              
              return updated;
            });

            if (data.confidence) {
              const doubtful = Object.keys(data.confidence).filter(key => data.confidence[key] < 0.8);
              // Map 'customer' from API to 'consignorName' in this form
              const mappedDoubtful = doubtful.map(k => k === 'customer' ? 'consignorName' : k);
              setDoubtfulFields(mappedDoubtful);
            }
            
            setOcrUsed(true);
            setOcrVerified(false);
            showAlert('OCR Extraction successful! Please review highlighted fields.');
          }
        } else {
          showAlert('Failed to process image via OCR.');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error connecting to OCR service.');
      } finally {
        setOcrLoading(false);
        e.target.value = null;
      }
    }
  };

  const getFieldStyle = (fieldName) => {
    return doubtfulFields.includes(fieldName) ? { backgroundColor: '#fef08a' } : {};
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-panel">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isEdit ? <MdEdit size={24} className="form-icon" /> : <MdOutlineReceiptLong size={24} className="form-icon" />}
            <h3 style={{ margin: 0 }}>{isEdit ? `Edit Lorry Receipt — ${formData.lrNumber}` : 'Create Lorry Receipt / Bilty'}</h3>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handlePhotoUpload} 
          />
          <button 
            type="button" 
            className="save-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#6366f1', fontSize: '14px' }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={ocrLoading}
          >
            <span style={{ fontSize: '16px' }}>📸</span> {ocrLoading ? 'Processing...' : 'Auto-fill via OCR'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="section-divider" style={{marginTop: 0}}>
            <h4>Basic Details</h4>
          </div>
          
          <div className="form-grid-3">
            <div className="form-group">
              <label>LR Number <span className="required">*</span></label>
              <input 
                type="text" 
                name="lrNumber"
                value={formData.lrNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>LR Date <span className="required">*</span></label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={getFieldStyle('date')}
                required
              />
            </div>

            <div className="form-group">
              <label>Link Trip ID</label>
              <input 
                type="text" 
                name="tripId"
                placeholder="Optional"
                value={formData.tripId}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="section-divider">
            <h4>Parties Information</h4>
          </div>

          <div className="form-grid-2-mixed">
            {/* Consignor */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h5 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>Consignor (Sender)</h5>
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="consignorName" 
                  value={formData.consignorName} 
                  onChange={handleChange} 
                  placeholder="e.g. Ramesh Transport Corp"
                  style={{ ...getFieldStyle('consignorName'), ...(errors.consignorName ? { borderColor: '#ef4444' } : {}) }} 
                  required 
                />
                {errors.consignorName && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.consignorName}</span>}
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input 
                  type="text" 
                  name="consignorContact" 
                  value={formData.consignorContact} 
                  onChange={handleChange} 
                  placeholder="10-digit mobile"
                  maxLength="10"
                  style={errors.consignorContact ? { borderColor: '#ef4444' } : {}}
                />
                {errors.consignorContact && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.consignorContact}</span>}
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="consignorAddress" value={formData.consignorAddress} onChange={handleChange} rows="2" placeholder="Pickup location address"></textarea>
              </div>
              <div className="form-group">
                <label>GSTIN</label>
                <input 
                  type="text" 
                  name="consignorGST" 
                  value={formData.consignorGST} 
                  onChange={handleChange} 
                  placeholder="15-digit GST (e.g. 23AADCR1234F1Z5)"
                  maxLength="15"
                  style={errors.consignorGST ? { borderColor: '#ef4444' } : {}}
                />
                {errors.consignorGST && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.consignorGST}</span>}
              </div>
            </div>

            {/* Consignee */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h5 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>Consignee (Receiver)</h5>
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="consigneeName" 
                  value={formData.consigneeName} 
                  onChange={handleChange} 
                  placeholder="e.g. Balaji Enterprises"
                  style={errors.consigneeName ? { borderColor: '#ef4444' } : {}}
                  required 
                />
                {errors.consigneeName && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.consigneeName}</span>}
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input 
                  type="text" 
                  name="consigneeContact" 
                  value={formData.consigneeContact} 
                  onChange={handleChange} 
                  placeholder="10-digit mobile"
                  maxLength="10"
                  style={errors.consigneeContact ? { borderColor: '#ef4444' } : {}}
                />
                {errors.consigneeContact && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.consigneeContact}</span>}
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="consigneeAddress" value={formData.consigneeAddress} onChange={handleChange} rows="2" placeholder="Delivery destination address"></textarea>
              </div>
              <div className="form-group">
                <label>GSTIN</label>
                <input 
                  type="text" 
                  name="consigneeGST" 
                  value={formData.consigneeGST} 
                  onChange={handleChange} 
                  placeholder="15-digit GST (e.g. 23AADCR1234F1Z5)"
                  maxLength="15"
                  style={errors.consigneeGST ? { borderColor: '#ef4444' } : {}}
                />
                {errors.consigneeGST && <span style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>{errors.consigneeGST}</span>}
              </div>
            </div>
          </div>

          <div className="section-divider">
            <h4>Consignment Details</h4>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>From (Source / Starting location) <span className="required">*</span></label>
              <div style={{ background: 'var(--bg-primary, rgba(255,255,255,0.05))', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '0 10px' }}>
                <CitySearchInput
                  placeholder="Select or type Starting location..."
                  value={formData.fromLocation}
                  onChange={val => setFormData({ ...formData, fromLocation: val })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>To (Destination) <span className="required">*</span></label>
              <div style={{ background: 'var(--bg-primary, rgba(255,255,255,0.05))', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '0 10px' }}>
                <CitySearchInput
                  placeholder="Select or type Destination..."
                  value={formData.toLocation}
                  onChange={val => setFormData({ ...formData, toLocation: val })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description of Goods <span className="required">*</span></label>
              <input type="text" name="materialDescription" value={formData.materialDescription} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>No. of Articles</label>
              <input type="number" name="noOfArticles" value={formData.noOfArticles} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-group">
              <label>Actual Weight</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  name="weight" 
                  value={formData.weight} 
                  onChange={handleChange} 
                  style={{ flex: 2, ...getFieldStyle('weight') }}
                />
                <select 
                  name="weightUnit" 
                  value={formData.weightUnit} 
                  onChange={handleChange}
                  style={{ flex: 1 }}
                >
                  <option value="Kg">Kg</option>
                  <option value="Ton">Ton</option>
                  <option value="MT">MT</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Charged Weight</label>
              <input type="number" name="chargedWeight" value={formData.chargedWeight} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Freight Rate</label>
              <input type="number" name="freightRate" value={formData.freightRate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="section-divider">
            <h4>Charges & Payment</h4>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Total Freight (₹) <span className="required">*</span></label>
              <input type="number" name="freightAmount" value={formData.freightAmount} onChange={handleChange} style={getFieldStyle('freightAmount')} required />
            </div>
            <div className="form-group">
              <label>Bilty/GR Charge (₹)</label>
              <input type="number" name="biltyCharge" value={formData.biltyCharge} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Hamali/Loading (₹)</label>
              <input type="number" name="loadingCharge" value={formData.loadingCharge} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>GST Rate (%)</label>
              <input type="number" name="gstPercent" value={formData.gstPercent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>GST Amount (₹)</label>
              <input type="number" name="gstAmount" value={formData.gstAmount} readOnly style={{backgroundColor: '#1e2430'}} />
            </div>
            <div className="form-group">
              <label>Advance Paid (₹)</label>
              <input type="number" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>To Pay Balance (₹)</label>
              <input type="number" name="toPay" value={formData.toPay} onChange={handleChange} />
            </div>
          </div>

          {ocrUsed && (
            <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0, color: '#eab308', fontSize: '14px' }}>
                <strong>⚠️ Human Validation Required:</strong> OCR has pre-filled the form. Please check all values against the original photo, especially the yellow highlighted ones.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={ocrVerified} 
                  onChange={(e) => setOcrVerified(e.target.checked)} 
                  style={{ width: '16px', height: '16px' }}
                />
                I have reviewed and confirmed that all auto-filled details are correct.
              </label>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={ocrUsed && !ocrVerified} style={ocrUsed && !ocrVerified ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
              {isEdit ? 'Update Lorry Receipt' : 'Generate LR'}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/lr')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LRForm;
