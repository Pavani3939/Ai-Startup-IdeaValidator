import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No records found',
  description = 'You have not analyzed any startup ideas yet.',
  actionText = 'Analyze an Idea',
  actionLink = '/analyze'
}) {
  return (
    <div className="card" style={{
      textAlign: 'center',
      padding: '56px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        <FolderOpen size={28} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '420px', marginBottom: '8px' }}>
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}
    </div>
  );
}
