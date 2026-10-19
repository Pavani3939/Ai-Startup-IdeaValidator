import React from 'react';

export default function DimensionCard({ dimension, score, explanation, strengths, gaps, recommendation }) {
  const numericScore = typeof score === 'number' ? score : parseInt(score) || 70;

  let progressColor = 'var(--color-primary)';
  if (numericScore >= 80) progressColor = 'var(--color-success)';
  else if (numericScore < 50) progressColor = 'var(--color-warning)';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {dimension}
        </h4>
        <span style={{ fontSize: '14px', fontWeight: 700, color: progressColor }}>
          {numericScore}/100
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'var(--color-bg-secondary)',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(100, Math.max(0, numericScore))}%`,
          height: '100%',
          background: progressColor,
          borderRadius: '3px',
          transition: 'width 0.6s ease'
        }} />
      </div>

      {explanation && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
          {explanation}
        </p>
      )}

      <div style={{
        background: 'var(--color-bg-secondary)',
        padding: '10px 12px',
        borderRadius: 'var(--radius-input)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '12px'
      }}>
        {strengths && (
          <div>
            <strong style={{ color: 'var(--color-success)' }}>Strength: </strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>{strengths}</span>
          </div>
        )}
        {gaps && (
          <div>
            <strong style={{ color: 'var(--color-warning)' }}>Gap: </strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>{gaps}</span>
          </div>
        )}
        {recommendation && (
          <div>
            <strong style={{ color: 'var(--color-primary)' }}>Action: </strong>
            <span style={{ color: 'var(--color-text-primary)' }}>{recommendation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
