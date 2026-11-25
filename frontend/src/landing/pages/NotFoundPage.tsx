import { NavLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Grid bg */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="g404" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1E2025" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g404)" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '1.5rem' }}>404 · Page Not Found</span>

        <h1 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(5rem, 18vw, 14rem)',
          lineHeight: 0.9,
          textTransform: 'uppercase',
          color: 'var(--border)',
          letterSpacing: '-0.02em',
          margin: '0 0 2rem',
          userSelect: 'none',
        }}>
          404
        </h1>

        <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.05rem', color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 380, margin: '0 auto 2.5rem' }}>
          This route doesn't exist in the system. Let's get you back to the operations dashboard.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <NavLink
            to="/landing"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', padding: '0.75rem 1.5rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Go Home
          </NavLink>
          <NavLink
            to="/product"
            style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', color: 'var(--muted-foreground)', textDecoration: 'none', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--muted-foreground)'; el.style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted-foreground)'; }}
          >
            View Platform
          </NavLink>
        </div>
      </div>
    </div>
  );
}
