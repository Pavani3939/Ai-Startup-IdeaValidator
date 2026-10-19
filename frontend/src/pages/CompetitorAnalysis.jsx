import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Crosshair,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Building2,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';

export default function CompetitorAnalysis() {
  const { id } = useParams();
  const [competitors, setCompetitors] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(id || '');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    if (selectedIdeaId) {
      loadCompetitors(selectedIdeaId);
    }
  }, [selectedIdeaId]);

  const loadIdeas = async () => {
    try {
      const data = await api.get('/ideas?page=0&size=20');
      const list = data.content || [];
      setIdeas(list);
      if (!selectedIdeaId && list.length > 0) {
        setSelectedIdeaId(list[0].id);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load ideas for competitor analysis.' });
    }
  };

  const loadCompetitors = async (ideaId) => {
    setLoading(true);
    try {
      const list = await api.get(`/ideas/${ideaId}/competitors`);
      setCompetitors(list || []);

      // Resolve idea title
      const found = ideas.find(i => String(i.id) === String(ideaId));
      if (found) setIdeaTitle(found.title);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch competitors.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedIdeaId) {
      setToast({ type: 'warning', message: 'Please select an idea first.' });
      return;
    }
    setAnalyzing(true);
    try {
      setToast({ type: 'info', message: 'Analyzing competitive landscape...' });
      const results = await api.post(`/ideas/${selectedIdeaId}/competitors/analyze`, {});
      setCompetitors(results);
      setToast({ type: 'success', message: 'Competitive intelligence updated!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Competitor evaluation failed.' });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Idea Selector & Actions Header */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>
              Select Startup Idea to Analyze
            </label>
            <select
              className="form-select"
              value={selectedIdeaId}
              onChange={(e) => setSelectedIdeaId(e.target.value)}
              disabled={analyzing}
            >
              {ideas.map(i => (
                <option key={i.id} value={i.id}>{i.title} ({i.industry})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <button
              onClick={handleRunAnalysis}
              className="btn btn-primary"
              disabled={analyzing || !selectedIdeaId}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={16} style={{ animation: analyzing ? 'spin 1s linear infinite' : 'none' }} />
              {analyzing ? 'Evaluating Competitors...' : 'Run Competitor Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Transparency Notice Banner */}
      <div style={{
        background: 'var(--color-primary-light)',
        border: '1px solid #C7D2FE',
        borderRadius: 'var(--radius-card)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '28px',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      }}>
        <ShieldCheck size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <span>
          <strong>Source Transparency: </strong>
          Competitor profiles reflect an AI preliminary landscape assessment based on market patterns and submitted features. Results are intended for positioning guidance and independent market verification is recommended.
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading competitor landscape..." />
      ) : competitors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Building2 size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            No Competitor Intelligence Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto 20px' }}>
            Click "Run Competitor Analysis" to generate market incumbent comparisons and differentiation strategies.
          </p>
          <button onClick={handleRunAnalysis} className="btn btn-primary btn-sm" disabled={analyzing}>
            Run Analysis Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {competitors.map((comp) => (
            <div key={comp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {comp.name}
                  </h3>
                  {comp.targetSegment && (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Segment: {comp.targetSegment}
                    </span>
                  )}
                </div>
                {comp.website && (
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-light)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-badge)'
                  }}>
                    {comp.website}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {comp.summary}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: '#F0FDF4', padding: '10px', borderRadius: 'var(--radius-input)', border: '1px solid #BBF7D0' }}>
                  <strong style={{ color: 'var(--color-success)', display: 'block', marginBottom: '4px' }}>Strengths:</strong>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{comp.strengths || 'Established user base'}</span>
                </div>
                <div style={{ background: '#FEF2F2', padding: '10px', borderRadius: 'var(--radius-input)', border: '1px solid #FECACA' }}>
                  <strong style={{ color: 'var(--color-error)', display: 'block', marginBottom: '4px' }}>Limitations:</strong>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{comp.weaknesses || 'Legacy workflows'}</span>
                </div>
              </div>

              {comp.differentiation && (
                <div style={{
                  background: 'var(--color-bg-secondary)',
                  borderLeft: '3px solid var(--color-primary)',
                  padding: '10px 12px',
                  borderRadius: '0 var(--radius-input) var(--radius-input) 0',
                  fontSize: '12px',
                  marginTop: 'auto'
                }}>
                  <strong style={{ color: 'var(--color-primary)' }}>Differentiation Opportunity: </strong>
                  <span style={{ color: 'var(--color-text-primary)' }}>{comp.differentiation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
