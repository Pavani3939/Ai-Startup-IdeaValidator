import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 28 }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      gap: '16px'
    }}>
      <Loader2
        size={size}
        style={{
          color: 'var(--color-primary)',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {message && (
        <p style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
