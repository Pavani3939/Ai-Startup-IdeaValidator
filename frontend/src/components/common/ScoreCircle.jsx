import React from 'react';

export default function ScoreCircle({ score = 70, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = 'var(--color-primary)';
  let ratingText = 'Viable Readiness';
  if (clampedScore >= 80) {
    color = 'var(--color-success)';
    ratingText = 'High Readiness';
  } else if (clampedScore >= 60) {
    color = 'var(--color-primary)';
    ratingText = 'Promising Potential';
  } else if (clampedScore >= 40) {
    color = 'var(--color-warning)';
    ratingText = 'Needs Refinement';
  } else {
    color = 'var(--color-error)';
    ratingText = 'Significant Gaps';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1
        }}>
          <span style={{ fontSize: '38px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {clampedScore}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '4px' }}>
            / 100
          </span>
        </div>
      </div>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: color,
        background: 'var(--color-bg-secondary)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-badge)'
      }}>
        {ratingText}
      </span>
    </div>
  );
}
