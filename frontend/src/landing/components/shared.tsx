/** Shared primitive components used across all pages. */

export const Label = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--primary)',
    display: 'inline-block',
    marginBottom: '1rem',
  }}>
    {children}
  </span>
);

export const PageHero = ({
  label,
  heading,
  subheading,
  center = false,
  children,
}: {
  label: string;
  heading: React.ReactNode;
  subheading?: string;
  center?: boolean;
  children?: React.ReactNode;
}) => (
  <section style={{
    padding: '5rem 2rem 4rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--card)',
    textAlign: center ? 'center' : 'left',
  }}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <Label>{label}</Label>
      <h1 style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 800,
        fontSize: 'clamp(2.5rem, 5vw, 5rem)',
        lineHeight: 0.95,
        textTransform: 'uppercase',
        margin: '0 0 1.5rem',
        maxWidth: center ? 'none' : 800,
      }}>
        {heading}
      </h1>
      {subheading && (
        <p style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: '1.1rem',
          color: 'var(--muted-foreground)',
          maxWidth: center ? 480 : 560,
          margin: center ? '0 auto' : '0',
          lineHeight: 1.7,
        }}>
          {subheading}
        </p>
      )}
      {children}
    </div>
  </section>
);
