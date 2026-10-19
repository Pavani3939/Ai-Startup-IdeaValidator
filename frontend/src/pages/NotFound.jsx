import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      background: 'var(--color-bg-main)'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <Compass size={32} />
      </div>

      <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>

      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
}
