import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Calculator,
  Compass,
  FileCheck2,
  Users2,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Idea Analysis',
      desc: 'Evaluates your concept across 6 core business dimensions including problem clarity, market size, and execution feasibility.'
    },
    {
      icon: Users2,
      title: 'Market & Competitor Insights',
      desc: 'Identifies existing incumbents, challengers, and status-quo workarounds with actionable differentiation strategies.'
    },
    {
      icon: Calculator,
      title: 'Financial Feasibility',
      desc: 'Deterministic calculations of unit economics, contribution margins, break-even unit volumes, and operating profits.'
    },
    {
      icon: TrendingUp,
      title: 'SWOT Analysis',
      desc: 'Structured breakdown of internal strengths and weaknesses balanced with external opportunities and market threats.'
    },
    {
      icon: ShieldAlert,
      title: 'Risk Identification',
      desc: 'Categorizes critical financial, market, and execution risks with proactive, practical mitigation measures.'
    },
    {
      icon: Compass,
      title: 'Actionable Startup Roadmap',
      desc: 'Converts high-level recommendations into concrete phased tasks from problem discovery to closed-beta launch.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Describe Your Concept',
      desc: 'Provide your startup title, target industry, customer problem, proposed solution, and target audience.'
    },
    {
      number: '02',
      title: 'Structured AI Evaluation',
      desc: 'Google Gemini analyzes business viability, competitive positioning, and produces an objective Startup Readiness Score.'
    },
    {
      number: '03',
      title: 'Execute with Clarity',
      desc: 'Review strategic recommendations, simulate financial models, track roadmap tasks, and export PDF investor reports.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-main)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Sparkles size={16} /> Intelligent Startup Feasibility Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: 'var(--color-text-primary)',
          maxWidth: '850px',
          marginBottom: '20px',
          letterSpacing: '-0.02em'
        }}>
          Turn Your Startup Idea Into a <span style={{ color: 'var(--color-primary)' }}>Smarter Business Plan</span>
        </h1>

        <p style={{
          fontSize: '17px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          maxWidth: '720px',
          marginBottom: '36px'
        }}>
          Evaluate your business idea with AI-powered insights into market potential, competition, risks, financial feasibility, and actionable next steps.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/analyze" className="btn btn-primary" style={{ padding: '0 28px', fontSize: '15px' }}>
            Analyze Your Idea <ArrowRight size={18} />
          </Link>
          <a href="#features" className="btn btn-secondary" style={{ padding: '0 24px', fontSize: '15px' }}>
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            Enterprise-Grade Startup Evaluation
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Everything founders and investors need to validate market viability before building.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-input)',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
              From initial concept to validated execution in three streamlined steps.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {steps.map((step, idx) => (
              <div key={idx} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: 'var(--color-border)',
                  lineHeight: 1,
                  display: 'block',
                  marginBottom: '16px'
                }}>
                  {step.number}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div className="card" style={{
          background: 'var(--color-primary-light)',
          borderColor: '#C7D2FE',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)' }}>
            Ready to Test Your Next Venture?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '580px' }}>
            Get instant structured evaluation, risk mitigation strategies, and investor-ready PDF summaries today.
          </p>
          <Link to="/analyze" className="btn btn-primary" style={{ padding: '0 28px', marginTop: '8px' }}>
            Analyze Startup Idea <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
