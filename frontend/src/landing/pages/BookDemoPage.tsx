import React, { useState } from 'react';

export default function BookDemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    fleet: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('/api/v1/management/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formData.name,
          email: formData.email,
          phone: formData.phone || 'N/A',
          company: formData.company,
          fleetSize: formData.fleet,
          subject: `Demo Request - ${formData.company || formData.name}`,
          messageBody: `Demo Request for ${formData.fleet ? formData.fleet + ' vehicles' : 'fleet'}. Phone: ${formData.phone || 'N/A'}, Company: ${formData.company || 'N/A'}`,
          status: 'Unread'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit demo request:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Icon */}
        <div style={{ width: 48, height: 48, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="0" stroke="#0C0D10" strokeWidth="1.5"/>
            <path d="M3 9H21" stroke="#0C0D10" strokeWidth="1.5"/>
            <path d="M8 2V6M16 2V6" stroke="#0C0D10" strokeWidth="1.5" strokeLinecap="square"/>
            <path d="M8 13L11 16L16 11" stroke="#0C0D10" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </div>

        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '0.875rem' }}>
          Schedule a Demo
        </span>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1, textTransform: 'uppercase', marginBottom: '1rem' }}>
          Let's talk operations.
        </h1>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.95rem', color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Fill in the form below and our team will reach out within one business day to schedule a walkthrough tailored to your fleet and operation.
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
              { placeholder: 'Full name',     type: 'text',  name: 'name', value: formData.name, required: true },
              { placeholder: 'Company name',  type: 'text',  name: 'company', value: formData.company, required: true },
              { placeholder: 'Email address', type: 'email', name: 'email', value: formData.email, required: true },
              { placeholder: 'Phone number',  type: 'tel',   name: 'phone', value: formData.phone, required: true },
              { placeholder: 'Fleet size (approx. no. of vehicles)', type: 'text', name: 'fleet', value: formData.fleet, required: false },
            ].map(field => (
              <input
                key={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={field.value}
                onChange={handleChange}
                required={field.required}
                autoComplete={field.name}
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

            {error && <p style={{ color: '#D94A4A', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 600,
                fontSize: '0.9rem',
                padding: '0.875rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '0.25rem',
                letterSpacing: '0.02em',
                transition: 'opacity 0.2s',
                width: '100%',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '1.25rem', lineHeight: 1.5 }}>
          By submitting this form you agree to be contacted by our sales team. We don't share your information with third parties.
        </p>
      </div>
    </div>
  );
}

