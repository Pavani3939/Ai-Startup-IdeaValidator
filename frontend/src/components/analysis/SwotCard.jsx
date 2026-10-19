import React from 'react';
import { CheckCircle2, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';

export default function SwotCard({ type, items = [] }) {
  const configs = {
    strengths: {
      title: 'Strengths (Internal)',
      icon: CheckCircle2,
      accent: 'var(--color-success)',
      bg: '#F0FDF4',
      border: '#BBF7D0'
    },
    weaknesses: {
      title: 'Weaknesses (Internal)',
      icon: AlertOctagon,
      accent: 'var(--color-error)',
      bg: '#FEF2F2',
      border: '#FECACA'
    },
    opportunities: {
      title: 'Opportunities (External)',
      icon: TrendingUp,
      accent: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
      border: '#C7D2FE'
    },
    threats: {
      title: 'Threats (External)',
      icon: ShieldAlert,
      accent: 'var(--color-warning)',
      bg: '#FFFBEB',
      border: '#FDE68A'
    }
  };

  const config = configs[type] || configs.strengths;
  const IconComponent = config.icon;

  return (
    <div className="card" style={{
      borderTop: `4px solid ${config.accent}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-badge)',
          background: config.bg,
          color: config.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconComponent size={16} />
        </div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {config.title}
        </h4>
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.45
            }}>
              <span style={{ color: config.accent, fontWeight: 700, fontSize: '14px' }}>•</span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No factors identified.
          </li>
        )}
      </ul>
    </div>
  );
}
