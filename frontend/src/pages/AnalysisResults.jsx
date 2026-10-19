import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  PlusCircle,
  Crosshair,
  Calculator,
  Compass,
  Calendar,
  Tag,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreCircle from '../components/common/ScoreCircle';
import SwotCard from '../components/analysis/SwotCard';
import DimensionCard from '../components/analysis/DimensionCard';
import RiskTable from '../components/analysis/RiskTable';
import RecommendationCard from '../components/analysis/RecommendationCard';
import Toast from '../components/common/Toast';

export default function AnalysisResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAnalysisData();
  }, [id]);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      // First try to fetch idea detail or report
      let result = null;
      try {
        const detail = await api.get(`/ideas/${id}`);
        if (detail && detail.analysisReport) {
          result = {
            ...detail.analysisReport,
            startupName: detail.title,
            industry: detail.industry,
            description: detail.description,
            ideaId: detail.id
          };
        }
      } catch (e) {
        // Fallback to reports endpoint
        result = await api.get(`/reports/${id}`);
      }

      if (!result) {
        throw new Error('Analysis report not found.');
      }
      setData(result);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load analysis report.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      setToast({ type: 'info', message: 'Generating investor-ready PDF...' });
      await api.downloadPdf(data.id || id, `${data.startupName || 'startup'}-analysis.pdf`);
      setToast({ type: 'success', message: 'Report downloaded successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to download report PDF.' });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Retrieving structured analysis report..." />
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <AlertTriangle size={36} style={{ color: 'var(--color-warning)', margin: '0 auto 12px' }} />
          <h3>Analysis Report Not Available</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 20px' }}>
            We could not locate this analysis report. It may have been deleted.
          </p>
          <Link to="/analyze" className="btn btn-primary btn-sm">
            Analyze Another Idea
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const readinessScore = data.readinessScore || (data.successScore ? data.successScore * 10 : 70);
  const ideaId = data.ideaId || id;

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> {data.analysisDate || 'Current'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={14} /> {data.industry || 'Technology'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadPdf}
            className="btn btn-primary btn-sm"
            disabled={downloading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} /> {downloading ? 'Downloading...' : 'Download PDF Report'}
          </button>
          <Link to={`/ideas/${ideaId}/competitors`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Crosshair size={15} /> Competitor Intel
          </Link>
          <Link to={`/ideas/${ideaId}/financial`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Calculator size={15} /> Financial Feasibility
          </Link>
          <Link to={`/ideas/${ideaId}/roadmap`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={15} /> Startup Roadmap
          </Link>
        </div>
      </div>

      {/* A. Overview Card & Score */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '32px',
          alignItems: 'center'
        }} className="overview-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 'var(--radius-badge)', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
              <Lightbulb size={14} /> Startup Assessment
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {data.startupName || 'Startup Concept'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px', maxWidth: '780px' }}>
              {data.executiveSummary || data.summary}
            </p>

            <div style={{
              background: 'var(--color-bg-secondary)',
              borderLeft: '4px solid var(--color-primary)',
              padding: '10px 14px',
              borderRadius: '0 var(--radius-input) var(--radius-input) 0',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5
            }}>
              <strong>Score Methodology & Transparency: </strong>
              {data.scoreExplanation || "This indicative Startup Readiness Score is based on structured qualitative evaluation across 6 key feasibility dimensions. It is not a statistically validated probability of financial return."}
            </div>
          </div>

          <div style={{
            background: 'var(--color-bg-secondary)',
            padding: '24px 32px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Startup Readiness Score
            </div>
            <ScoreCircle score={readinessScore} size={150} />
          </div>
        </div>
      </div>

      {/* B. Core Evaluation Dimensions */}
      {data.evaluationDimensions && data.evaluationDimensions.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Evaluation Dimensions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {data.evaluationDimensions.map((dim, idx) => (
              <DimensionCard
                key={idx}
                dimension={dim.dimension}
                score={dim.score}
                explanation={dim.explanation}
                strengths={dim.strengths}
                gaps={dim.gaps}
                recommendation={dim.recommendation}
              />
            ))}
          </div>
        </div>
      )}

      {/* C. SWOT Matrix */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
          SWOT Analysis
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <SwotCard type="strengths" items={data.strengths || data.advantages} />
          <SwotCard type="weaknesses" items={data.weaknesses || data.disadvantages} />
          <SwotCard type="opportunities" items={data.opportunities} />
          <SwotCard type="threats" items={data.threats} />
        </div>
      </div>

      {/* D. Strategic Risks & Mitigations */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
          Key Strategic Risks & Mitigations
        </h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <RiskTable risks={data.risks} />
        </div>
      </div>

      {/* E. Actionable Next Steps / Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Actionable Next Steps
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.recommendations.map((rec, idx) => (
              <RecommendationCard
                key={idx}
                title={rec.title}
                description={rec.description}
                priority={rec.priority}
                nextAction={rec.nextAction}
                expectedBenefit={rec.expectedBenefit}
                timeframe={rec.timeframe}
              />
            ))}
          </div>
        </div>
      )}

      {/* F. Next Steps Banner */}
      <div className="card" style={{
        background: 'var(--color-bg-secondary)',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Ready to explore detailed financials or execution?
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Model your unit economics, inspect the competitive landscape, or track your launch roadmap.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/ideas/${ideaId}/financial`} className="btn btn-primary btn-sm">
            Financial Feasibility <ArrowRight size={14} />
          </Link>
          <Link to="/analyze" className="btn btn-secondary btn-sm">
            <PlusCircle size={14} /> New Idea
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .overview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
