import React from 'react';
import Badge from '../common/Badge';

export default function RiskTable({ risks = [] }) {
  if (!risks || risks.length === 0) {
    return (
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        No critical risks identified.
      </p>
    );
  }

  const getSeverityBadgeVariant = (severity = '') => {
    const s = severity.toLowerCase();
    if (s.includes('critical') || s.includes('high')) return 'danger';
    if (s.includes('medium')) return 'warning';
    return 'neutral';
  };

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Severity</th>
            <th style={{ width: '15%' }}>Category</th>
            <th style={{ width: '35%' }}>Risk Description & Impact</th>
            <th style={{ width: '35%' }}>Suggested Mitigation</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk, index) => (
            <tr key={index}>
              <td>
                <Badge variant={getSeverityBadgeVariant(risk.severity)}>
                  {risk.severity || 'Medium'}
                </Badge>
              </td>
              <td style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {risk.category || 'General'}
              </td>
              <td>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{risk.description}</div>
                {risk.impact && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <strong>Impact:</strong> {risk.impact}
                  </div>
                )}
              </td>
              <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                {risk.mitigation || 'Implement proactive user feedback tracking.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
