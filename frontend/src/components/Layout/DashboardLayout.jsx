import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/analyze') return 'Analyze New Startup Idea';
    if (path.startsWith('/analysis/')) return 'Evaluation Report';
    if (path === '/ideas') return 'My Startup Portfolio';
    if (path === '/competitors' || path.includes('/competitors')) return 'Competitor Intelligence';
    if (path === '/financial' || path.includes('/financial')) return 'Financial Feasibility';
    if (path === '/roadmap' || path.includes('/roadmap')) return 'Actionable Startup Roadmap';
    return 'Startup Analytics';
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                display: 'none'
              }}
              className="mobile-menu-btn"
            >
              <Menu size={22} />
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {getPageTitle()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/analyze" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Analyze Idea
            </Link>
          </div>
        </header>

        <main className="page-container">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
