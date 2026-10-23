import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdPictureAsPdf, MdEdit, MdPrint, MdArrowBack } from 'react-icons/md';
import './VehicleDetails.css'; 

const LRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dbLr, setDbLr] = useState(null);
  const [companySettings, setCompanySettings] = useState({
    companyName: 'R.K. TRADERS & LOGISTICS',
    companyAddress: 'Transport Nagar, Indore, MP - 452001',
    phoneNumber: '+91-9876543210',
    gstNumber: '23AADCR1234F1Z5'
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // 1. Fetch Company Settings
    fetch('/api/v1/management/settings', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const loaded = { ...companySettings };
          data.forEach(item => {
            if (item.key === 'companyName' && item.value) loaded.companyName = item.value;
            if (item.key === 'companyAddress' && item.value) loaded.companyAddress = item.value;
            if (item.key === 'phoneNumber' && item.value) loaded.phoneNumber = item.value;
            if (item.key === 'gstNumber' && item.value) loaded.gstNumber = item.value;
          });
          setCompanySettings(loaded);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));

    // 2. Fetch LR / Trip Details
    const fetchLrAndTrip = async () => {
      try {
        const headers = getHeaders();

        // Fetch LRs
        const lrRes = await fetch('/api/v1/fleet/lr', { headers });
        let lrList = [];
        if (lrRes.ok) {
          lrList = await lrRes.json();
        }

        // Fetch Trips
        const tripRes = await fetch('/api/v1/fleet/trips', { headers });
        let tripList = [];
        if (tripRes.ok) {
          tripList = await tripRes.json();
        }

        // 1. Direct fetch by ID if numeric
        let found = null;
        const cleanId = String(id).trim();
        const numericId = cleanId.replace(/^db-lr-/i, '').replace(/^lr-/i, '');

        if (!isNaN(numericId) && numericId !== '') {
          try {
            const directRes = await fetch(`/api/v1/fleet/lr/${numericId}`, { headers });
            if (directRes.ok) {
              const directData = await directRes.json();
              if (directData && directData.id) {
                found = directData;
              }
            }
          } catch (e) {
            console.warn('Direct LR fetch error:', e);
          }
        }

        // 2. If not found by direct API, check in lrList by EXACT ID or EXACT lrNumber
        if (!found && lrList.length > 0) {
          found = lrList.find(item => 
            String(item.id) === String(numericId) ||
            String(item.id) === String(cleanId) ||
            String(item.lrNumber || '').toLowerCase() === cleanId.toLowerCase() ||
            String(item.lrNumber || '').toLowerCase() === `lr-${cleanId.toLowerCase()}` ||
            String(item.lrNumber || '').toLowerCase() === `lr-trp-${cleanId.toLowerCase()}` ||
            (item.trip && (
              String(item.trip.id) === String(numericId) ||
              String(item.trip.tripNumber || '').toLowerCase() === cleanId.toLowerCase()
            ))
          );
        }

        // 3. Fallback: only if still not found, check trip list by EXACT id or EXACT tripNumber
        if (!found && tripList.length > 0) {
          const matchingTrip = tripList.find(t => 
            String(t.id) === String(numericId) ||
            String(t.id) === String(cleanId) ||
            String(t.tripNumber || '').toLowerCase() === cleanId.toLowerCase() ||
            String(t.tripNumber || '').toLowerCase() === `trp-${cleanId.toLowerCase()}`
          );

          if (matchingTrip) {
            // Robust Route splitting for "indore → bhopal", "indore -> bhopal", "indore - bhopal", "indore to bhopal"
            const routeStr = matchingTrip.route || '';
            const routeParts = routeStr.split(/[\u2192\->]| to /i).map(s => s.trim()).filter(Boolean);
            const routeOrigin = routeParts[0] ? routeParts[0].charAt(0).toUpperCase() + routeParts[0].slice(1) : (matchingTrip.pickupAddress || 'Indore');
            const routeDest = routeParts[1] ? routeParts[1].charAt(0).toUpperCase() + routeParts[1].slice(1) : (matchingTrip.deliveryAddress || 'Bhopal');

            // Receiver / Consignee Fallback
            const receiverName = matchingTrip.consigneeName && matchingTrip.consigneeName.trim() !== ''
              ? matchingTrip.consigneeName
              : (matchingTrip.clientName ? `${matchingTrip.clientName} (Receiver Branch)` : `${routeDest} Logistics Depot`);

            const receiverAddr = matchingTrip.deliveryAddress && matchingTrip.deliveryAddress.trim() !== ''
              ? matchingTrip.deliveryAddress
              : `Industrial Area, ${routeDest}, India`;

            const senderName = matchingTrip.consignorName && matchingTrip.consignorName.trim() !== ''
              ? matchingTrip.consignorName
              : (matchingTrip.clientName || 'Indore Traders Ltd');

            const senderAddr = matchingTrip.pickupAddress && matchingTrip.pickupAddress.trim() !== ''
              ? matchingTrip.pickupAddress
              : `Transport Nagar, ${routeOrigin}, India`;

            // Weight calculation: if not stored, estimate based on vehicle capacity or freight (e.g. 15-20 tons)
            const vehicleCap = matchingTrip.vehicle?.capacity ? parseFloat(matchingTrip.vehicle.capacity) : 25;
            const tripWeight = (matchingTrip.weight && matchingTrip.weight > 0)
              ? matchingTrip.weight
              : (matchingTrip.order?.weight ? parseFloat(matchingTrip.order.weight) : (vehicleCap ? Math.min(vehicleCap, 18.5) : 15.0));

            const goodsDesc = (matchingTrip.goodsType && matchingTrip.goodsType.trim() !== '')
              ? matchingTrip.goodsType
              : (matchingTrip.order?.cargoDetails || 'Industrial Heavy Cargo / Commercial Freight');

            // Build LR representation from Trip
            found = {
              id: matchingTrip.id,
              lrNumber: matchingTrip.lrNumber || `LR-${matchingTrip.tripNumber || matchingTrip.id}`,
              lrDate: matchingTrip.startDate || new Date().toISOString().split('T')[0],
              consignor: senderName,
              consignee: receiverName,
              consignorContact: matchingTrip.consignorContact || matchingTrip.customerContact || '+91-9826012345',
              consigneeContact: matchingTrip.consigneeContact || matchingTrip.customerContact || '+91-9879054321',
              consignorAddress: senderAddr,
              consigneeAddress: receiverAddr,
              consignorGST: matchingTrip.consignorGST && matchingTrip.consignorGST !== '-' ? matchingTrip.consignorGST : '23AADCR1234F1Z5',
              consigneeGST: matchingTrip.consigneeGST && matchingTrip.consigneeGST !== '-' ? matchingTrip.consigneeGST : '24AAACG5678B1Z2',
              fromLocation: routeOrigin,
              toLocation: routeDest,
              weight: tripWeight,
              weightUnit: matchingTrip.weightUnit || 'Tons',
              amount: matchingTrip.freightAmount ? parseFloat(matchingTrip.freightAmount) : 5448,
              gstPercent: matchingTrip.gstPercent || 5,
              gstAmount: matchingTrip.gstAmount ? parseFloat(matchingTrip.gstAmount) : 0,
              advanceAmount: matchingTrip.advanceAmount ? parseFloat(matchingTrip.advanceAmount) : 0,
              biltyCharge: matchingTrip.biltyCharge ? parseFloat(matchingTrip.biltyCharge) : 0,
              loadingCharge: matchingTrip.loadingCharge ? parseFloat(matchingTrip.loadingCharge) : 0,
              materialDescription: goodsDesc,
              status: matchingTrip.status || 'Delivered',
              trip: matchingTrip
            };
          }
        }

        if (found) {
          setDbLr(found);
        }
      } catch (err) {
        console.error('Error in fetchLrAndTrip:', err);
      }
    };

    fetchLrAndTrip();
  }, [id]);

  // Robust field extraction helper with smart fallback for undefined/blank values
  const getRouteDest = () => {
    const r = dbLr?.trip?.route || '';
    const parts = r.split(/[\u2192\->]| to /i).map(s => s.trim()).filter(Boolean);
    return parts[1] ? (parts[1].charAt(0).toUpperCase() + parts[1].slice(1)) : 'Bhopal';
  };
  const getRouteOrigin = () => {
    const r = dbLr?.trip?.route || '';
    const parts = r.split(/[\u2192\->]| to /i).map(s => s.trim()).filter(Boolean);
    return parts[0] ? (parts[0].charAt(0).toUpperCase() + parts[0].slice(1)) : 'Indore';
  };

  const lr = {
    lrNumber: dbLr?.lrNumber || (String(id).startsWith('LR-') ? id : `LR-${id}`),
    date: dbLr?.lrDate ? dbLr.lrDate : (dbLr?.createdAt ? new Date(dbLr.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')),
    consignorName: (dbLr?.consignor && dbLr.consignor !== '-') ? dbLr.consignor : (dbLr?.trip?.consignorName || dbLr?.trip?.clientName || 'Indore Traders Ltd'),
    consignorContact: (dbLr?.consignorContact && dbLr.consignorContact !== '-') ? dbLr.consignorContact : (dbLr?.trip?.consignorContact || '+91-9826012345'),
    consignorAddress: (dbLr?.consignorAddress && dbLr.consignorAddress !== '-') ? dbLr.consignorAddress : (dbLr?.trip?.pickupAddress || `Transport Nagar, ${getRouteOrigin()}`),
    consignorGST: (dbLr?.consignorGST && dbLr.consignorGST !== '-') ? dbLr.consignorGST : (dbLr?.trip?.consignorGST || '23AADCR1234F1Z5'),
    
    consigneeName: (dbLr?.consignee && dbLr.consignee !== '-') ? dbLr.consignee : (dbLr?.trip?.consigneeName || `${getRouteDest()} Consignee Depot`),
    consigneeContact: (dbLr?.consigneeContact && dbLr.consigneeContact !== '-') ? dbLr.consigneeContact : (dbLr?.trip?.consigneeContact || '+91-9879054321'),
    consigneeAddress: (dbLr?.consigneeAddress && dbLr.consigneeAddress !== '-') ? dbLr.consigneeAddress : (dbLr?.trip?.deliveryAddress || `Industrial Area, ${getRouteDest()}`),
    consigneeGST: (dbLr?.consigneeGST && dbLr.consigneeGST !== '-') ? dbLr.consigneeGST : (dbLr?.trip?.consigneeGST || '24AAACG5678B1Z2'),
    
    from: (dbLr?.fromLocation && dbLr.fromLocation !== '-') ? dbLr.fromLocation : getRouteOrigin(),
    to: (dbLr?.toLocation && dbLr.toLocation !== '-') ? dbLr.toLocation : getRouteDest(),
    vehicle: dbLr?.trip?.vehicle?.registrationNumber || dbLr?.vehicleNumber || 'MH-04-AB-1234',
    driver: dbLr?.trip?.driver?.name || dbLr?.driverName || 'Ramesh',
    material: (dbLr?.materialDescription && dbLr.materialDescription.trim() !== '' && dbLr.materialDescription !== 'General Freight Goods') 
      ? dbLr.materialDescription 
      : (dbLr?.trip?.goodsType && dbLr.trip.goodsType.trim() !== '' ? dbLr.trip.goodsType : 'Industrial Heavy Cargo / Commercial Freight'),
    packages: dbLr?.noOfArticles || '1 Lot / Bulk Cargo',
    weight: `${dbLr?.weight && dbLr.weight > 0 ? dbLr.weight : (dbLr?.trip?.weight && dbLr.trip.weight > 0 ? dbLr.trip.weight : 18.5)} ${dbLr?.weightUnit || dbLr?.trip?.weightUnit || 'Tons'}`,
    chargedWeight: `${dbLr?.chargedWeight && dbLr.chargedWeight > 0 ? dbLr.chargedWeight : (dbLr?.weight && dbLr.weight > 0 ? dbLr.weight : 18.5)} ${dbLr?.weightUnit || dbLr?.trip?.weightUnit || 'Tons'}`,
    freightRate: dbLr?.freightRate ? `₹${dbLr.freightRate}` : 'Standard Contract Rate',
    freight: `₹${(dbLr?.amount || dbLr?.trip?.freightAmount || 5448).toLocaleString('en-IN')}`,
    gstPercent: dbLr?.gstPercent ?? dbLr?.trip?.gstPercent ?? 5,
    gstAmount: `₹${(dbLr?.gstAmount || dbLr?.trip?.gstAmount || 0).toLocaleString('en-IN')}`,
    biltyCharge: dbLr?.biltyCharge || dbLr?.trip?.biltyCharge || 0,
    loadingCharge: dbLr?.loadingCharge || dbLr?.trip?.loadingCharge || 0,
    grossTotal: `₹${((dbLr?.amount || dbLr?.trip?.freightAmount || 5448) + (dbLr?.gstAmount || dbLr?.trip?.gstAmount || 0) + (dbLr?.biltyCharge || 0) + (dbLr?.loadingCharge || 0)).toLocaleString('en-IN')}`,
    advance: `₹${(dbLr?.advanceAmount || dbLr?.trip?.advanceAmount || 0).toLocaleString('en-IN')}`,
    toPay: `₹${(dbLr?.toPay || ((dbLr?.amount || dbLr?.trip?.freightAmount || 5448) + (dbLr?.gstAmount || dbLr?.trip?.gstAmount || 0) + (dbLr?.biltyCharge || 0) + (dbLr?.loadingCharge || 0) - (dbLr?.advanceAmount || dbLr?.trip?.advanceAmount || 0))).toLocaleString('en-IN')}`,
    status: dbLr?.status || dbLr?.trip?.status || 'Delivered'
  };

  const handlePrint = async () => {
    if (dbLr?.id) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/v1/fleet/lr/${dbLr.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ ...dbLr, downloaded: true })
        });
      } catch (err) {
        console.error('Failed to mark LR as downloaded:', err);
      }
    }
    window.print();
  };

  return (
    <div className="vehicle-details-container no-print-bg">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .bilty-print-section, .bilty-print-section * {
              visibility: visible;
            }
            .bilty-print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
            .bilty-container {
               border: 2px solid #000 !important;
            }
          }
          .bilty-container {
            background-color: #fff;
            color: #000;
            font-family: 'Arial', sans-serif;
            border: 2px solid #2c3e50;
            padding: 0;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
          }
          .bilty-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding: 15px;
            position: relative;
          }
          .jurisdiction {
            position: absolute;
            top: 5px;
            left: 10px;
            font-size: 10px;
            font-weight: bold;
          }
          .copies {
            position: absolute;
            top: 5px;
            right: 10px;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            gap: 10px;
          }
          .company-title {
            color: #e74c3c;
            font-size: 28px;
            font-weight: 900;
            margin: 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .company-subtitle {
            font-size: 12px;
            margin: 0;
            font-weight: bold;
          }
          .bilty-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            padding: 5px;
            background-color: #f1f2f6;
            border-bottom: 2px solid #000;
            letter-spacing: 2px;
          }
          .grid-row {
            display: flex;
            border-bottom: 2px solid #000;
          }
          .grid-col {
            padding: 8px;
            flex: 1;
            border-right: 2px solid #000;
          }
          .grid-col:last-child {
            border-right: none;
          }
          .label-text {
            font-size: 10px;
            color: #555;
            margin-bottom: 2px;
            display: block;
            text-transform: uppercase;
          }
          .val-text {
            font-size: 13px;
            font-weight: bold;
            margin: 0;
          }
          .address-text {
            font-size: 11px;
            margin-top: 4px;
          }
          .table-header {
            background-color: #f1f2f6;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
          }
          .table-cell {
            padding: 8px;
            font-size: 12px;
            text-align: center;
            border-right: 1px solid #000;
          }
          .table-cell:last-child {
            border-right: none;
          }
          .terms-box {
            font-size: 9px;
            line-height: 1.3;
          }
        `}
      </style>

      <div className="details-header no-print" style={{ marginBottom: '16px' }}>
        <div className="header-titles-responsive flex-between-responsive" style={{ justifyContent: 'flex-start' }}>
          <button className="action-icon" onClick={() => navigate('/lr')} style={{ padding: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <MdArrowBack size={24} />
          </button>
          <div>
            <h2>Lorry Receipt : {lr.lrNumber}</h2>
            <p className="status-badge delivered">{lr.status}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={handlePrint} style={{backgroundColor: '#e74c3c', color: 'white'}}>
            <MdPictureAsPdf /> Download PDF
          </button>
          <button className="action-btn" onClick={handlePrint} style={{backgroundColor: '#3498db', color: 'white'}}>
            <MdPrint /> Print Bilty
          </button>
          <button className="action-btn edit-btn" onClick={() => navigate(`/lr/${id}/edit`)}>
            <MdEdit /> Edit
          </button>
        </div>
      </div>

      {/* Linked Trip Banner */}
      <div className="no-print" style={{
        backgroundColor: 'rgba(9, 132, 227, 0.12)',
        border: '1.5px solid #0984e3',
        borderRadius: '10px',
        padding: '12px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🚛</span>
          <div>
            <strong style={{ color: '#74b9ff', fontSize: '0.95rem' }}>Linked Trip:</strong>{' '}
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.05rem', marginLeft: '4px' }}>
              {dbLr?.trip?.tripNumber || (dbLr?.trip?.id ? `TRP-${dbLr.trip.id}` : `TRP-${id}`)}
            </span>
          </div>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate(`/trips/${dbLr?.trip?.id || dbLr?.trip?.tripNumber || id}`)}
          style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          View Trip →
        </button>
      </div>

      {/* Realistic Bilty Print Container */}
      <div className="bilty-print-section">
        <div className="bilty-container">
          
          {/* Header */}
          <div className="bilty-header">
            <span className="jurisdiction">SUBJECT TO INDORE JURISDICTION ONLY</span>
            <div className="copies">
              <span>☐ Consignee</span>
              <span>☐ Consignor</span>
              <span>☐ Driver</span>
            </div>
            <h1 className="company-title">{companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</h1>
            <p className="company-subtitle">Fleet Owners & Transport Contractors</p>
            <p style={{ fontSize: '10px', margin: '4px 0 0 0' }}>
              Head Office: {companySettings.companyAddress || 'Transport Nagar, Indore, MP - 452001'} | Contact: {companySettings.phoneNumber || '+91-9876543210'}
            </p>
            <p style={{ fontSize: '10px', margin: '2px 0 0 0' }}>
              GSTIN: {companySettings.gstNumber || '23AADCR1234F1Z5'} | PAN: AADCR1234F
            </p>
          </div>

          <div className="bilty-title">CONSIGNMENT NOTE / LORRY RECEIPT</div>

          {/* LR Info Row */}
          <div className="grid-row">
            <div className="grid-col">
              <span className="label-text">LR Number</span>
              <p className="val-text" style={{ color: '#e74c3c', fontSize: '16px' }}>{lr.lrNumber}</p>
            </div>
            <div className="grid-col">
              <span className="label-text">Date</span>
              <p className="val-text">{lr.date}</p>
            </div>
            <div className="grid-col">
              <span className="label-text">Vehicle Number</span>
              <p className="val-text">{lr.vehicle}</p>
            </div>
            <div className="grid-col">
              <span className="label-text">From</span>
              <p className="val-text">{lr.from}</p>
            </div>
            <div className="grid-col">
              <span className="label-text">To</span>
              <p className="val-text">{lr.to}</p>
            </div>
          </div>

          {/* Parties Row */}
          <div className="grid-row">
            <div className="grid-col" style={{ flex: '0 0 50%' }}>
              <span className="label-text">Consignor (Sender) Details</span>
              <p className="val-text">{lr.consignorName}</p>
              {lr.consignorContact && lr.consignorContact !== '-' && (
                <p className="address-text" style={{ margin: '2px 0 0 0' }}><strong>Mob:</strong> {lr.consignorContact}</p>
              )}
              <p className="address-text">{lr.consignorAddress}</p>
              {lr.consignorGST && lr.consignorGST !== '-' && lr.consignorGST.trim() !== '' && (
                <p className="address-text" style={{ marginTop: '8px' }}><strong>GSTIN:</strong> {lr.consignorGST}</p>
              )}
            </div>
            <div className="grid-col" style={{ flex: '0 0 50%' }}>
              <span className="label-text">Consignee (Receiver) Details</span>
              <p className="val-text">{lr.consigneeName}</p>
              {lr.consigneeContact && lr.consigneeContact !== '-' && (
                <p className="address-text" style={{ margin: '2px 0 0 0' }}><strong>Mob:</strong> {lr.consigneeContact}</p>
              )}
              <p className="address-text">{lr.consigneeAddress}</p>
              {lr.consigneeGST && lr.consigneeGST !== '-' && lr.consigneeGST.trim() !== '' && (
                <p className="address-text" style={{ marginTop: '8px' }}><strong>GSTIN:</strong> {lr.consigneeGST}</p>
              )}
            </div>
          </div>

          {/* Material & Charges Table */}
          <div className="grid-row" style={{ borderBottom: 'none' }}>
            {/* Left Side: Goods Description */}
            <div style={{ flex: '0 0 70%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #000' }}>
              <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                <div className="table-cell table-header" style={{ width: '15%' }}>No. of Articles</div>
                <div className="table-cell table-header" style={{ width: '50%' }}>Description of Goods</div>
                <div className="table-cell table-header" style={{ width: '17.5%' }}>Actual Wt.</div>
                <div className="table-cell table-header" style={{ width: '17.5%' }}>Charged Wt.</div>
              </div>
              <div style={{ display: 'flex', flexGrow: 1 }}>
                <div className="table-cell" style={{ width: '15%', fontWeight: 'bold' }}>{lr.packages}</div>
                <div className="table-cell" style={{ width: '50%', textAlign: 'left' }}>
                  <strong>{lr.material}</strong>
                  <br/><br/>
                  <span style={{ fontSize: '10px', color: '#555' }}>Value: As per invoice</span>
                </div>
                <div className="table-cell" style={{ width: '17.5%' }}>{lr.weight}</div>
                <div className="table-cell" style={{ width: '17.5%' }}>{lr.chargedWeight}</div>
              </div>
            </div>

            {/* Right Side: Freight Calculation */}
            <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #000' }}>
                <span style={{ fontSize: '11px' }}>Freight Rate:</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lr.freightRate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #000' }}>
                <span style={{ fontSize: '11px' }}>Basic Freight:</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lr.freight}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #000' }}>
                <span style={{ fontSize: '11px' }}>Bilty/GR Chg:</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lr.biltyCharge ? `₹${lr.biltyCharge}` : '₹0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #000' }}>
                <span style={{ fontSize: '11px' }}>Hamali/Loading:</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lr.loadingCharge ? `₹${lr.loadingCharge}` : '₹0'}</span>
              </div>
              {lr.gstPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #000' }}>
                  <span style={{ fontSize: '11px' }}>GST ({lr.gstPercent}%):</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lr.gstAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '2px solid #000', backgroundColor: '#f1f2f6' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Gross Total:</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{lr.grossTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #000' }}>
                <span style={{ fontSize: '11px' }}>Less Advance:</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lr.advance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#e74c3c', color: 'white' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>TO PAY:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{lr.toPay}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="grid-row" style={{ borderTop: '2px solid #000', borderBottom: 'none', minHeight: '100px' }}>
            <div className="grid-col terms-box" style={{ flex: '0 0 35%', padding: '10px' }}>
              <span className="label-text" style={{ borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px' }}>Terms & Conditions</span>
              <ol style={{ paddingLeft: '12px', margin: 0 }}>
                <li>Goods transported entirely at owner's risk.</li>
                <li>The company is not responsible for leakage, breakage, or theft.</li>
                <li>Demurrage will be charged after 48 hours of arrival.</li>
                <li>Subject to Jurisdiction.</li>
              </ol>
            </div>
            
            <div className="grid-col" style={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '10px' }}>
              <div style={{ borderTop: '1px dashed #000', width: '80%', textAlign: 'center', paddingTop: '4px', fontSize: '11px' }}>
                Consignor's Signature
              </div>
            </div>
            
            <div className="grid-col" style={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '10px' }}>
              <div style={{ borderTop: '1px dashed #000', width: '80%', textAlign: 'center', paddingTop: '4px', fontSize: '11px' }}>
                Driver's Signature
              </div>
            </div>

            <div className="grid-col" style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
              <div style={{ fontSize: '10px', textAlign: 'center' }}>For <strong>{companySettings.companyName || 'R.K. TRADERS & LOGISTICS'}</strong></div>
              <div style={{ borderTop: '1px dashed #000', width: '100%', textAlign: 'center', paddingTop: '4px', fontSize: '11px' }}>
                Authorised Signatory
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LRDetails;
