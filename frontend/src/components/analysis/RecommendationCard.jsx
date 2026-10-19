import React from 'react';
import Badge from '../common/Badge';
import { ArrowRight, Clock } from 'lucide-react';

export default function RecommendationCard({ title, description, priority = 'Medium', nextAction, expectedBenefit, timeframe }) {
  const getPriorityVariant = (p = '') => {
    const pl = p.toLowerCase();
    if (pl === 'high') return 'danger';
    if (pl === 'medium') return 'warning';
    return 'info';
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {timeframe && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <Clock size={13} /> {timeframe}
            </span>
          )}
          <Badge variant={getPriorityVariant(priority)}>
            {priority} Priority
          </Badge>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
        {description}
      </p>

      {nextAction && (
        <div style={{
          background: 'var(--color-primary-light)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-input)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--color-primary)'
        }}>
          <ArrowRight size={16} />
          <strong>Next Action:</strong> {nextAction}
        </div>
      )}

      {expectedBenefit && (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <strong>Expected Benefit:</strong> {expectedBenefit}
        </div>
      )}
    </div>
  );
}
