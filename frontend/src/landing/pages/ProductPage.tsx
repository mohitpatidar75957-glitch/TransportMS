import { NavLink } from 'react-router-dom';
import { Label } from '../components/shared';

const features = [
  {
    module: 'Fleet Management',
    id: '01',
    items: [
      'Vehicle master with type, capacity, ownership, and registration details',
      'Document expiry tracking — RC, insurance, PUC, fitness certificate, permits',
      'Maintenance schedule management with service history',
      'Fuel consumption tracking per vehicle and per trip',
      'Fleet utilization reports by period, route, and driver',
    ],
  },
  {
    module: 'Trip Operations',
    id: '02',
    items: [
      'Load and consignment management from customer request to dispatch',
      'Route planning with origin, destination, and intermediate stops',
      'Vehicle and driver assignment with availability conflict detection',
      'Vendor and third-party carrier assignment',
      'LR/Bilty and e-way bill generation at trip creation',
    ],
  },
  {
    module: 'Live Tracking',
    id: '03',
    items: [
      'Real-time GPS position from driver mobile app or GPS device',
      'Route deviation alerts with configurable threshold',
      'Live ETA calculation with traffic and historical data',
      'Customer-facing tracking link shareable from trip record',
      'Speed violation and halt duration alerts',
    ],
  },
  {
    module: 'Document Management',
    id: '04',
    items: [
      'LR, POD, e-way bill, invoice — generated and stored per trip',
      'Driver mobile app for POD photo capture with GPS stamp',
      'Document approval workflows for invoice release',
      'Expiry alerts for fleet documents with renewal tracking',
      'Full document audit trail with timestamps',
    ],
  },
  {
    module: 'Finance & Billing',
    id: '05',
    items: [
      'Freight invoice generation from trip actuals',
      'Vendor and driver settlement with advances and deductions',
      'Fuel accounting with card reconciliation',
      'Per-trip profit and loss with cost itemization',
      'Receivables aging and payment tracking',
    ],
  },
  {
    module: 'Analytics & Reports',
    id: '06',
    items: [
      'Operational KPI dashboard by period, route, and vehicle',
      'Route profitability analysis',
      'Driver efficiency and compliance reports',
      'Customer-wise revenue and freight reports',
      'Export to Excel and PDF for sharing',
    ],
  },
];

export default function ProductPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '5rem 2rem 4rem', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Label>Platform Overview</Label>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 0.95, textTransform: 'uppercase', margin: '0 0 1.5rem', maxWidth: 800 }}>
            The complete<br />TMS platform.
          </h1>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.1rem', color: 'var(--muted-foreground)', maxWidth: 560, lineHeight: 1.7 }}>
            Six integrated modules covering the complete transportation lifecycle — from load planning through financial settlement — built for operations that run at scale.
          </p>
        </div>
      </section>

      {/* Module features */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {features.map(f => (
              <div key={f.module} style={{ border: '1px solid var(--border)', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(232,131,12,0.1)', padding: '0.2rem 0.5rem' }}>{f.id}</span>
                  <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.03em', margin: 0 }}>{f.module}</h2>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {f.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ width: 4, height: 4, background: 'var(--primary)', flexShrink: 0, marginTop: '0.45rem' }} />
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '2rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              See every module in action.
            </h3>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
              Live walkthrough tailored to your fleet size and operation type.
            </p>
          </div>
          <NavLink
            to="/book-demo"
            style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', padding: '0.875rem 1.75rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Book a Demo
          </NavLink>
        </div>
      </section>
    </div>
  );
}
