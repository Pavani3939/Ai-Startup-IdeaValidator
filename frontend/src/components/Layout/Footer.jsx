import React from 'react';
import { Sparkles, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg-card)',
      borderTop: '1px solid var(--color-border)',
      padding: '48px 32px 32px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '32px',
        marginBottom: '36px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)', marginBottom: '12px' }}>
            <Sparkles size={20} />
            <span style={{ color: 'var(--color-text-primary)' }}>StartupValidator<span style={{ color: 'var(--color-primary)' }}>.ai</span></span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '320px' }}>
            Transform entrepreneurial concepts into structured, evaluated business plans powered by Google Gemini and deterministic financial calculations.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li><Link to="/analyze">Analyze Idea</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/ideas">Portfolio History</Link></li>
            <li><Link to="/financial">Financial Feasibility</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>Open Source</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li>
              <a
                href="https://github.com/Pavani3939/Ai-Startup-IdeaValidator"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Github size={16} /> GitHub Repository
              </a>
            </li>
            <li><a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google Gemini API</a></li>
            <li><span style={{ color: 'var(--color-text-muted)' }}>Java 21 & Spring Boot 3.2</span></li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--color-text-muted)'
      }}>
        <span>© {new Date().getFullYear()} AI Startup Idea Validator. All rights reserved.</span>
        <span>Evaluations are indicative qualitative assessments for founder guidance.</span>
      </div>
    </footer>
  );
}
