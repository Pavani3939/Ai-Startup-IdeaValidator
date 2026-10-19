import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  TrendingUp,
  ShieldAlert,
  FileText,
  Plus,
  Eye,
  Download,
  Trash2,
  Calendar,
  Tag
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalIdeas: 0,
    avgReadinessScore: 0,
    highRiskCount: 0,
    reportsGenerated: 0
  });
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, ideasPage] = await Promise.all([
        api.get('/dashboard').catch(() => ({ totalIdeas: 0, avgReadinessScore: 0, highRiskCount: 0, reportsGenerated: 0 })),
        api.get('/ideas?page=0&size=5').catch(() => ({ content: [] }))
      ]);

      setMetrics(metricsData);
      setIdeas(ideasPage.content || []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (reportId, ideaTitle) => {
    try {
      setToast({ type: 'info', message: 'Generating PDF report...' });
      await api.downloadPdf(reportId, `${ideaTitle || 'startup'}-analysis.pdf`);
      setToast({ type: 'success', message: 'PDF downloaded successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to download report PDF.' });
    }
  };

  const handleDelete = async (ideaId) => {
    if (!window.confirm('Are you sure you want to delete this idea and all associated reports?')) {
      return;
    }
    try {
      await api.del(`/ideas/${ideaId}`);
      setToast({ type: 'success', message: 'Idea removed from portfolio.' });
      loadDashboardData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete idea.' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading dashboard metrics..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="kpi-label">Total Ideas Analyzed</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-badge)', background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Lightbulb size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.totalIdeas}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Portfolio concepts</div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="kpi-label">Avg Readiness Score</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-badge)', background: '#F0FDF4', color: 'var(--color-success)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {metrics.avgReadinessScore > 0 ? `${metrics.avgReadinessScore}/100` : '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Aggregate readiness</div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="kpi-label">High-Priority Risks</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-badge)', background: '#FFFBEB', color: 'var(--color-warning)' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.highRiskCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Requiring mitigation</div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="kpi-label">Reports Generated</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-badge)', background: '#EFF6FF', color: 'var(--color-info)' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.reportsGenerated}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Evaluation summaries</div>
        </div>
      </div>

      {/* Recent Ideas Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Recent Startup Evaluations
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Your latest submitted business concepts and their assessment scores.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/ideas" className="btn btn-secondary btn-sm">
              View All Ideas
            </Link>
            <Link to="/analyze" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={15} /> New Idea
            </Link>
          </div>
        </div>

        {ideas.length === 0 ? (
          <div style={{ padding: '24px' }}>
            <EmptyState
              title="No ideas evaluated yet"
              description="Submit your first concept to see structured AI analysis, SWOT matrix, and financial projections."
              actionText="Analyze First Idea"
              actionLink="/analyze"
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Startup Name</th>
                  <th>Industry</th>
                  <th>Readiness Score</th>
                  <th>Evaluation Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((item) => {
                  const score = item.readinessScore || (item.successScore ? item.successScore * 10 : 70);
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent';

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.summary}
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">
                          <Tag size={12} style={{ marginRight: '4px' }} />
                          {item.industry}
                        </Badge>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color: score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-primary)' : 'var(--color-warning)'
                        }}>
                          {score}/100
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {dateStr}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link
                            to={`/analysis/${item.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Analysis"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => handleDownloadPdf(item.id, item.title)}
                            className="btn btn-secondary btn-sm"
                            title="Download PDF Report"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
