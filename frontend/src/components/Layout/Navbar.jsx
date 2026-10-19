import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      height: '72px',
      background: 'var(--color-bg-card)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)' }}>
        <Sparkles size={22} />
        <span style={{ color: 'var(--color-text-primary)' }}>StartupValidator<span style={{ color: 'var(--color-primary)' }}>.ai</span></span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Home</Link>
        <a href="#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Features</a>
        <a href="#how-it-works" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>How It Works</a>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <button onClick={logout} className="btn btn-secondary btn-sm" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
