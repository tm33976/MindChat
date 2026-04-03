'use client';

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

export default function FeatureHighlight({ icon, title, description, color, delay }: Props) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        animation: `featureFadeIn 0.4s ease-out ${delay}ms both`,
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 34, height: 34,
          background: color + '12',
          border: `1px solid ${color}25`,
          color: color,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-1)' }}>
          {title}
        </div>
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
          {description}
        </div>
      </div>
    </div>
  );
}