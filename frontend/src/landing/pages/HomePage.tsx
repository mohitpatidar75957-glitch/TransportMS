import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Label } from '../components/shared';

/* ─── Primitives ─────────────────────────────────────────── */
const Section = ({ children, style = {}, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
  <section style={{ padding: '5rem 2rem', ...style }} className={className}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
  </section>
);

const Divider = () => <div style={{ width: 40, height: 2, background: 'var(--primary)', marginBottom: '1.5rem' }} />;

/* ─── Hero right panel: Live Operations Widget ───────────── */
const liveTrips = [
  { id: 'TN09 AB 1234', route: 'Chennai → Bengaluru', status: 'In Transit', eta: '14:30', speed: '67 km/h', color: '#E8830C', icon: '→' },
  { id: 'TN04 EF 9012', route: 'Coimbatore → Chennai', status: 'On Schedule', eta: '16:00', speed: '72 km/h', color: '#6EBF8B', icon: '→' },
  { id: 'TN07 CD 5678', route: 'Chennai → Hyderabad', status: 'Delayed +45m', eta: '19:15', speed: '54 km/h', color: '#D94A4A', icon: '!' },
  { id: 'TN11 GH 3456', route: 'Bengaluru → Mumbai', status: 'Checkpoint', eta: '22:45', speed: '0 km/h', color: '#4A7FC1', icon: '◉' },
  { id: 'TN02 KL 7890', route: 'Chennai → Kolkata', status: 'Dispatched', eta: 'Tomorrow', speed: '81 km/h', color: '#8A6DC4', icon: '→' },
];

function HeroWidget() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      gap: '1px',
      overflow: 'hidden',
    }}>
      {/* Widget header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} className="status-live" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Live Dispatch</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--border)' }}>
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Trip rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
        {liveTrips.map((trip, i) => {
          const isHighlighted = i === tick % liveTrips.length;
          return (
            <div
              key={trip.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: isHighlighted ? 'rgba(232,131,12,0.06)' : 'rgba(255,255,255,0.02)',
                borderLeft: `2px solid ${isHighlighted ? trip.color : 'transparent'}`,
                transition: 'all 0.5s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', fontWeight: 500, color: 'var(--foreground)' }}>{trip.id}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: trip.color, background: `${trip.color}18`, padding: '0.1rem 0.4rem' }}>{trip.status}</span>
                </div>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{trip.route}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>ETA {trip.eta}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{trip.speed}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Widget footer */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>28 trips active</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--primary)' }}>4 exceptions</span>
      </div>
    </div>
  );
}

/* ─── Trust ticker ───────────────────────────────────────── */
const tickerItems = [
  '28 active trips in transit',
  '94% fleet utilization today',
  '₹ 2.4Cr freight billed this month',
  '4 exceptions surfaced automatically',
  '12 deliveries confirmed with POD',
  '6 role-specific workspaces',
  '100% document audit trail',
  'Zero manual invoice entry',
  'Real-time GPS · < 30s update',
];

