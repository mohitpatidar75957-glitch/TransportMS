import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdCheckCircle } from 'react-icons/md';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  // Force document body & html to black background while on Landing Page
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.setProperty('background-color', '#111317', 'important');
    document.documentElement.style.setProperty('background-color', '#111317', 'important');
    document.body.classList.add('landing-page-active');

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.classList.remove('landing-page-active');
    };
  }, []);

  // Active Tab: 'product' | 'solutions' | 'pricing' | 'company' | 'book-demo'
  const [activeTab, setActiveTab] = useState('product');

  // Pricing cycle
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Modal
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    fleetSize: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (type) => {
    if (type === 'demo') {
      setActiveTab('book-demo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (type === 'contact' || type === 'contact-sales') {
      setActiveTab('company');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setModalType(type);
      setSubmitted(false);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSubmitted(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isDemo = activeTab === 'book-demo' || activeTab === 'company' || modalType === 'demo';
      await fetch('/api/v1/management/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formData.name,
          email: formData.email,
          phone: formData.phone || 'N/A',
          company: formData.company,
          fleetSize: formData.fleetSize,
          subject: isDemo ? `Demo Request - ${formData.company || formData.name}` : 'General Inquiry from Website',
          messageBody: formData.message || (isDemo ? `Demo Request for ${formData.fleetSize ? formData.fleetSize + ' vehicles' : 'fleet'}. Phone: ${formData.phone || 'N/A'}, Company: ${formData.company || 'N/A'}` : 'Website Inquiry'),
          status: 'Unread'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit message:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Figma Top Header Bar */}
      <header className="landing-header">
        <div className="landing-header-inner">
          {/* Brand Logo */}
          <div className="landing-brand" onClick={() => setActiveTab('product')}>
            <span className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16L11 9L15 13L19 7" stroke="#111317" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="brand-text">FREIGHTLANE</span>
          </div>

          {/* Center Navigation Tabs with Orange Underline Indicator */}
          <nav className="landing-nav-center">
            <button 
              type="button"
              className={`nav-item ${activeTab === 'product' ? 'active' : ''}`}
              onClick={() => setActiveTab('product')}
            >
              Product
            </button>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'solutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('solutions')}
            >
              Solutions
            </button>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={() => setActiveTab('pricing')}
            >
              Pricing
            </button>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              Company
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="landing-actions-right">
            <button 
              type="button"
              className="btn-contact-text" 
              onClick={() => {
                setActiveTab('company');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Contact
            </button>
            <button 
              type="button"
              className="btn-book-demo" 
              onClick={() => handleOpenModal('demo')}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          TAB 1: PRODUCT (THE COMPLETE TMS PLATFORM)
         ========================================================================= */}
      {activeTab === 'product' && (
        <main className="landing-main-content">
          {/* Top Hero Section */}
          <section className="product-hero-section">
            <div className="container">
              <div className="hero-tagline">PLATFORM OVERVIEW</div>
              <h1 className="hero-heading">THE COMPLETE<br />TMS PLATFORM.</h1>
              <p className="hero-subtext">
                Six integrated modules covering the complete transportation lifecycle —<br />
                from load planning through financial settlement — built for operations that<br />
                run at scale.
              </p>
            </div>
          </section>

          {/* 6 Modules Grid (Row 1: 01, 02, 03 | Row 2: 04, 05, 06) */}
          <section className="product-modules-section">
            <div className="container">
              <div className="modules-grid">
                
                {/* 01 FLEET MANAGEMENT */}
                <div className="module-box">
                  <div className="module-title-row">
                    <span className="module-index">01</span>
                    <h3 className="module-name">FLEET MANAGEMENT</h3>
                  </div>
                  <ul className="module-bullet-list">
                    <li>Vehicle master with type, capacity, ownership, and registration details</li>
                    <li>Document expiry tracking — RC, insurance, PUC, fitness certificate, permits</li>
                    <li>Maintenance schedule management with service history</li>
                    <li>Fuel consumption tracking per vehicle and per trip</li>
                    <li>Fleet utilization reports by period, route, and driver</li>
                  </ul>
                </div>

                {/* 02 TRIP OPERATIONS */}
                <div className="module-box">
                  <div className="module-title-row">
                    <span className="module-index">02</span>
                    <h3 className="module-name">TRIP OPERATIONS</h3>
                  </div>
                  <ul className="module-bullet-list">
                    <li>Load and consignment management from customer request to dispatch</li>
                    <li>Route planning with origin, destination, and intermediate stops</li>
                    <li>Vehicle and driver assignment with availability conflict detection</li>
                    <li>Vendor and third-party carrier assignment</li>
                    <li>LR/Bilty and e-way bill generation at trip creation</li>
                  </ul>
                </div>

                {/* 03 LIVE TRACKING */}
                <div className="module-box">
                  <div className="module-title-row">
                    <span className="module-index">03</span>
                    <h3 className="module-name">LIVE TRACKING</h3>
                  </div>
                  <ul className="module-bullet-list">
                    <li>Real-time GPS position from driver mobile app or GPS device</li>
                    <li>Route deviation alerts with configurable threshold</li>
                    <li>Live ETA calculation with traffic and historical data</li>
                    <li>Customer-facing tracking link shareable from trip record</li>
                    <li>Speed violation and halt duration alerts</li>
                  </ul>
                </div>

                {/* 04 DOCUMENT MANAGEMENT */}
                <div className="module-box">
                  <div className="module-title-row">
                    <span className="module-index">04</span>
                    <h3 className="module-name">DOCUMENT MANAGEMENT</h3>
                  </div>
                  <ul className="module-bullet-list">
                    <li>LR, POD, e-way bill, invoice — generated and stored per trip</li>
                    <li>Driver mobile app for POD photo capture with GPS stamp</li>
                    <li>Document approval workflows for invoice release</li>
                    <li>Expiry alerts for fleet documents with renewal tracking</li>
                    <li>Full document audit trail with timestamps</li>
                  </ul>
                </div>

                {/* 05 FINANCE & BILLING */}
                <div className="module-box">
                  <div className="module-title-row">
                    <span className="module-index">05</span>
                    <h3 className="module-name">FINANCE & BILLING</h3>
                  </div>
                  <ul className="module-bullet-list">
                    <li>Freight invoice generation from trip actuals</li>
                    <li>Vendor and driver settlement with advances and deductions</li>
                    <li>Fuel accounting with card reconciliation</li>
                    <li>Per-trip profit and loss with cost itemization</li>
                    <li>Receivables aging and payment tracking</li>
                  </ul>
                </div>

                {/* 06 ANALYTICS & REPORTS */}
                <div className="module-box">
                  <div className="module-title-row">
                    <span className="module-index">06</span>
                    <h3 className="module-name">ANALYTICS & REPORTS</h3>
                  </div>
                  <ul className="module-bullet-list">
                    <li>Operational KPI dashboard by period, route, and vehicle</li>
                    <li>Route profitability analysis</li>
                    <li>Driver efficiency and compliance reports</li>
                    <li>Customer-wise revenue and freight reports</li>
                    <li>Export to Excel and PDF for sharing</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* Action CTA Banner */}
          <section className="product-action-banner">
            <div className="container banner-flex">
              <div className="banner-left">
                <h2 className="banner-title">SEE EVERY MODULE IN ACTION.</h2>
                <p className="banner-subtitle">Live walkthrough tailored to your fleet size and operation type.</p>
              </div>
              <div className="banner-right">
                <button 
                  type="button" 
                  className="btn-book-demo large"
                  onClick={() => handleOpenModal('demo')}
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =========================================================================
          TAB 2: SOLUTIONS (SOLUTIONS BY ROLE)
         ========================================================================= */}
      {activeTab === 'solutions' && (
        <main className="landing-main-content">
          <section className="product-hero-section">
            <div className="container">
              <div className="hero-tagline">SOLUTIONS BY ROLE</div>
              <h1 className="hero-heading">ONE PLATFORM.<br />SIX WORKSPACES.</h1>
              <p className="hero-subtext">
                Every role in your transportation business gets a purpose-built<br />
                experience — with the right information, the right actions, and nothing<br />
                irrelevant in the way.
              </p>
            </div>
          </section>

          {/* 5 Split Role Cards - EXACT FIGMA MATCH */}
          <section className="product-modules-section">
            <div className="container">
              <div className="solutions-roles-container">
                
                {/* 1. BUSINESS OWNER */}
                <div className="solution-role-card">
                  <div className="role-card-left">
                    <div className="role-tag-indicator">
                      <span className="role-tag-dot"></span>
                      BUSINESS OWNER
                    </div>
                    <div className="role-headline-box">
                      <h2 className="role-headline">RUN YOUR BUSINESS ON ONE NUMBER.</h2>
                    </div>
                    <p className="role-description-p">
                      Revenue, costs, fleet utilization, receivables, and per-trip profitability — visible in a single dashboard. No more pulling reports from three different places to understand if the business is making money.
                    </p>
                  </div>
                  <div className="role-card-right">
                    <div className="capabilities-header">KEY CAPABILITIES</div>
                    <ul className="capabilities-list">
                      <li>Business P&L by period and route</li>
                      <li>Fleet ROI and utilization tracking</li>
                      <li>Receivables aging and cash flow view</li>
                      <li>Vendor cost and margin analysis</li>
                      <li>One-click management reports</li>
                    </ul>
                  </div>
                </div>

                {/* 2. OPERATIONS MANAGER */}
                <div className="solution-role-card">
                  <div className="role-card-left">
                    <div className="role-tag-indicator blue">
                      <span className="role-tag-dot"></span>
                      OPERATIONS MANAGER
                    </div>
                    <div className="role-headline-box blue">
                      <h2 className="role-headline">DISPATCH FASTER, RESOLVE EXCEPTIONS BEFORE THEY ESCALATE.</h2>
                    </div>
                    <p className="role-description-p">
                      Plan loads, assign vehicles and drivers, dispatch trips, and monitor active operations — all without switching between tools or WhatsApp messages. Exceptions appear automatically so you can act before the customer calls.
                    </p>
                  </div>
                  <div className="role-card-right">
                    <div className="capabilities-header">KEY CAPABILITIES</div>
                    <ul className="capabilities-list">
                      <li>Load planning and vehicle assignment</li>
                      <li>Driver availability and compliance check</li>
                      <li>Live dispatch board with trip status</li>
                      <li>Exception queue with direct actions</li>
                      <li>Automated driver and customer notifications</li>
                    </ul>
                  </div>
                </div>

                {/* 3. ACCOUNTANT */}
                <div className="solution-role-card">
                  <div className="role-card-left">
                    <div className="role-tag-indicator green">
                      <span className="role-tag-dot"></span>
                      ACCOUNTANT
                    </div>
                    <div className="role-headline-box green">
                      <h2 className="role-headline">BILL ON TIME, SETTLE ACCURATELY, RECONCILE WITHOUT SPREADSHEETS.</h2>
                    </div>
                    <p className="role-description-p">
                      Freight invoices generated directly from trip actuals. Vendor settlements calculated with advances, deductions, and fuel charges. Receivables tracked per customer with payment history.
                    </p>
                  </div>
                  <div className="role-card-right">
                    <div className="capabilities-header">KEY CAPABILITIES</div>
                    <ul className="capabilities-list">
                      <li>Auto-invoice from trip completion</li>
                      <li>Vendor and driver payment settlement</li>
                      <li>Fuel card and expense reconciliation</li>
                      <li>Per-trip margin and cost visibility</li>
                      <li>Receivables and payables dashboards</li>
                    </ul>
                  </div>
                </div>

                {/* 4. DRIVER */}
                <div className="solution-role-card">
                  <div className="role-card-left">
                    <div className="role-tag-indicator">
                      <span className="role-tag-dot"></span>
                      DRIVER
                    </div>
                    <div className="role-headline-box">
                      <h2 className="role-headline">THE INFORMATION YOU NEED. NOTHING YOU DON'T.</h2>
                    </div>
                    <p className="role-description-p">
                      Trip instructions, delivery address, special notes, and POD capture — on a simple mobile interface built for people who are driving, not sitting at a desk.
                    </p>
                  </div>
                  <div className="role-card-right">
                    <div className="capabilities-header">KEY CAPABILITIES</div>
                    <ul className="capabilities-list">
                      <li>Today's trip details and route</li>
                      <li>In-app navigation integration</li>
                      <li>Delivery confirmation and photo POD</li>
                      <li>Issue reporting and driver comms</li>
                      <li>Earnings and trip history</li>
                    </ul>
                  </div>
                </div>

                {/* 5. VENDOR & CARRIER */}
                <div className="solution-role-card">
                  <div className="role-card-left">
                    <div className="role-tag-indicator purple">
                      <span className="role-tag-dot"></span>
                      VENDOR & CARRIER
                    </div>
                    <div className="role-headline-box purple">
                      <h2 className="role-headline">MANAGE YOUR LOADS. TRACK YOUR PAYMENTS.</h2>
                    </div>
                    <p className="role-description-p">
                      External carriers and fleet owners get a dedicated portal to see assigned loads, upload delivery documents, track freight earnings, and follow payment status — without needing full platform access.
                    </p>
                  </div>
                  <div className="role-card-right">
                    <div className="capabilities-header">KEY CAPABILITIES</div>
                    <ul className="capabilities-list">
                      <li>Assigned trip and load visibility</li>
                      <li>Rate card and earnings tracking</li>
                      <li>Payment status and history</li>
                      <li>Document upload for POD and invoices</li>
                      <li>Vendor-level performance reports</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <section className="product-action-banner">
            <div className="container banner-flex">
              <div className="banner-left">
                <h2 className="banner-title">READY TO EMPOWER YOUR TEAMS?</h2>
                <p className="banner-subtitle">Get your operations running on purpose-built workspaces.</p>
              </div>
              <div className="banner-right">
                <button type="button" className="btn-book-demo large" onClick={() => handleOpenModal('demo')}>
                  Book a Demo
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =========================================================================
          TAB 3: PRICING (STRAIGHTFORWARD PRICING)
         ========================================================================= */}
      {activeTab === 'pricing' && (
        <main className="landing-main-content">
          <section className="product-hero-section pricing-hero-center">
            <div className="container pricing-center-container">
              <div className="hero-tagline center">PRICING</div>
              <h1 className="hero-heading center">STRAIGHTFORWARD PRICING.</h1>
              <p className="hero-subtext center">
                No setup fees. No per-trip charges. Flat monthly pricing based<br />
                on fleet size.
              </p>

              <div className="pricing-toggle-container center">
                <div className="pricing-toggle-pills">
                  <button 
                    type="button" 
                    className={`toggle-pill ${billingCycle === 'monthly' ? 'active' : ''}`}
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-pill ${billingCycle === 'annual' ? 'active' : ''}`}
                    onClick={() => setBillingCycle('annual')}
                  >
                    Annual — 20% off
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="product-modules-section">
            <div className="container">
              <div className="pricing-cards-grid">
                
                {/* PLAN 1: ESSENTIAL */}
                <div className="pricing-plan-card">
                  <div className="pricing-card-top">
                    <div className="plan-vehicle-tag">UP TO 25 VEHICLES</div>
                    <h3 className="plan-name">ESSENTIAL</h3>
                    <div className="plan-price">
                      <span className="currency">₹</span>
                      <span className="amount">{billingCycle === 'monthly' ? '12,000' : '9,600'}</span>
                      <span className="period">per month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="annual-billed-label">Billed annually</div>
                    )}
                    <ul className="plan-perks">
                      <li>Fleet and driver management</li>
                      <li>Trip planning and dispatch</li>
                      <li>Basic live tracking</li>
                      <li>LR/Bilty and POD management</li>
                      <li>Freight invoicing</li>
                      <li>Standard reports</li>
                      <li>3 user roles (Owner, Manager, Driver)</li>
                      <li>Email support</li>
                    </ul>
                  </div>
                  <button className="btn-plan-action outline" onClick={() => handleOpenModal('demo')}>
                    Start Free Trial
                  </button>
                </div>

                {/* PLAN 2: OPERATIONS (MOST POPULAR) */}
                <div className="pricing-plan-card featured">
                  <div className="plan-badge">MOST POPULAR</div>
                  <div className="pricing-card-top">
                    <div className="plan-vehicle-tag">UP TO 100 VEHICLES</div>
                    <h3 className="plan-name">OPERATIONS</h3>
                    <div className="plan-price">
                      <span className="currency">₹</span>
                      <span className="amount">{billingCycle === 'monthly' ? '28,000' : '22,400'}</span>
                      <span className="period">per month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="annual-billed-label">Billed annually</div>
                    )}
                    <ul className="plan-perks">
                      <li>Everything in Essential</li>
                      <li>Advanced live tracking with deviation alerts</li>
                      <li>Vendor and carrier management</li>
                      <li>Full finance module with settlement</li>
                      <li>Per-trip P&L and profitability analytics</li>
                      <li>All 6 user roles</li>
                      <li>Customer tracking portal</li>
                      <li>Priority support with SLA</li>
                    </ul>
                  </div>
                  <button className="btn-plan-action primary" onClick={() => handleOpenModal('demo')}>
                    Start Free Trial
                  </button>
                </div>

                {/* PLAN 3: ENTERPRISE */}
                <div className="pricing-plan-card">
                  <div className="pricing-card-top">
                    <div className="plan-vehicle-tag">100+ VEHICLES</div>
                    <h3 className="plan-name">ENTERPRISE</h3>
                    <div className="plan-price custom">
                      <span className="amount-text">Custom pricing</span>
                    </div>
                    <p className="plan-sub-text">Tailored to your fleet and operation</p>
                    <ul className="plan-perks">
                      <li>Everything in Operations</li>
                      <li>Unlimited vehicles and users</li>
                      <li>Custom integrations (ERP, WMS, GPS)</li>
                      <li>Multi-branch and multi-business</li>
                      <li>Dedicated implementation support</li>
                      <li>Custom reports and dashboards</li>
                      <li>SSO and advanced permissions</li>
                      <li>Dedicated account manager</li>
                    </ul>
                  </div>
                  <button 
                    className="btn-plan-action outline" 
                    onClick={() => {
                      setActiveTab('company');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Contact Sales
                  </button>
                </div>

              </div>

              {/* Bottom 4-Column Feature Highlight Banner */}
              <div className="pricing-highlights-bar">
                <div className="highlight-item">
                  <h4 className="highlight-title">14-day free trial</h4>
                  <p className="highlight-desc">No credit card required. Full access to all features.</p>
                </div>
                <div className="highlight-item">
                  <h4 className="highlight-title">No setup fees</h4>
                  <p className="highlight-desc">We handle onboarding and data migration at no extra cost.</p>
                </div>
                <div className="highlight-item">
                  <h4 className="highlight-title">Cancel anytime</h4>
                  <p className="highlight-desc">Month-to-month plans with no lock-in or termination fees.</p>
                </div>
                <div className="highlight-item">
                  <h4 className="highlight-title">Volume discounts</h4>
                  <p className="highlight-desc">Running 200+ vehicles? Ask about fleet-level pricing.</p>
                </div>
              </div>

            </div>
          </section>
        </main>
      )}

      {/* =========================================================================
          TAB 4: COMPANY (ABOUT FREIGHTLANE)
         ========================================================================= */}
      {activeTab === 'company' && (
        <main className="landing-main-content">
          {/* Section 1: Hero Story + 5 Stats Cards */}
          <section className="product-hero-section">
            <div className="container">
              <div className="hero-tagline">ABOUT FREIGHTLANE</div>
              <div className="company-split-layout">
                <div className="company-story">
                  <h1 className="hero-heading">BUILT BY PEOPLE<br />WHO RAN FLEETS.</h1>
                  <p className="company-text">
                    Freightlane was built after spending years inside transportation businesses — 
                    watching operations teams juggle spreadsheets, WhatsApp messages, and 
                    disconnected software to manage things that should be automatic.
                  </p>
                  <p className="company-text">
                    We built the platform we wished existed: one system that connects planning, 
                    dispatch, tracking, documents, billing, and settlement — with every role in the 
                    business working from the same data.
                  </p>
                  <p className="company-sub-location">
                    Headquartered in Indore, India. Serving transport and logistics businesses across South Asia.
                  </p>
                </div>

                <div className="company-stats-grid">
                  <div className="stat-card large">
                    <div className="stat-value orange">2026</div>
                    <p className="stat-desc">Founded with a single focus: operations-first TMS built for Indian logistics.</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">50+</div>
                    <p className="stat-desc">Active fleets</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">₹ 200Cr+</div>
                    <p className="stat-desc">Freight processed</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">12K+</div>
                    <p className="stat-desc">Trips completed</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">6</div>
                    <p className="stat-desc">Role-specific workspaces</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: WHAT WE BELIEVE / DESIGN PRINCIPLES (4 Columns) */}
          <section className="company-principles-section">
            <div className="container">
              <div className="principles-tagline">WHAT WE BELIEVE</div>
              <h2 className="principles-heading">DESIGN PRINCIPLES.</h2>

              <div className="principles-grid">
                <div className="principle-card">
                  <div className="principle-index">01</div>
                  <h3 className="principle-title">OPERATIONAL TRUTH</h3>
                  <p className="principle-desc">
                    We build software that reflects how transportation actually works — messy, fast-moving, time-critical. No idealised workflows.
                  </p>
                </div>

                <div className="principle-card">
                  <div className="principle-index">02</div>
                  <h3 className="principle-title">ROLE CLARITY</h3>
                  <p className="principle-desc">
                    Every person in a transport business has a distinct job. Our software is designed around those jobs, not around generic feature trees.
                  </p>
                </div>

                <div className="principle-card">
                  <div className="principle-index">03</div>
                  <h3 className="principle-title">FINANCIAL PRECISION</h3>
                  <p className="principle-desc">
                    The gap between operations and finance costs transport businesses lakhs every month. We close that gap by default.
                  </p>
                </div>

                <div className="principle-card">
                  <div className="principle-index">04</div>
                  <h3 className="principle-title">TRUST THROUGH AUDIT</h3>
                  <p className="principle-desc">
                    Every action in the system is traceable. Who did what, when, and why — visible to whoever needs to see it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Contact & Demo Split Section */}
          <section className="company-contact-split-section">
            <div className="container">
              <div className="company-contact-grid">
                
                {/* Left Column: Get In Touch */}
                <div className="contact-col-left">
                  <div className="section-tag-small">CONTACT</div>
                  <h2 className="contact-section-heading">GET IN TOUCH.</h2>

                  <div className="contact-info-block">
                    <div className="contact-label">CALL US / PHONE</div>
                    <a href="tel:+917987880769" className="contact-value-link">+91 7987880769</a>
                  </div>

                  <div className="contact-info-block">
                    <div className="contact-label">EMAIL US</div>
                    <a href="mailto:info@codervu.com" className="contact-value-link">info@codervu.com</a>
                  </div>

                  <div className="contact-info-block">
                    <div className="contact-label">SALES & DEMOS</div>
                    <a href="mailto:info@codervu.com" className="contact-value-link">info@codervu.com</a>
                  </div>

                  <div className="contact-info-block">
                    <div className="contact-label">OFFICE / VISIT US</div>
                    <div className="contact-value-text" style={{ lineHeight: '1.6', maxWidth: '380px' }}>
                      3rd floor, Swadesh Bhawan, 302-B, AB Rd, Swadesh Bhavan, Press Complex, Indore, Madhya Pradesh 452001
                    </div>
                  </div>
                </div>

                {/* Right Column: In-page Demo Request Form */}
                <div className="demo-col-right">
                  <div className="section-tag-small">BOOK A DEMO</div>
                  <h2 className="contact-section-heading">SEE IT IN YOUR OPERATION.</h2>
                  <p className="demo-col-subtext">
                    30-minute call. We'll understand your operation, show you the relevant modules, and answer implementation questions. No sales pitch.
                  </p>

                  {submitted ? (
                    <div className="demo-inline-success">
                      <MdCheckCircle size={36} color="#10b981" />
                      <h4>Demo Request Received</h4>
                      <p>Thank you! Our operations specialist will contact you to schedule your walkthrough.</p>
                    </div>
                  ) : (
                    <form className="company-demo-form" onSubmit={handleSubmit}>
                      <input 
                        type="text" 
                        name="name" 
                        className="company-input" 
                        placeholder="Full name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                      />
                      <input 
                        type="text" 
                        name="company" 
                        className="company-input" 
                        placeholder="Business name" 
                        value={formData.company} 
                        onChange={handleChange} 
                        required 
                      />
                      <input 
                        type="email" 
                        name="email" 
                        className="company-input" 
                        placeholder="Email address" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                      />
                      <input 
                        type="tel" 
                        name="phone" 
                        className="company-input" 
                        placeholder="Phone number" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                      />
                      <input 
                        type="text" 
                        name="fleetSize" 
                        className="company-input" 
                        placeholder="Fleet size (approx no. of vehicles)" 
                        value={formData.fleetSize} 
                        onChange={handleChange} 
                      />
                      <button type="submit" className="company-demo-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Request a Demo'}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </section>

        </main>
      )}

      {/* =========================================================================
          TAB 5: BOOK A DEMO / START TRIAL (LET'S TALK OPERATIONS)
         ========================================================================= */}
      {activeTab === 'book-demo' && (
        <main className="landing-main-content">
          <section className="demo-page-section">
            <div className="demo-page-inner">
              
              {/* Top Orange Calendar Icon */}
              <div className="demo-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111317" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                </svg>
              </div>

              {/* Tagline */}
              <div className="demo-tagline">SCHEDULE A DEMO</div>

              {/* Headline */}
              <h1 className="demo-heading">LET'S TALK OPERATIONS.</h1>

              {/* Subtitle */}
              <p className="demo-subtext">
                Fill in the form below and our team will reach out within one business day<br />
                to schedule a walkthrough tailored to your fleet and operation.
              </p>

              {/* Form */}
              {submitted ? (
                <div className="demo-success-box">
                  <MdCheckCircle size={48} color="#10b981" />
                  <h3>Request Received!</h3>
                  <p>Thank you, {formData.name || 'there'}. Our enterprise operations team will reach out to you within one business day.</p>
                  <button type="button" className="btn-plan-action primary" onClick={() => { setSubmitted(false); setActiveTab('product'); }}>
                    Back to Platform
                  </button>
                </div>
              ) : (
                <form className="demo-form-container" onSubmit={handleSubmit}>
                  <div className="demo-input-group">
                    <input 
                      type="text" 
                      name="name" 
                      className="demo-input" 
                      placeholder="Full name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="demo-input-group">
                    <input 
                      type="text" 
                      name="company" 
                      className="demo-input" 
                      placeholder="Company name" 
                      value={formData.company} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="demo-input-group">
                    <input 
                      type="email" 
                      name="email" 
                      className="demo-input" 
                      placeholder="Email address" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="demo-input-group">
                    <input 
                      type="tel" 
                      name="phone" 
                      className="demo-input" 
                      placeholder="Phone number" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>

                  <div className="demo-input-group">
                    <input 
                      type="text" 
                      name="fleetSize" 
                      className="demo-input" 
                      placeholder="Fleet size (approx. no. of vehicles)" 
                      value={formData.fleetSize} 
                      onChange={handleChange} 
                    />
                  </div>

                  <button type="submit" className="demo-submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>

                  <p className="demo-disclaimer-text">
                    By submitting this form you agree to be contacted by our sales team. We don't share your information with third parties.
                  </p>
                </form>
              )}

            </div>
          </section>
        </main>
      )}

      {/* =========================================================================
          FIGMA EXACT 4-COLUMN FOOTER (FREIGHTLANE, PLATFORM, SOLUTIONS, COMPANY)
         ========================================================================= */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-columns-grid">
            
            {/* Column 1: Brand Logo & Tagline */}
            <div className="footer-col-brand">
              <div className="footer-brand-logo">
                <span className="brand-icon small">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 16L11 9L15 13L19 7" stroke="#111317" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>FREIGHTLANE</span>
              </div>
              <p className="footer-brand-text">
                One connected system for planning, executing, and financially closing 
                transportation operations.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div className="footer-col">
              <h4 className="footer-heading">PLATFORM</h4>
              <ul className="footer-link-list">
                <li><button type="button" onClick={() => setActiveTab('product')}>Product Overview</button></li>
                <li><button type="button" onClick={() => setActiveTab('product')}>Fleet Management</button></li>
                <li><button type="button" onClick={() => setActiveTab('product')}>Trip Operations</button></li>
                <li><button type="button" onClick={() => setActiveTab('product')}>Finance & Billing</button></li>
                <li><button type="button" onClick={() => setActiveTab('product')}>Analytics</button></li>
              </ul>
            </div>

            {/* Column 3: Solutions Links */}
            <div className="footer-col">
              <h4 className="footer-heading">SOLUTIONS</h4>
              <ul className="footer-link-list">
                <li><button type="button" onClick={() => setActiveTab('solutions')}>For Business Owners</button></li>
                <li><button type="button" onClick={() => setActiveTab('solutions')}>For Operations Managers</button></li>
                <li><button type="button" onClick={() => setActiveTab('solutions')}>For Accountants</button></li>
                <li><button type="button" onClick={() => setActiveTab('solutions')}>For Drivers</button></li>
                <li><button type="button" onClick={() => setActiveTab('solutions')}>For Vendors</button></li>
              </ul>
            </div>

            {/* Column 4: Company Links */}
            <div className="footer-col">
              <h4 className="footer-heading">COMPANY</h4>
              <ul className="footer-link-list">
                <li><button type="button" onClick={() => setActiveTab('company')}>About</button></li>
                <li><button type="button" onClick={() => setActiveTab('pricing')}>Pricing</button></li>
                <li><button type="button" onClick={() => handleOpenModal('contact')}>Contact</button></li>
                <li><button type="button" onClick={() => handleOpenModal('demo')}>Book a Demo</button></li>
                <li><a href="/login" style={{ color: '#ff6b00', fontWeight: 600 }}>TMS Login →</a></li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

      {/* Contact & Book a Demo Modal */}
      {modalType && (
        <div className="landing-modal-overlay" onClick={handleCloseModal}>
          <div className="landing-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <MdClose size={22} />
            </button>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <MdCheckCircle size={56} style={{ color: '#2ed573', marginBottom: '16px' }} />
                <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 8px 0' }}>Request Received!</h3>
                <p style={{ color: '#8395a7', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                  Thank you for reaching out. A Freightlane operations specialist will get in touch with you shortly.
                </p>
                <button className="modal-submit-btn" onClick={handleCloseModal} style={{ width: '100%' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="modal-title">
                  {modalType === 'demo' ? 'Schedule a Product Demo' : 'Contact Freightlane Team'}
                </h3>
                <p className="modal-desc">
                  {modalType === 'demo' 
                    ? 'Get a tailored 1-on-1 walkthrough of the Transport Management System for your fleet.'
                    : 'Have questions or want custom enterprise integrations? Leave us a message below.'}
                </p>

                <form className="modal-form" onSubmit={handleSubmit}>
                  <div className="modal-form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="e.g. Rahul Sharma" 
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="modal-form-group">
                      <label>Work Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="rahul@logistics.com" 
                        required 
                      />
                    </div>
                    <div className="modal-form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+91 98765 43210" 
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div className="modal-form-group">
                      <label>Company / Transporter Name</label>
                      <input 
                        type="text" 
                        name="company" 
                        value={formData.company} 
                        onChange={handleChange} 
                        placeholder="Sharma Roadways" 
                      />
                    </div>
                    <div className="modal-form-group">
                      <label>Fleet Size</label>
                      <select name="fleetSize" value={formData.fleetSize} onChange={handleChange}>
                        <option value="1-5 Trucks">1 - 5 Trucks</option>
                        <option value="5-15 Trucks">5 - 15 Trucks</option>
                        <option value="15-50 Trucks">15 - 50 Trucks</option>
                        <option value="50+ Trucks">50+ Trucks</option>
                      </select>
                    </div>
                  </div>

                  {modalType === 'contact' && (
                    <div className="modal-form-group">
                      <label>Your Message / Requirements</label>
                      <textarea 
                        name="message" 
                        rows="3" 
                        value={formData.message} 
                        onChange={handleChange} 
                        placeholder="Tell us about your fleet requirements..." 
                      />
                    </div>
                  )}

                  <button type="submit" className="modal-submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : (modalType === 'demo' ? 'Confirm Demo Request' : 'Send Message')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
