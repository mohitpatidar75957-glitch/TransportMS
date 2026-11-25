import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Label } from '../components/shared';

const plans = [
  {
    name: 'Essential',
    price: { monthly: 12000, annual: 9600 },
    fleet: 'Up to 25 vehicles',
    highlight: false,
    cta: 'Start Free Trial',
    ctaTo: '/book-demo',
    features: [
      'Fleet and driver management',
      'Trip planning and dispatch',
      'Basic live tracking',
      'LR/Bilty and POD management',
      'Freight invoicing',
      'Standard reports',
      '3 user roles (Owner, Manager, Driver)',
      'Email support',
    ],
  },
  {
    name: 'Operations',
    price: { monthly: 28000, annual: 22400 },
    fleet: 'Up to 100 vehicles',
    highlight: true,
    cta: 'Start Free Trial',
    ctaTo: '/book-demo',
    features: [
      'Everything in Essential',
      'Advanced live tracking with deviation alerts',
      'Vendor and carrier management',
      'Full finance module with settlement',
      'Per-trip P&L and profitability analytics',
      'All 6 user roles',
      'Customer tracking portal',
      'Priority support with SLA',
    ],
  },
  {
    name: 'Enterprise',
    price: null,
    fleet: '100+ vehicles',
    highlight: false,
    cta: 'Contact Sales',
    ctaTo: '/company',
    features: [
      'Everything in Operations',
      'Unlimited vehicles and users',
      'Custom integrations (ERP, WMS, GPS)',
      'Multi-branch and multi-business',
      'Dedicated implementation support',
      'Custom reports and dashboards',
      'SSO and advanced permissions',
      'Dedicated account manager',
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '5rem 2rem 4rem', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <Label>Pricing</Label>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 0.95, textTransform: 'uppercase', margin: '0 0 1.5rem' }}>
            Straightforward pricing.
          </h1>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.1rem', color: 'var(--muted-foreground)', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            No setup fees. No per-trip charges. Flat monthly pricing based on fleet size.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {(['monthly', 'annual'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: '0.5rem 1.25rem',
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: billing === b ? 'var(--primary)' : 'transparent',
                  color: billing === b ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {b === 'monthly' ? 'Monthly' : 'Annual — 20% off'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {plans.map(plan => (
              <div
                key={plan.name}
                style={{
                  border: plan.highlight ? '2px solid var(--primary)' : '1px solid var(--border)',
                  padding: '2.5rem',
                  background: plan.highlight ? 'var(--card)' : 'transparent',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    padding: '0.25rem 0.75rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}

                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.75rem' }}>
                  {plan.fleet}
                </span>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.75rem', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                  {plan.name}
                </h2>

                {/* Price display */}
                <div style={{ marginBottom: '1.75rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--border)' }}>
                  {plan.price ? (
                    <>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '3rem', lineHeight: 1, color: 'var(--foreground)' }}>
                        ₹ {(billing === 'annual' ? plan.price.annual : plan.price.monthly).toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginLeft: '0.5rem' }}>
                        per month
                      </span>
                      {billing === 'annual' && (
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--primary)', marginTop: '0.375rem' }}>
                          Billed annually
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '2rem', color: 'var(--foreground)' }}>
                        Custom pricing
                      </span>
                      <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.375rem' }}>
                        Tailored to your fleet and operation
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                        <path d="M2 7L5.5 10.5L12 4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — always at bottom due to flex column + flex: 1 on feature list */}
                <NavLink
                  to={plan.ctaTo}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: plan.highlight ? 'var(--primary)' : 'transparent',
                    color: plan.highlight ? 'var(--primary-foreground)' : 'var(--foreground)',
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    padding: '0.875rem',
                    textDecoration: 'none',
                    border: plan.highlight ? '2px solid var(--primary)' : '1px solid var(--border)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    if (plan.highlight) {
                      el.style.opacity = '0.85';
                    } else {
                      el.style.borderColor = 'var(--muted-foreground)';
                      el.style.color = 'var(--foreground)';
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.opacity = '1';
                    if (!plan.highlight) {
                      el.style.borderColor = 'var(--border)';
                      el.style.color = 'var(--foreground)';
                    }
                  }}
                >
                  {plan.cta}
                </NavLink>
              </div>
            ))}
          </div>

          {/* Reassurances */}
          <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--card)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: '14-day free trial', desc: 'No credit card required. Full access to all features.' },
              { title: 'No setup fees', desc: 'We handle onboarding and data migration at no extra cost.' },
              { title: 'Cancel anytime', desc: 'Month-to-month plans with no lock-in or termination fees.' },
              { title: 'Volume discounts', desc: 'Running 200+ vehicles? Ask about fleet-level pricing.' },
            ].map(item => (
              <div key={item.title}>
                <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.375rem' }}>{item.title}</h4>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
