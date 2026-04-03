export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'fadeUp 0.2s ease-out' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,204,0.1))',
        border: '1px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 16px rgba(0,212,255,0.12)',
      }}>
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
          <path d="M8 20 Q8 12 16 12 Q24 12 24 20" stroke="url(#tg2)" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="16" cy="10" r="2.5" fill="url(#tg2)"/>
          <defs>
            <linearGradient id="tg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#0066cc"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div style={{
        padding: '14px 18px',
        borderRadius: '6px 20px 20px 20px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'inline-block',
            animation: 'pulseDot 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
            boxShadow: '0 0 6px rgba(0,212,255,0.5)',
          }}/>
        ))}
      </div>
    </div>
  );
}