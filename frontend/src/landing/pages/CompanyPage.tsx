import React, { useState } from 'react';
import { Label } from '../components/shared';

const values = [
  { v: 'Operational truth', d: 'We build software that reflects how transportation actually works — messy, exception-heavy, and time-critical. No idealised workflows.' },
  { v: 'Role clarity', d: 'Every person in a transport business has a distinct job. Our software is designed around those jobs, not around generic feature trees.' },
  { v: 'Financial precision', d: 'The gap between operations and finance costs transport businesses lakhs every month. We close that gap by default.' },
  { v: 'Trust through audit', d: 'Every action in the system is traceable. Who did what, when, and why — visible to whoever needs to see it.' },
];

const contactItems = [
  { label: 'CALL US / PHONE', val: '+91 7987880769', link: 'tel:+917987880769' },
  { label: 'GENERAL ENQUIRIES', val: 'info@codervu.com', link: 'mailto:info@codervu.com' },
  { label: 'SALES & DEMOS', val: 'info@codervu.com', link: 'mailto:info@codervu.com' },
  { label: 'SUPPORT', val: 'info@codervu.com', link: 'mailto:info@codervu.com' },
  { label: 'OFFICE', val: '3rd floor, Swadesh Bhawan, 302-B, AB Rd, Press Complex, Indore, Madhya Pradesh 452001' },
];

export default function CompanyPage() {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    fleet: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/v1/management/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formData.name,
          email: formData.email,
          phone: formData.phone || 'N/A',
          company: formData.business,
          fleetSize: formData.fleet,
          subject: `Demo Request (Company Page) - ${formData.business || formData.name}`,
          messageBody: `Demo Request from Company Page for ${formData.fleet ? formData.fleet + ' vehicles' : 'fleet'}. Phone: ${formData.phone || 'N/A'}, Business: ${formData.business || 'N/A'}`,
          status: 'Unread'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit demo request:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {/* About hero */}
      <section style={{ padding: '5rem 2rem 4rem', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }} className="company-hero-grid">
          <div>
            <Label>About Freightlane</Label>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 0.95, textTransform: 'uppercase', margin: '0 0 2rem', maxWidth: 700 }}>
              Built by people<br />who ran fleets.
            </h1>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.05rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              Freightlane was built after spending years inside transportation businesses — watching operations teams juggle spreadsheets, WhatsApp messages, and disconnected software to manage things that should be automatic.
            </p>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.05rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              We built the platform we wished existed: one system that connects planning, dispatch, tracking, documents, billing, and settlement — with every role in the business working from the same data.
            </p>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.05rem', color: 'var(--muted-foreground)', lineHeight: 1.75 }}>
              Headquartered in Indore, India. Serving transport and logistics businesses across India.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '2rem', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '3.5rem', color: 'var(--primary)', lineHeight: 1, marginBottom: '0.5rem' }}>2026</div>
              <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Founded with a single focus: operations-first TMS built for Indian logistics.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { v: '50+', l: 'Active fleets' },
                { v: '₹ 200Cr+', l: 'Freight processed' },
                { v: '12K+', l: 'Trips completed' },
                { v: '6', l: 'Role-specific workspaces' },
              ].map(({ v, l }) => (
                <div key={l} style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '2rem', lineHeight: 1, marginBottom: '0.25rem' }}>{v}</div>
                  <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Design principles */}
      <section style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Label>What We Believe</Label>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '2.5rem', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
            Design principles.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {values.map((val, i) => (
              <div key={val.v} style={{ borderTop: '2px solid var(--primary)', paddingTop: '1.25rem' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.75rem' }}>0{i + 1}</span>
                <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.75rem' }}>{val.v}</h3>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.6, margin: 0 }}>{val.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + Demo form */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }} className="company-contact-grid">
          {/* Contact details */}
          <div>
            <Label>Contact</Label>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '2rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Get in touch.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {contactItems.map(({ label, val, link }: any, i: number) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    padding: '1.125rem 0',
                    borderBottom: i < contactItems.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{label}</span>
                  {link ? (
                    <a
                      href={link}
                      style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.95rem', color: 'var(--foreground)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--primary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'}
                    >
                      {val}
                    </a>
                  ) : (
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.95rem', color: 'var(--foreground)', lineHeight: 1.6 }}>{val}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Demo request form */}
          <div>
            <Label>Book a Demo</Label>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '2rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              See it in your operation.
            </h2>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              30-minute call. We'll understand your operation, show you the relevant modules, and answer implementation questions. No sales pitch.
            </p>
            {submitted ? (
              <div style={{ padding: '2rem', border: '1px solid var(--primary)', background: 'rgba(232, 131, 12, 0.08)', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.4rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Request Received
                </h3>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'var(--muted-foreground)', margin: 0 }}>
                  Thank you! Our operations team will contact you shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {[
                  { placeholder: 'Full name', type: 'text', name: 'name', value: formData.name },
                  { placeholder: 'Business name', type: 'text', name: 'business', value: formData.business },
                  { placeholder: 'Email address', type: 'email', name: 'email', value: formData.email },
                  { placeholder: 'Phone number', type: 'tel', name: 'phone', value: formData.phone },
                  { placeholder: 'Fleet size (approx)', type: 'text', name: 'fleet', value: formData.fleet },
                ].map(field => (
                  <input
                    key={field.name}
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={handleChange}
                    required={field.name !== 'fleet'}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.875rem',
                      padding: '0.75rem 1rem',
                      outline: 'none',
                      width: '100%',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                  />
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '0.875rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: '0.02em',
                    transition: 'opacity 0.2s',
                    marginTop: '0.25rem',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  {loading ? 'Submitting...' : 'Request a Demo'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .company-hero-grid    { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .company-contact-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </div>
  );
}
