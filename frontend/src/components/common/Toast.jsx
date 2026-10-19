import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function Toast({ type = 'info', message, onClose }) {
  if (!message) return null;

  const config = {
    success: { icon: CheckCircle2, bg: '#F0FDF4', border: '#BBF7D0', color: '#16A34A' },
    warning: { icon: AlertTriangle, bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
    error: { icon: AlertCircle, bg: '#FEF2F2', border: '#FECACA', color: '#DC2626' },
    info: { icon: AlertCircle, bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB' }
  }[type] || { icon: AlertCircle, bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB' };

  const IconComponent = config.icon;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 100,
      background: config.bg,
      border: `1px solid ${config.border}`,
      color: config.color,
      borderRadius: 'var(--radius-input)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: 'var(--shadow-md)',
      maxWidth: '420px',
      animation: 'slideIn 0.25s ease'
    }}>
      <IconComponent size={20} />
      <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, color: 'var(--color-text-primary)' }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
