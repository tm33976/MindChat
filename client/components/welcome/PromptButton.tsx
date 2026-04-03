'use client';

interface Props {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  accentColor: string;
  onSelect: (prompt: string) => void;
}

export default function PromptButton({ icon, label, prompt, accentColor, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(prompt)}
      className="group relative flex items-start gap-3 w-full text-left rounded-xl p-3.5 transition-all duration-200"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = accentColor + '50';
        el.style.background = accentColor + '0a';
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = `0 4px 20px ${accentColor}15`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--surface-2)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
    >
      {/* Icon container */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
        style={{
          width: 32, height: 32,
          background: accentColor + '15',
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          transition: 'all 0.2s',
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium leading-snug"
          style={{ color: 'var(--text-1)' }}
        >
          {label}
        </div>
        <div
          className="text-xs mt-0.5 leading-relaxed truncate"
          style={{ color: 'var(--text-3)' }}
        >
          {prompt}
        </div>
      </div>

      {/* Arrow */}
      <div
        className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{ color: accentColor, transform: 'translateX(-4px)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)'; }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </div>
    </button>
  );
}