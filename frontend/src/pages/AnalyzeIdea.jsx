import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Toast from '../components/common/Toast';

export default function AnalyzeIdea() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showOptional, setShowOptional] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    industry: 'SaaS',
    description: '',
    targetAudience: '',
    problemStatement: '',
    proposedSolution: '',
    businessModel: 'Subscription (B2B SaaS)',
    targetGeography: 'North America / Global',
    // Optional
    estimatedBudget: '',
    expectedMonthlyExpenses: '',
    expectedMonthlyRevenue: '',
    currentStage: 'Idea Phase',
    knownCompetitors: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});

  const industries = [
    'SaaS',
    'FinTech',
    'HealthTech',
    'E-commerce & Retail',
    'EdTech',
    'AI & Machine Learning',
    'CleanTech & Energy',
    'Consumer Tech & Apps',
    'Logistics & Supply Chain',
    'B2B Services',
    'Other'
  ];

  const businessModels = [
    'Subscription (B2B SaaS)',
    'Freemium (B2C / Product-Led)',
    'Marketplace / Commission',
    'Transaction / Payment Fee',
    'Direct Sales / Enterprise Licensing',
    'Usage-Based / Pay As You Go',
    'Hardware + Software Hybrid',
    'Advertising / Data Monetization'
  ];

  const stages = [
    'Idea / Concept Phase',
    'Customer Discovery / Problem Validation',
    'MVP In Development',
    'Alpha / Beta Testing with Early Users',
    'Live in Market / Generating Early Revenue'
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Startup name is required.';
    if (!form.industry) errs.industry = 'Industry category is required.';
    if (!form.description.trim() || form.description.trim().length < 25) {
      errs.description = 'Please provide at least 25 characters describing your concept.';
    }
    if (!form.targetAudience.trim()) errs.targetAudience = 'Target audience is required.';
    if (!form.problemStatement.trim()) errs.problemStatement = 'Problem being solved is required.';
    if (!form.proposedSolution.trim()) errs.proposedSolution = 'Proposed solution is required.';
    if (!form.businessModel) errs.businessModel = 'Business model is required.';
    if (!form.targetGeography.trim()) errs.targetGeography = 'Target geography is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    const hasData = form.title || form.description;
    if (hasData && !window.confirm('Are you sure you want to clear all entered details?')) {
      return;
    }
    setForm({
      title: '',
      industry: 'SaaS',
      description: '',
      targetAudience: '',
      problemStatement: '',
      proposedSolution: '',
      businessModel: 'Subscription (B2B SaaS)',
      targetGeography: 'North America / Global',
      estimatedBudget: '',
      expectedMonthlyExpenses: '',
      expectedMonthlyRevenue: '',
      currentStage: 'Idea Phase',
      knownCompetitors: '',
      additionalNotes: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ type: 'warning', message: 'Please complete all required fields.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        estimatedBudget: form.estimatedBudget ? parseFloat(form.estimatedBudget) : null,
        expectedMonthlyExpenses: form.expectedMonthlyExpenses ? parseFloat(form.expectedMonthlyExpenses) : null,
        expectedMonthlyRevenue: form.expectedMonthlyRevenue ? parseFloat(form.expectedMonthlyRevenue) : null,
      };

      const result = await api.post('/ideas/analyze', payload);
      navigate(`/analysis/${result.id || result.ideaId}`);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Analysis request failed. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '32px',
        alignItems: 'start'
      }} className="analyze-grid">

        {/* Left Column: Form (60%) */}
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Analyze Your Startup Idea
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Provide a few details about your business concept to generate a structured evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 1. Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                1. Startup / Concept Name <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="e.g. EcoRide / FleetFlow AI"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={loading}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* 2. Industry */}
            <div className="form-group">
              <label className="form-label" htmlFor="industry">
                2. Industry or Business Category <span className="required">*</span>
              </label>
              <select
                id="industry"
                className="form-select"
                value={form.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                disabled={loading}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              {errors.industry && <span className="form-error">{errors.industry}</span>}
            </div>

            {/* 3. Description */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="description">
                  3. Startup Description <span className="required">*</span>
                </label>
                <span style={{ fontSize: '12px', color: form.description.length > 1800 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                  {form.description.length}/2000
                </span>
              </div>
              <textarea
                id="description"
                className="form-textarea"
                rows={4}
                maxLength={2000}
                placeholder="Describe your core offering, key features, and what makes this compelling to end users..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* 4. Target Audience */}
            <div className="form-group">
              <label className="form-label" htmlFor="targetAudience">
                4. Target Audience & Customer Persona <span className="required">*</span>
              </label>
              <input
                id="targetAudience"
                type="text"
                className="form-input"
                placeholder="e.g. Independent coffee shop owners with 1-5 locations"
                value={form.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                disabled={loading}
              />
              {errors.targetAudience && <span className="form-error">{errors.targetAudience}</span>}
            </div>

            {/* 5. Problem Being Solved */}
            <div className="form-group">
              <label className="form-label" htmlFor="problemStatement">
                5. Problem Being Solved <span className="required">*</span>
              </label>
              <textarea
                id="problemStatement"
                className="form-textarea"
                rows={3}
                placeholder="What recurring pain, cost, or frustration does your customer face today?"
                value={form.problemStatement}
                onChange={(e) => handleChange('problemStatement', e.target.value)}
                disabled={loading}
              />
              {errors.problemStatement && <span className="form-error">{errors.problemStatement}</span>}
            </div>

            {/* 6. Proposed Solution */}
            <div className="form-group">
              <label className="form-label" htmlFor="proposedSolution">
                6. Proposed Solution & Value Proposition <span className="required">*</span>
              </label>
              <textarea
                id="proposedSolution"
                className="form-textarea"
                rows={3}
                placeholder="How does your product solve this problem faster, cheaper, or 10x better?"
                value={form.proposedSolution}
                onChange={(e) => handleChange('proposedSolution', e.target.value)}
                disabled={loading}
              />
              {errors.proposedSolution && <span className="form-error">{errors.proposedSolution}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-col">
              {/* 7. Business Model */}
              <div className="form-group">
                <label className="form-label" htmlFor="businessModel">
                  7. Business Model <span className="required">*</span>
                </label>
                <select
                  id="businessModel"
                  className="form-select"
                  value={form.businessModel}
                  onChange={(e) => handleChange('businessModel', e.target.value)}
                  disabled={loading}
                >
                  {businessModels.map(bm => (
                    <option key={bm} value={bm}>{bm}</option>
                  ))}
                </select>
                {errors.businessModel && <span className="form-error">{errors.businessModel}</span>}
              </div>

              {/* 8. Target Geography */}
              <div className="form-group">
                <label className="form-label" htmlFor="targetGeography">
                  8. Target Geography <span className="required">*</span>
                </label>
                <input
                  id="targetGeography"
                  type="text"
                  className="form-input"
                  placeholder="e.g. United States, Western Europe, Global"
                  value={form.targetGeography}
                  onChange={(e) => handleChange('targetGeography', e.target.value)}
                  disabled={loading}
                />
                {errors.targetGeography && <span className="form-error">{errors.targetGeography}</span>}
              </div>
            </div>

            {/* Collapsible Optional Fields */}
            <div style={{
              margin: '16px 0 24px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '16px'
            }}>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showOptional ? 'Hide Optional Financial & Context Details' : 'Add Optional Budget, Stage & Competitor Context'}
              </button>

              {showOptional && (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="grid-3-col">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="estimatedBudget">Initial Budget ($)</label>
                      <input
                        id="estimatedBudget"
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="10000"
                        value={form.estimatedBudget}
                        onChange={(e) => handleChange('estimatedBudget', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="expectedMonthlyExpenses">Monthly Burn ($)</label>
                      <input
                        id="expectedMonthlyExpenses"
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="2500"
                        value={form.expectedMonthlyExpenses}
                        onChange={(e) => handleChange('expectedMonthlyExpenses', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="expectedMonthlyRevenue">Expected Mo. Rev ($)</label>
                      <input
                        id="expectedMonthlyRevenue"
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="5000"
                        value={form.expectedMonthlyRevenue}
                        onChange={(e) => handleChange('expectedMonthlyRevenue', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="currentStage">Current Business Stage</label>
                    <select
                      id="currentStage"
                      className="form-select"
                      value={form.currentStage}
                      onChange={(e) => handleChange('currentStage', e.target.value)}
                    >
                      {stages.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="knownCompetitors">Known Competitors (Optional)</label>
                    <input
                      id="knownCompetitors"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Linear, Jira, Asana"
                      value={form.knownCompetitors}
                      onChange={(e) => handleChange('knownCompetitors', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw size={16} /> Clear Form
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '180px' }}
              >
                {loading ? (
                  <>
                    <Brain size={18} style={{ animation: 'pulse 1.2s infinite' }} /> Evaluating Idea...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Analyze My Idea
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Information Card (40%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
              What This Analysis Evaluates
            </h3>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Problem & Solution Fit</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Checks whether the pain point is acute and if your proposed value proposition delivers a clear 10x advantage.
                  </p>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Market & Customer Understanding</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Assesses audience sizing, industry growth dynamics, and willingness-to-pay signals in your sector.
                  </p>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Competitive Positioning</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Identifies incumbent resistance, status-quo alternatives, and defensible moats.
                  </p>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Strategic Risk Matrix</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Highlights critical execution, regulatory, and market adoption pitfalls with mitigation tactics.
                  </p>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Startup Readiness Score (1-100)</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Transparent qualitative assessment score across all 6 core business dimensions.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {loading && (
            <div className="card" style={{
              background: 'var(--color-primary-light)',
              borderColor: '#C7D2FE',
              textAlign: 'center',
              padding: '28px'
            }}>
              <Brain size={36} style={{ color: 'var(--color-primary)', animation: 'pulse 1.2s infinite', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)' }}>
                Gemini AI is analyzing your venture...
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Running SWOT heuristics, competitive positioning checks, and calculating your indicative Readiness Score.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @media (max-width: 960px) {
          .analyze-grid {
            grid-template-columns: 1fr !important;
          }
          .grid-2-col, .grid-3-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
