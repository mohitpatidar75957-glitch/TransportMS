import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../index.css';

const navItems = [
  { to: '/product',   label: 'Product' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/pricing',   label: 'Pricing' },
  { to: '/company',   label: 'Company' },
];

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Enable dark landing page theme on body
    document.body.classList.add('landing-page-active');
    document.body.style.backgroundColor = '#0C0D10';

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('landing-page-active');
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* ── Fixed header ─────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        background: scrolled ? 'rgba(12,13,16,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 64, justifyContent: 'space-between', gap: '2rem' }}>

            {/* Logo */}
            <NavLink to="/landing" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M1 12L4 6L8 9L12 4" stroke="#0C0D10" strokeWidth="2" strokeLinecap="square"/>
                  <circle cx="12" cy="4" r="1.5" fill="#0C0D10"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--foreground)' }}>
                Freightlane
              </span>
            </NavLink>

            {/* Desktop nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2.25rem', flex: 1, justifyContent: 'center' }} className="nav-desktop">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.01em',
                    color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    paddingBottom: '2px',
                    borderBottom: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }} className="nav-desktop">
              <NavLink
                to="/company"
                style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.875rem', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'}
              >
                Contact
              </NavLink>
              <NavLink
                to="/book-demo"
                style={({ isActive }) => ({
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  padding: '0.5rem 1.125rem',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  display: 'inline-block',
                  opacity: isActive ? 0.85 : 1,
                  transition: 'opacity 0.2s',
                })}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.82'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                Book a Demo
              </NavLink>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="nav-mobile-btn"
              style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', padding: '0.375rem', display: 'none' }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {menuOpen
                  ? <path d="M4 4L18 18M4 18L18 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                  : <path d="M2 7H20M2 15H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '1.25rem 2rem 1.75rem' }}>
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '0.75rem 0',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  color: isActive ? 'var(--primary)' : 'var(--foreground)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border)',
                })}
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/book-demo"
              style={{ display: 'block', marginTop: '1.25rem', background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '0.9rem', padding: '0.75rem 1.25rem', textDecoration: 'none', textAlign: 'center' }}
            >
              Book a Demo
            </NavLink>
          </div>
        )}
      </header>

      {/* ── Page content ─────────────────────────────────── */}
      <main style={{ flex: 1, paddingTop: 64 }}>
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <NavLink to="/landing" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}>
                <div style={{ width: 22, height: 22, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M1 12L4 6L8 9L12 4" stroke="#0C0D10" strokeWidth="2" strokeLinecap="square"/>
                    <circle cx="12" cy="4" r="1.5" fill="#0C0D10"/>
                  </svg>
                </div>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--foreground)' }}>Freightlane</span>
              </NavLink>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.65, maxWidth: 240 }}>
                One connected system for planning, executing, and financially closing transportation operations.
              </p>
            </div>

            {[
              {
                title: 'Platform',
                links: [
                  { label: 'Product Overview',  to: '/product' },
                  { label: 'Fleet Management',  to: '/product' },
                  { label: 'Trip Operations',   to: '/product' },
                  { label: 'Finance & Billing', to: '/product' },
                  { label: 'Analytics',         to: '/product' },
                ],
              },
              {
                title: 'Solutions',
                links: [
                  { label: 'For Business Owners',      to: '/solutions' },
                  { label: 'For Operations Managers',  to: '/solutions' },
                  { label: 'For Accountants',          to: '/solutions' },
                  { label: 'For Drivers',              to: '/solutions' },
                  { label: 'For Vendors',              to: '/solutions' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About',          to: '/company' },
                  { label: 'Pricing',        to: '/pricing' },
                  { label: 'Contact',        to: '/company' },
                  { label: 'Book a Demo',    to: '/book-demo' },
                  { label: 'Privacy Policy', to: '/' },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '0.875rem' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {col.links.map(({ label, to }) => (
                    <li key={label}>
                      <NavLink
                        to={to}
                        style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'}
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
              © 2026 Freightlane Technologies. All rights reserved.
            </p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
              Built for the modern logistics enterprise.
            </p>
          </div>
        </div>
      </footer>

      {/* Responsive nav styles */}
      <style>{`
        @media (max-width: 900px) {
          .nav-desktop     { display: none !important; }
          .nav-mobile-btn  { display: flex !important; }
        }
        @media (min-width: 901px) {
          .nav-mobile-btn  { display: none !important; }
        }
      `}</style>
    </div>
  );
}
