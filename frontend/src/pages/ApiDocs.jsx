import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdVpnKey, 
  MdPlayArrow, 
  MdContentCopy, 
  MdCheck, 
  MdWebhook, 
  MdSpeed, 
  MdSecurity, 
  MdArrowBack,
  MdCode,
  MdOutlineSend,
  MdRefresh
} from 'react-icons/md';
import './ApiDocs.css';

const ApiDocs = () => {
  const navigate = useNavigate();
  const [targetEnv, setTargetEnv] = useState('railway'); // Default to Live Railway so live data is always fetched!
  const [apiKey, setApiKey] = useState('tms_live_test_demo');
  const [activeTab, setActiveTab] = useState('get-trip');
  const [testParam, setTestParam] = useState('TRP-1001');
  const [testOrderBody, setTestOrderBody] = useState(JSON.stringify({
    pickupLocation: 'Pune',
    dropLocation: 'Nagpur',
    cargoDetails: 'Auto spare parts',
    weight: '12 Tons',
    amount: '₹21500',
    customerName: 'Tata Motors Vendors Ltd'
  }, null, 2));

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const getBaseUrl = () => {
    if (targetEnv === 'render') return 'https://transport-ms-backend.onrender.com';
    if (targetEnv === 'local') return 'http://localhost:8080';
    return window.location.origin;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleTestCall = async () => {
    setLoading(true);
    setApiResponse(null);

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey.trim()
    };

    const baseUrl = targetEnv === 'auto' ? '' : (targetEnv === 'render' ? 'https://transport-ms-backend.onrender.com' : (targetEnv === 'local' ? 'http://localhost:8080' : ''));

    try {
      let res;
      let url = '';
      if (activeTab === 'get-trip') {
        url = `${baseUrl}/api/v1/trips/${encodeURIComponent(testParam.trim())}`;
        res = await fetch(url, { method: 'GET', headers });
      } else if (activeTab === 'create-order') {
        url = `${baseUrl}/api/v1/orders`;
        res = await fetch(url, {
          method: 'POST',
          headers,
          body: testOrderBody
        });
      } else if (activeTab === 'list-orders') {
        url = `${baseUrl}/api/v1/orders`;
        res = await fetch(url, { method: 'GET', headers });
      }

      const status = res.status;
      const statusText = res.statusText;
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        data = rawText || statusText;
      }

      setApiResponse({
        status,
        statusText,
        url,
        data
      });
    } catch (err) {
      setApiResponse({
        status: 500,
        statusText: 'Client Network Error',
        url: '',
        data: { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const curlSnippet = activeTab === 'get-trip' 
    ? `curl -X GET "${getBaseUrl()}/api/v1/trips/${testParam}" \\\n  -H "X-API-KEY: ${apiKey}"`
    : activeTab === 'create-order'
    ? `curl -X POST "${getBaseUrl()}/api/v1/orders" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-KEY: ${apiKey}" \\\n  -d '${testOrderBody.replace(/\n\s*/g, ' ')}'`
    : `curl -X GET "${getBaseUrl()}/api/v1/orders" \\\n  -H "X-API-KEY: ${apiKey}"`;

  return (
    <div className="api-docs-page">
      {/* Top Navbar */}
      <header className="docs-navbar">
        <div className="docs-brand">
          <button className="docs-back-btn" onClick={() => navigate('/')}>
            <MdArrowBack size={18} />
            <span>Dashboard</span>
          </button>
          <div className="docs-title-badge">
            <span className="api-badge">API v1</span>
            <h1>TMS Developer & Partner Portal</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Target Environment Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '4px 8px', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Target:</span>
            <select
              value={targetEnv}
              onChange={(e) => setTargetEnv(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
            >
              <option value="auto" style={{ background: '#0f172a', color: '#fff' }}>Current Server ({window.location.host})</option>
              <option value="render" style={{ background: '#0f172a', color: '#fff' }}>Live Render (transport-ms-backend)</option>
              <option value="local" style={{ background: '#0f172a', color: '#fff' }}>Local Backend (localhost:8080)</option>
            </select>
          </div>

          <div className="docs-key-box">
            <MdVpnKey className="key-icon" />
            <input 
              type="text" 
              placeholder="Enter your X-API-KEY (tms_live_...)" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="api-key-input"
              title="Use your real API key generated in System Settings"
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="docs-container">
        
        {/* Left Side: Overview & Endpoints */}
        <div className="docs-sidebar">
          <div className="sidebar-section-title">Core Endpoints</div>
          <button 
            className={`endpoint-nav-btn ${activeTab === 'get-trip' ? 'active' : ''}`}
            onClick={() => { setActiveTab('get-trip'); setApiResponse(null); }}
          >
            <span className="http-pill get">GET</span>
            <span className="endpoint-name">/api/v1/trips/:id</span>
          </button>

          <button 
            className={`endpoint-nav-btn ${activeTab === 'create-order' ? 'active' : ''}`}
            onClick={() => { setActiveTab('create-order'); setApiResponse(null); }}
          >
            <span className="http-pill post">POST</span>
            <span className="endpoint-name">/api/v1/orders</span>
          </button>

          <button 
            className={`endpoint-nav-btn ${activeTab === 'list-orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('list-orders'); setApiResponse(null); }}
          >
            <span className="http-pill get">GET</span>
            <span className="endpoint-name">/api/v1/orders</span>
          </button>

          <button 
            className={`endpoint-nav-btn ${activeTab === 'webhooks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('webhooks'); setApiResponse(null); }}
          >
            <span className="http-pill webhook">HOOK</span>
            <span className="endpoint-name">Webhooks Guide</span>
          </button>

          <div className="api-specs-card">
            <h4><MdSpeed /> Rate Limits</h4>
            <p><strong>60 requests/minute</strong> per API Key. Calls exceeding this limit return HTTP 429 Too Many Requests.</p>

            <h4 style={{ marginTop: '14px' }}><MdSecurity /> Authentication</h4>
            <p>Send in request header: <br /><code>X-API-KEY: tms_live_...</code> or <br /><code>Authorization: Bearer tms_live_...</code></p>
          </div>
        </div>

        {/* Center / Right: Interactive Live Sandbox */}
        <main className="docs-main-content">
          
          {activeTab === 'webhooks' ? (
            <div className="endpoint-details-card">
              <div className="endpoint-header">
                <span className="http-badge webhook">WEBHOOK</span>
                <h2>Webhook Dispatch (Customer Automated Updates)</h2>
              </div>
              <p className="endpoint-description">
                Jab bhi aapke booked trip ka delivery status badalta hai, hamara TMS automatically aapke server endpoint par HTTP POST request send karta hai.
              </p>

              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>Example Webhook Payload (Event: trip.delivered)</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(`{\n  "event": "trip.delivered",\n  "trip_id": "TRP-42274",\n  "delivered_at": "2026-10-12T18:40:00+05:30",\n  "vehicle": "MH-04-AB-1234",\n  "pod_url": "/api/trips/1042/pod"\n}`, 'wh')}
                  >
                    {copiedSnippet === 'wh' ? <MdCheck /> : <MdContentCopy />}
                  </button>
                </div>
                <pre><code>{`{
  "event": "trip.delivered",
  "trip_id": "TRP-42274",
  "delivered_at": "2026-10-12T18:40:00+05:30",
  "vehicle": "MH-04-AB-1234",
  "pod_url": "/api/trips/1042/pod"
}`}</code></pre>
              </div>

              <div className="webhook-instructions">
                <h3>HMAC-SHA256 Signature Verification</h3>
                <p>Har outgoing webhook request me <code>X-TMS-Signature</code> header attach hota hai taaki aap verify kar sakein ki request sach me TMS server se aayi hai.</p>
              </div>
            </div>
          ) : (
            <div className="endpoint-details-card">
              <div className="endpoint-header">
                <span className={`http-badge ${activeTab === 'create-order' ? 'post' : 'get'}`}>
                  {activeTab === 'create-order' ? 'POST' : 'GET'}
                </span>
                <h2>
                  {activeTab === 'get-trip' && 'Get Live Trip Status & Location'}
                  {activeTab === 'create-order' && 'Book New Order / Truck Request'}
                  {activeTab === 'list-orders' && 'List All Active Customer Orders'}
                </h2>
              </div>
              
              <p className="endpoint-description">
                {activeTab === 'get-trip' && 'Retrieve real-time GPS location, dispatch date, route, cargo weight, and vehicle info using numeric ID or Trip Number.'}
                {activeTab === 'create-order' && 'Customer or enterprise ERP directly creates a truck booking order into TMS without human phone calls.'}
                {activeTab === 'list-orders' && 'Retrieve the real-time list of all booked orders and their current assignment states.'}
              </p>

              {/* Interactive Request Controls */}
              <div className="interactive-sandbox-box">
                <div className="sandbox-header">
                  <span>Interactive Test Console</span>
                  <button 
                    className="send-test-btn" 
                    onClick={handleTestCall}
                    disabled={loading}
                  >
                    {loading ? <MdRefresh className="spin-icon" /> : <MdOutlineSend />}
                    <span>{loading ? 'Sending...' : 'Send Live Request'}</span>
                  </button>
                </div>

                {activeTab === 'get-trip' && (
                  <div className="sandbox-input-row">
                    <label>Trip Identifier (ID or Trip Number):</label>
                    <input 
                      type="text" 
                      value={testParam}
                      onChange={(e) => setTestParam(e.target.value)}
                      className="sandbox-input"
                      placeholder="e.g. TRP-42274 or 1"
                    />
                  </div>
                )}

                {activeTab === 'create-order' && (
                  <div className="sandbox-input-row">
                    <label>JSON Request Body:</label>
                    <textarea 
                      value={testOrderBody}
                      onChange={(e) => setTestOrderBody(e.target.value)}
                      className="sandbox-textarea"
                      rows={7}
                    />
                  </div>
                )}
              </div>

              {/* cURL Snippet */}
              <div className="code-block-wrapper">
                <div className="code-header">
                  <span>cURL Command</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(curlSnippet, 'curl')}
                  >
                    {copiedSnippet === 'curl' ? <MdCheck /> : <MdContentCopy />}
                  </button>
                </div>
                <pre><code>{curlSnippet}</code></pre>
              </div>

              {/* Live Response Viewer */}
              {apiResponse && (
                <div className="response-viewer-wrapper">
                  <div className="response-header">
                    <div className="response-status-group">
                      <span className="res-label">Status:</span>
                      <span className={`status-tag ${apiResponse.status === 200 || apiResponse.status === 201 ? 'ok' : 'err'}`}>
                        {apiResponse.status} {apiResponse.statusText}
                      </span>
                    </div>
                    <span className="res-url">{apiResponse.url}</span>
                  </div>

                  {/* Highlights Grid for Quick Verification */}
                  {apiResponse.status === 200 && apiResponse.data && typeof apiResponse.data === 'object' && !Array.isArray(apiResponse.data) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', padding: '14px 18px', background: '#0b1324', borderBottom: '1px solid #1e293b' }}>
                      <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Freight Amount:</span>
                        <strong style={{ color: '#2ed573', fontSize: '15px' }}>₹{apiResponse.data.freight_amount != null ? Number(apiResponse.data.freight_amount).toLocaleString('en-IN') : '0'}</strong>
                      </div>
                      <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>GST Rate & Amount:</span>
                        <strong style={{ color: '#38bdf8', fontSize: '14px' }}>
                          {apiResponse.data.gst_percent || 0}% (₹{apiResponse.data.gst_amount != null ? Number(apiResponse.data.gst_amount).toLocaleString('en-IN') : '0'})
                        </strong>
                      </div>
                      <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Advance / Bilty:</span>
                        <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>
                          Adv: ₹{apiResponse.data.advance_amount || 0} | Bilty: ₹{apiResponse.data.bilty_charge || 0}
                        </span>
                      </div>
                      <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Assigned Fleet:</span>
                        <span style={{ color: '#ffa502', fontSize: '13px', fontWeight: 700 }}>
                          {apiResponse.data.vehicle || '-'} ({apiResponse.data.vehicle_type || 'Truck'})
                        </span>
                      </div>
                      <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Route & Distance:</span>
                        <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>
                          {apiResponse.data.from} ➔ {apiResponse.data.to} ({apiResponse.data.distance_km || 0} KM)
                        </span>
                      </div>
                      <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Trip Status:</span>
                        <span style={{ color: '#00cec9', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {apiResponse.data.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  )}

                  <pre className="response-body">
                    <code>{JSON.stringify(apiResponse.data, null, 2)}</code>
                  </pre>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ApiDocs;
