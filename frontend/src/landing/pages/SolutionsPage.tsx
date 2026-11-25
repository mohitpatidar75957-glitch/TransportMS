import { Label } from '../components/shared';

const solutions = [
  {
    role: 'Business Owner',
    headline: 'Run your business on one number.',
    desc: 'Revenue, costs, fleet utilization, receivables, and per-trip profitability — visible in a single dashboard. No more pulling reports from three different places to understand if the business is making money.',
    features: ['Business P&L by period and route', 'Fleet ROI and utilization tracking', 'Receivables aging and cash flow view', 'Vendor cost and margin analysis', 'One-click management reports'],
    color: '#E8830C',
  },
  {
    role: 'Operations Manager',
    headline: 'Dispatch faster, resolve exceptions before they escalate.',
    desc: 'Plan loads, assign vehicles and drivers, dispatch trips, and monitor active operations — all without switching between tools or WhatsApp messages. Exceptions appear automatically so you can act before the customer calls.',
    features: ['Load planning and vehicle assignment', 'Driver availability and compliance check', 'Live dispatch board with trip status', 'Exception queue with direct actions', 'Automated driver and customer notifications'],
    color: '#4A7FC1',
  },
  {
    role: 'Accountant',
    headline: 'Bill on time, settle accurately, reconcile without spreadsheets.',
    desc: 'Freight invoices generated directly from trip actuals. Vendor settlements calculated with advances, deductions, and fuel charges. Receivables tracked per customer with payment history.',
    features: ['Auto-invoice from trip completion', 'Vendor and driver payment settlement', 'Fuel card and expense reconciliation', 'Per-trip margin and cost visibility', 'Receivables and payables dashboards'],
    color: '#6EBF8B',
  },
  {
    role: 'Driver',
    headline: "The information you need. Nothing you don't.",
    desc: 'Trip instructions, delivery address, special notes, and POD capture — on a simple mobile interface built for people who are driving, not sitting at a desk.',
    features: ["Today's trip details and route", 'In-app navigation integration', 'Delivery confirmation and photo POD', 'Issue reporting and driver comms', 'Earnings and trip history'],
    color: '#C4905A',
  },
  {
    role: 'Vendor & Carrier',
    headline: 'Manage your loads. Track your payments.',
    desc: 'External carriers and fleet owners get a dedicated portal to see assigned loads, upload delivery documents, track freight earnings, and follow payment status — without needing access to the full platform.',
    features: ['Assigned trip and load visibility', 'Rate card and earnings tracking', 'Payment status and history', 'Document upload for POD and invoices', 'Vendor-level performance reports'],
    color: '#8A6DC4',
  },
];

export default function SolutionsPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '5rem 2rem 4rem', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Label>Solutions by Role</Label>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 5rem)', lineHeight: 0.95, textTransform: 'uppercase', margin: '0 0 1.5rem', maxWidth: 800 }}>
            One platform.<br />Six workspaces.
          </h1>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.1rem', color: 'var(--muted-foreground)', maxWidth: 560, lineHeight: 1.7 }}>
            Every role in your transportation business gets a purpose-built experience — with the right information, the right actions, and nothing irrelevant in the way.
          </p>
        </div>
      </section>

      {/* Solution cards */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {solutions.map((s) => (
            <div
              key={s.role}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '3rem',
                padding: '2.5rem',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                alignItems: 'start',
              }}
              className="solutions-card"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{s.role}</span>
                </div>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.9rem', lineHeight: 1.05, textTransform: 'uppercase', marginBottom: '1rem', borderLeft: `3px solid ${s.color}`, paddingLeft: '1rem' }}>
                  {s.headline}
                </h2>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', display: 'block', marginBottom: '1rem' }}>
                  Key Capabilities
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {s.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ width: 4, height: 4, background: s.color, flexShrink: 0, marginTop: '0.5rem' }} />
                      <span style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem', lineHeight: 1.6 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .solutions-card {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