function StatsTicker() {
  const repeated = [...tickerItems, ...tickerItems];
  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--card)',
      padding: '0.75rem 0',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: '4rem', width: 'max-content', animation: 'tickerScroll 40s linear infinite', willChange: 'transform' }}>
        {repeated.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>{item}</span>
            <span style={{ color: 'var(--border)', fontSize: '0.6rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Live Route Map SVG ─────────────────────────────────── */
function LiveRouteMap() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        {/* Grid */}
        {[0,1,2,3,4,5].map(i => (
          <line key={`h${i}`} x1="0" y1={i * 64} x2="800" y2={i * 64} stroke="#1E2025" strokeWidth="1" />
        ))}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
          <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="320" stroke="#1E2025" strokeWidth="1" />
        ))}

        {/* Route A — primary (amber) */}
        <path d="M 40 260 C 120 220 200 180 300 150 S 480 110 600 80 Q 700 60 760 50"
          fill="none" stroke="#E8830C" strokeWidth="2.5" opacity="0.25" />
        <path d="M 40 260 C 120 220 200 180 300 150 S 480 110 600 80 Q 700 60 760 50"
          fill="none" stroke="#E8830C" strokeWidth="2" opacity="0.8"
          strokeDasharray="10 5" className="route-dash" />

        {/* Route B — secondary (blue) */}
        <path d="M 40 260 C 180 270 300 255 420 240 S 580 230 700 190 L 760 170"
          fill="none" stroke="#4A7FC1" strokeWidth="1.5" opacity="0.15" />
        <path d="M 40 260 C 180 270 300 255 420 240 S 580 230 700 190 L 760 170"
          fill="none" stroke="#4A7FC1" strokeWidth="1.5" opacity="0.5"
          strokeDasharray="6 6" className="route-dash-slow" />

        {/* Route C — tertiary (green, dashed) */}
        <path d="M 40 260 L 150 290 Q 280 305 400 285 T 640 265 L 760 260"
          fill="none" stroke="#6EBF8B" strokeWidth="1" opacity="0.35"
          strokeDasharray="4 8" />

        {/* Origin hub */}
        <circle cx="40" cy="260" r="12" fill="#0C0D10" stroke="#E8830C" strokeWidth="1.5" opacity="0.4" />
        <circle cx="40" cy="260" r="5"  fill="#E8830C" />
        <text x="56" y="256" fill="#8A8D96" fontSize="8" fontFamily="JetBrains Mono, monospace">Chennai</text>

        {/* Waypoints */}
        {[
          { x: 300, y: 150, label: 'Bengaluru', st: '#6EBF8B' },
          { x: 480, y: 112, label: 'Pune', st: '#E8830C' },
          { x: 600, y: 80,  label: 'Mumbai', st: '#4A7FC1' },
        ].map(({ x, y, label, st }) => (
          <g key={label}>
            <circle cx={x} cy={y} r="7" fill="#141619" stroke={st} strokeWidth="1.5" />
            <circle cx={x} cy={y} r="3" fill={st} />
            <text x={x} y={y - 14} textAnchor="middle" fill="#8A8D96" fontSize="8" fontFamily="JetBrains Mono, monospace">{label}</text>
          </g>
        ))}

        {/* Destination */}
        <rect x="748" y="38" width="24" height="24" fill="#0C0D10" stroke="#6EBF8B" strokeWidth="1.5" />
        <text x="760" y="54" textAnchor="middle" fill="#6EBF8B" fontSize="9" fontFamily="JetBrains Mono, monospace">POD</text>

        {/* Active vehicle */}
        <circle cx="430" cy="130" r="14" fill="#E8830C" opacity="0.08" />
        <circle cx="430" cy="130" r="14" fill="none" stroke="#E8830C" strokeWidth="1" opacity="0.3" className="pulse-ring" />
        <circle cx="430" cy="130" r="6"  fill="#E8830C" />
        <rect   x="446" y="116" width="120" height="32" fill="#141619" stroke="#2A2D35" strokeWidth="1" />
        <text x="456" y="128" fill="#E8830C" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="500">TN09 AB 1234</text>
        <text x="456" y="140" fill="#8A8D96" fontSize="7.5" fontFamily="JetBrains Mono, monospace">67 km/h · ETA 14:30</text>

        {/* Status chips */}
        <rect x="580" y="230" width="108" height="32" fill="#141619" stroke="#2A2D35" strokeWidth="1" />
        <circle cx="593" cy="246" r="3" fill="#D94A4A" className="status-live" />
        <text x="603" y="243" fill="#EDEDEA" fontSize="8" fontFamily="Barlow, sans-serif">TN07 CD 5678</text>
        <text x="603" y="254" fill="#8A8D96" fontSize="7" fontFamily="JetBrains Mono, monospace">Delayed · +45 min</text>

        <rect x="100" y="48" width="108" height="32" fill="#141619" stroke="#2A2D35" strokeWidth="1" />
        <circle cx="113" cy="64"  r="3" fill="#6EBF8B" />
        <text x="123" y="61" fill="#EDEDEA" fontSize="8" fontFamily="Barlow, sans-serif">TN04 EF 9012</text>
        <text x="123" y="72" fill="#8A8D96" fontSize="7" fontFamily="JetBrains Mono, monospace">On Schedule</text>

        {/* Legend badge */}
        <rect x="16" y="10" width="86" height="18" fill="#0C0D10" stroke="#2A2D35" strokeWidth="1" />
        <circle cx="26" cy="19" r="3" fill="#E8830C" className="status-live" />
        <text x="34" y="22" fill="#8A8D96" fontSize="7.5" fontFamily="JetBrains Mono, monospace">LIVE DISPATCH</text>
      </svg>
    </div>
  );
}

/* ─── Trip Lifecycle Flow ────────────────────────────────── */
const lifecycleSteps = [
  { id: '01', label: 'Load Request', sub: 'Order received',    color: '#4A7FC1',
    detail: 'Customer loads or requests are captured, validated and queued for planning. Every trip starts with a clear, traceable origin.' },
  { id: '02', label: 'Trip Planning', sub: 'Route & timeline', color: '#4A7FC1',
    detail: 'Operations team defines routes, assigns timelines, calculates cost estimates and sets delivery commitments before any vehicle moves.' },
  { id: '03', label: 'Assignment',   sub: 'Vehicle + Driver',  color: '#E8830C',
    detail: 'The right vehicle, driver, and vendor are matched to the trip. Assignments are locked and communicated automatically.' },
  { id: '04', label: 'Dispatch',     sub: 'Trip authorized',   color: '#E8830C',
    detail: 'Trip is formally authorized and dispatched. Driver receives route, instructions and all trip documents on their mobile app.' },
  { id: '05', label: 'Live Tracking',sub: 'GPS + alerts',      color: '#E8830C',
    detail: 'Real-time GPS tracking with status updates, ETA recalculation, and exception alerts for deviations or delays.' },
  { id: '06', label: 'POD',          sub: 'Delivery confirm',  color: '#6EBF8B',
    detail: 'Delivery confirmed with digital proof-of-delivery. Documents attached, signed, and filed automatically to the trip record.' },
  { id: '07', label: 'Billing',      sub: 'Invoice generated', color: '#6EBF8B',
    detail: 'Invoice generated from trip actuals — distance, weight, charges, deductions — and sent with full audit trail.' },
  { id: '08', label: 'Settlement',   sub: 'Reconciliation',    color: '#6EBF8B',
    detail: 'Vendor payments settled, freight charges reconciled, and all financial entries posted to the business ledger.' },
  { id: '09', label: 'Profitability',sub: 'P&L per trip',      color: '#8A6DC4',
    detail: 'Per-trip profit and loss calculated automatically. Contribution by route, vehicle, driver, customer and vendor visible in one view.' },
];

function LifecycleFlow() {
  const [active, setActive] = useState(4);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % lifecycleSteps.length), 2400);
    return () => clearInterval(t);
  }, []);

  const step = lifecycleSteps[active];

  return (
    <div>
      {/* Step pills — scrollable on mobile */}
      <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 720, borderBottom: '1px solid var(--border)' }}>
          {lifecycleSteps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              style={{
                flex: 1,
                background: i === active ? 'var(--card)' : 'none',
                border: 'none',
                cursor: 'pointer',
                borderTop: `3px solid ${i === active ? s.color : 'transparent'}`,
                borderRight: i < lifecycleSteps.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '1rem 0.75rem',
                textAlign: 'left',
                transition: 'background 0.3s, border-top-color 0.3s',
              }}
            >
              <span style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: i === active ? s.color : 'var(--border)', marginBottom: '0.375rem' }}>{s.id}</span>
              <span style={{ display: 'block', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.02em', color: i === active ? 'var(--foreground)' : 'var(--muted-foreground)', marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ display: 'block', fontFamily: 'Barlow, sans-serif', fontSize: '0.7rem', color: 'var(--border)' }}>{s.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active detail */}
      <div style={{ padding: '1.75rem', background: 'var(--card)', border: '1px solid var(--border)', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center', minHeight: 100 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: step.color, background: `${step.color}18`, padding: '0.2rem 0.5rem' }}>STEP {step.id}</span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.02em' }}>{step.label}</span>
          </div>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.65 }}>{step.detail}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{active + 1} of {lifecycleSteps.length}</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {lifecycleSteps.map((_, i) => (
              <div key={i} style={{ width: 16, height: 2, background: i === active ? step.color : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product modules ────────────────────────────────────── */
const modules = [
  { icon: '⬡', title: 'Fleet',         desc: 'Vehicle master, maintenance schedules, document expiry, utilization tracking.', metrics: ['142 vehicles', '94% utilization'] },
  { icon: '◈', title: 'Drivers',        desc: 'Driver profiles, attendance, licence validity, performance and trip history.',    metrics: ['89 active drivers', '3 alerts'] },
  { icon: '◉', title: 'Trips',          desc: 'Full trip lifecycle from load planning through dispatch, tracking, and closure.', metrics: ['28 active', '4 exceptions'] },
  { icon: '⊙', title: 'Live Tracking',  desc: 'GPS position updates, route deviation detection, ETA predictions, driver comms.', metrics: ['Real-time', '< 30s latency'] },
  { icon: '▣', title: 'Documents',      desc: 'LR/Bilty, POD, e-way bill, invoice — generated, attached and filed per trip.',   metrics: ['Zero manual filing'] },
  { icon: '◧', title: 'Finance',        desc: 'Freight billing, vendor payments, fuel accounting, P&L per trip and period.',    metrics: ['₹ 2.4Cr MTD'] },
  { icon: '⊞', title: 'Analytics',      desc: 'Operational KPIs, route profitability, driver efficiency, cost variance reports.', metrics: ['18 report types'] },
];

/* ─── Roles ──────────────────────────────────────────────── */
const roles = [
  { role: 'Business Owner',     color: '#E8830C', focus: 'Business performance, financial health, fleet overview, exception escalations.', priorities: ['Revenue vs Target', 'Fleet Utilization', 'Receivables Aging', 'P&L by Route', 'Critical Alerts'] },
  { role: 'Operations Manager', color: '#4A7FC1', focus: 'Day-to-day dispatch, vehicle and driver assignment, trip monitoring, exceptions.', priorities: ["Today's Trips", 'Unassigned Loads', 'Active Exceptions', 'Driver Availability', 'ETA Dashboard'] },
  { role: 'Accountant',         color: '#6EBF8B', focus: 'Billing, vendor settlement, payment reconciliation, financial reporting.',         priorities: ['Pending Invoices', 'Vendor Payables', 'Fuel Reconciliation', 'Freight Margin', 'GST Reporting'] },
  { role: 'Driver',             color: '#C4905A', focus: 'Trip instructions, current load details, POD capture, document submission.',        priorities: ['Current Trip', 'Route & Stops', 'Delivery Notes', 'Upload POD', 'Report Issue'] },
  { role: 'Vendor',             color: '#8A6DC4', focus: 'Assigned trips, freight earnings, payment status, document upload.',                priorities: ['Assigned Loads', 'Pending PODs', 'Payment Due', 'Trip History', 'Rate Card'] },
  { role: 'Super Admin',        color: '#5A8A7A', focus: 'Platform health, account management, user roles, system configuration.',            priorities: ['Account Status', 'Platform Health', 'User Activity', 'Audit Logs', 'System Config'] },
];

/* ─── Exceptions ─────────────────────────────────────────── */
const exceptions = [
  { type: 'Delayed Trip',       count: 4,  sev: 'high',   desc: 'TN09AB1234 — 2h 15m behind schedule on Mumbai–Pune route',         action: 'Notify Customer' },
  { type: 'Missing POD',        count: 7,  sev: 'high',   desc: 'Proof of delivery not uploaded for 7 completed trips',             action: 'Chase Drivers' },
  { type: 'Route Deviation',    count: 2,  sev: 'medium', desc: 'Vehicle departed 34 km from planned route · Alert sent',           action: 'View Map' },
  { type: 'Document Expiry',    count: 3,  sev: 'medium', desc: 'FC expiry in < 7 days for TN04EF9012, TN07CD5678',                 action: 'Schedule Renewal' },
  { type: 'Payment Overdue',    count: 12, sev: 'low',    desc: '₹ 18.4L receivables past 45-day credit term',                     action: 'Send Reminders' },
  { type: 'Vehicle Alert',      count: 1,  sev: 'medium', desc: 'Engine temperature warning — TN11GH3456 pulled to depot',          action: 'Assign Backup' },
];

const sevColor: Record<string, string> = { high: '#D94A4A', medium: '#E8830C', low: '#4A7FC1' };

/* ─── Outcomes ───────────────────────────────────────────── */
const outcomes = [
  { metric: '34%',   label: 'Reduction in manual data entry across planning and billing workflows' },
  { metric: '28%',   label: 'Improvement in on-time delivery rate within 6 months of deployment' },
  { metric: '₹ 12L', label: 'Average monthly recovery in unbilled freight identified by the system' },
  { metric: '91%',   label: 'Document compliance rate with automated filing and expiry alerts' },
  { metric: '3 days',label: 'Average reduction in invoice-to-payment cycle through automated billing' },
  { metric: '1 view',label: 'Complete operational and financial picture — one connected platform' },
];

/* ─── Main export ────────────────────────────────────────── */
export default function HomePage() {
  const [activeRole, setActiveRole] = useState(0);
  const [visible, setVisible]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div>
      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
        minHeight: '90vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }} className="hero-grid">
        {/* Background grid texture */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="pg" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#1E2025" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pg)" />
          </svg>
        </div>

        {/* Left: copy */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: 'clamp(3rem,6vw,6rem) clamp(1.5rem,4vw,4rem)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.65s ease, transform 0.65s ease',
        }}>
          <Label>Transport Management System · 2026</Label>

          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(3.25rem, 6vw, 6.5rem)',
            lineHeight: 0.94,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            margin: '0 0 1.75rem',
          }}>
            One connected<br />
            <span style={{ color: 'var(--primary)' }}>system</span><br />
            for every trip.
          </h1>

          <p style={{
            fontFamily: 'Barlow, sans-serif',
            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
            fontWeight: 300,
            color: 'var(--muted-foreground)',
            maxWidth: 500,
            lineHeight: 1.75,
            marginBottom: '2.25rem',
          }}>
            Plan, assign, dispatch, track, deliver, bill, and settle — all in one platform built for transportation operations that can't afford gaps between systems.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '3.5rem' }}>
            <NavLink
              to="/book-demo"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.75rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Request a Demo
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
            </NavLink>
            <NavLink
              to="/product"
              style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', color: 'var(--muted-foreground)', textDecoration: 'none', paddingBottom: '2px', borderBottom: '1px solid var(--border)', transition: 'color 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--foreground)'; el.style.borderBottomColor = 'var(--muted-foreground)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--muted-foreground)'; el.style.borderBottomColor = 'var(--border)'; }}
            >
              Explore the Platform
            </NavLink>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            {[
              { v: '9 stages',   l: 'Connected trip lifecycle' },
              { v: '6 roles',    l: 'Purpose-built workspaces' },
              { v: 'Real-time',  l: 'GPS & exception alerts' },
              { v: '100%',       l: 'Audit trail' },
            ].map(({ v, l }) => (
              <div key={v}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.6rem', lineHeight: 1, letterSpacing: '0.01em', marginBottom: '0.2rem' }}>{v}</div>
                <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live dispatch widget */}
        <div style={{
          position: 'relative', zIndex: 1,
          borderLeft: '1px solid var(--border)',
          background: 'var(--card)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.65s ease 0.2s',
        }} className="hero-right">
          {/* Corner label */}
          <div style={{ borderBottom: '1px solid var(--border)', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Operations Dashboard</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--border)' }}>Freightlane TMS</span>
          </div>
          <HeroWidget />
        </div>
      </section>

      {/* ── 2. STATS TICKER ──────────────────────────────────── */}
      <StatsTicker />

      {/* ── 3. LIVE OPERATIONS MAP ───────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="col-2-asym" style={{ minHeight: 420 }}>
            {/* Info panel */}
            <div style={{ padding: '3rem 2.5rem', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Label>Live Operations</Label>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,3.5vw,2.75rem)', lineHeight: 1.02, textTransform: 'uppercase', marginBottom: '1rem' }}>
                Your fleet,<br />always visible.
              </h2>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                Every active trip on one operational map. GPS tracking, live ETA, and instant exception alerts — so your team always knows what's moving, where, and why.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { dot: '#E8830C', text: '28 trips active right now' },
                  { dot: '#D94A4A', text: '4 exceptions require attention' },
                  { dot: '#6EBF8B', text: '12 deliveries confirmed today' },
                ].map(({ dot, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Map */}
            <div style={{ background: 'var(--card)', minHeight: 320 }}>
              <LiveRouteMap />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. TRIP LIFECYCLE ────────────────────────────────── */}
      <Section>
        <Label>Connected Lifecycle</Label>
        <div className="col-2" style={{ gap: '3rem', marginBottom: '2.5rem', alignItems: 'start' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2.25rem,3.5vw,3rem)', lineHeight: 1.02, textTransform: 'uppercase', margin: 0 }}>
            Every stage.<br />One system.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.75 }}>
            From load request to final settlement and P&L report, every stage is connected. No handoffs between systems. No data re-entry. No gaps in the audit trail.
          </p>
        </div>
        <LifecycleFlow />
      </Section>

      {/* ── 5. PRODUCT MODULES ───────────────────────────────── */}
      <Section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '4rem 2rem' }}>
        <Label>Platform Modules</Label>
        <div className="col-2" style={{ gap: '2rem', marginBottom: '2.5rem', alignItems: 'end' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2.25rem,3.5vw,2.75rem)', lineHeight: 1.02, textTransform: 'uppercase', margin: 0 }}>
            Built for the<br />full operation.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.75 }}>
            Seven integrated modules that eliminate separate software for fleet, dispatch, tracking, documents, and finance.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', border: '1px solid var(--border)' }}>
          {modules.map((mod, i) => (
            <div
              key={mod.title}
              style={{
                padding: '1.75rem',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(232,131,12,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>{mod.icon}</div>
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{mod.title}</h3>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.65, marginBottom: '1rem' }}>{mod.desc}</p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {mod.metrics.map(m => (
                  <span key={m} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--primary)', background: 'rgba(232,131,12,0.1)', padding: '0.2rem 0.5rem' }}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 6. ROLE-BASED WORKSPACES ─────────────────────────── */}
      <Section>
        <Label>Role-Specific Workspaces</Label>
        <div className="col-2" style={{ gap: '2rem', marginBottom: '2.5rem', alignItems: 'end' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2.25rem,3.5vw,2.75rem)', lineHeight: 1.02, textTransform: 'uppercase', margin: 0 }}>
            Six roles.<br />One platform.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.75 }}>
            Every user sees exactly what they need. Business owners see financial overview. Managers see operations. Drivers get trip instructions. All connected to the same data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', border: '1px solid var(--border)' }} className="role-grid">
          {/* Role tabs + content */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }} className="col-2-panel">
            {/* Sidebar */}
            <div style={{ borderRight: '1px solid var(--border)' }}>
              {roles.map((r, i) => (
                <button
                  key={r.role}
                  onClick={() => setActiveRole(i)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '1rem 1.25rem',
                    background: i === activeRole ? 'var(--card)' : 'transparent',
                    border: 'none',
                    borderBottom: i < roles.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: i === activeRole ? `2px solid ${r.color}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: i === activeRole ? 600 : 400,
                    color: i === activeRole ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {r.role}
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div style={{ padding: '2.5rem', background: 'var(--card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: roles[activeRole].color }} />
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{roles[activeRole].role}</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.925rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                {roles[activeRole].focus}
              </p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.875rem' }}>Dashboard Priorities</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {roles[activeRole].priorities.map((p, i) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'var(--border)', width: 18 }}>0{i + 1}</span>
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem' }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. EXCEPTIONS ────────────────────────────────────── */}
      <Section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '4rem 2rem' }}>
        <Label>Exception Management</Label>
        <div className="col-2" style={{ gap: '2rem', marginBottom: '2.5rem', alignItems: 'end' }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2.25rem,3.5vw,2.75rem)', lineHeight: 1.02, textTransform: 'uppercase', margin: 0 }}>
            Exceptions<br />surface first.
          </h2>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.75 }}>
            Freightlane surfaces what needs attention before it becomes a problem. Delays, missing documents, route deviations, and payment issues appear in one view — with direct actions.
          </p>
        </div>

        {/* Desktop table */}
        <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }} className="exc-table">
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 130px', padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
            {['Exception', 'Latest instance', 'Count', 'Action'].map(h => (
              <span key={h} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{h}</span>
            ))}
          </div>
          {exceptions.map((ex, i) => (
            <div
              key={ex.type}
              style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 130px', padding: '1rem 1.25rem', borderBottom: i < exceptions.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', transition: 'background 0.15s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 5, height: 5, background: sevColor[ex.sev], flexShrink: 0 }} />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.875rem' }}>{ex.type}</span>
              </div>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)', paddingRight: '1.5rem' }}>{ex.desc}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: sevColor[ex.sev], fontWeight: 500 }}>{ex.count}</span>
              <button
                style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(232,131,12,0.1)', border: '1px solid rgba(232,131,12,0.2)', padding: '0.375rem 0.75rem', cursor: 'pointer', transition: 'background 0.2s', width: 'fit-content' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(232,131,12,0.22)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(232,131,12,0.1)'}
              >
                {ex.action}
              </button>
            </div>
          ))}
        </div>

        {/* Mobile cards (shown < 900px via CSS) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="exc-cards">
          {exceptions.map(ex => (
            <div key={ex.type} style={{ border: '1px solid var(--border)', padding: '1rem 1.25rem', borderLeft: `3px solid ${sevColor[ex.sev]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>{ex.type}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: sevColor[ex.sev] }}>{ex.count}</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: '0 0 0.875rem', lineHeight: 1.5 }}>{ex.desc}</p>
              <button style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(232,131,12,0.1)', border: '1px solid rgba(232,131,12,0.2)', padding: '0.375rem 0.875rem', cursor: 'pointer' }}>{ex.action}</button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 8. DASHBOARD PLACEHOLDER ─────────────────────────── */}
      <Section>
        <Label>Product Interface</Label>
        <div className="col-2" style={{ gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,3.5vw,2.75rem)', lineHeight: 1.02, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Built for operators,<br />not analysts.
            </h2>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              Every role gets a dashboard that surfaces what matters first. Real-time data, financial summaries, and exception queues — without configuration or custom reports.
            </p>
            <NavLink to="/book-demo" style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', borderBottom: '1px solid var(--primary)', paddingBottom: '2px' }}>
              See it live →
            </NavLink>
          </div>

          {/* Dashboard placeholder */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--card)', aspectRatio: '16/9', position: 'relative', overflow: 'hidden', minHeight: 200 }}>
            {/* Chrome bar */}
            <div style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {['#2A2D35','#2A2D35','#2A2D35'].map((c, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: '0.625rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>freightlane.app / dashboard</span>
            </div>
            <div style={{ display: 'flex', height: 'calc(100% - 28px)' }}>
              {/* Sidebar icons */}
              <div style={{ width: 40, borderRight: '1px solid var(--border)', background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '0.875rem 0.625rem' }}>
                {['⬡','◈','◉','⊙','▣','◧','⊞'].map(ic => (
                  <div key={ic} style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--border)' }}>{ic}</div>
                ))}
              </div>
              {/* Main area */}
              <div style={{ flex: 1, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {/* KPI row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[{v:'28',l:'Active Trips'},{v:'94%',l:'Fleet Util.'},{v:'₹ 2.4Cr',l:'Revenue MTD'},{v:'4',l:'Exceptions'}].map(({v,l}) => (
                    <div key={l} style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.5rem' }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)' }}>{v}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: 'var(--muted-foreground)', marginTop: '0.1rem' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {/* Placeholder chart */}
                <div style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'var(--border)', textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.8 }}>
                    Product screenshot<br />placeholder
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9. OUTCOMES ──────────────────────────────────────── */}
      <Section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '4rem 2rem' }}>
        <Label>Measured Outcomes</Label>
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 'clamp(2.25rem,3.5vw,2.75rem)', lineHeight: 1.02, textTransform: 'uppercase', marginBottom: '3rem', maxWidth: 600 }}>
          Numbers from<br />real operations.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', border: '1px solid var(--border)' }}>
          {outcomes.map((o, i) => (
            <div key={o.metric} style={{ padding: '2rem', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,3.5rem)', lineHeight: 1, color: 'var(--primary)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>{o.metric}</div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.65, margin: 0 }}>{o.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 10. FINAL CTA ────────────────────────────────────── */}
      <Section>
        <div className="col-2" style={{ gap: '4rem', alignItems: 'start' }}>
          <div>
            <Divider />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 0.96, textTransform: 'uppercase', margin: '0 0 1.25rem' }}>
              Ready to run a tighter operation?
            </h2>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '2rem' }}>
              Talk to our team. We'll walk through your current operation, map the gaps, and show you exactly how Freightlane connects the pieces.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <NavLink to="/book-demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.75rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                Book a Demo
              </NavLink>
              <NavLink to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', color: 'var(--muted-foreground)', textDecoration: 'none', padding: '0.875rem 1.25rem', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--muted-foreground)'; el.style.color = 'var(--foreground)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted-foreground)'; }}
              >
                View Pricing
              </NavLink>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '3.5rem' }}>
            {[
              { q: 'How long does implementation take?', a: 'Most businesses are operationally live within 2–4 weeks. Data migration and team onboarding are handled by us.' },
              { q: 'Can we migrate from our current software?', a: 'Yes. We import vehicle, driver, and trip data from CSV exports or direct API connections from most logistics platforms.' },
              { q: 'Is it a SaaS subscription?', a: 'Yes. Monthly or annual plans based on fleet size and active users. No setup fees or per-trip charges.' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '1.75rem', paddingBottom: '1.75rem', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.925rem', marginBottom: '0.5rem' }}>{item.q}</h4>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.65, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid    { grid-template-columns: 1fr !important; }
          .hero-right   { border-left: none !important; border-top: 1px solid var(--border); }
          .col-2-asym   { grid-template-columns: 1fr !important; }
          .col-2-panel  { grid-template-columns: 1fr !important; }
          .col-2        { grid-template-columns: 1fr !important; }
          .exc-table    { display: none !important; }
          .exc-cards    { display: flex !important; }
        }
        @media (min-width: 901px) {
          .exc-cards { display: none !important; }
        }
      `}</style>
    </div>
  );
}
