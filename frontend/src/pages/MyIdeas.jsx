import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Calendar,
  Tag,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

export default function MyIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadIdeas(page);
  }, [page]);

  const loadIdeas = async (pageNumber) => {
    setLoading(true);
    try {
      const data = await api.get(`/ideas?page=${pageNumber}&size=9&sortBy=createdAt`);
      setIdeas(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load startup ideas.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id, title) => {
    try {
      setToast({ type: 'info', message: 'Downloading PDF report...' });
      await api.downloadPdf(id, `${title || 'startup'}-analysis.pdf`);
      setToast({ type: 'success', message: 'PDF downloaded successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to download report PDF.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this idea and all related reports?')) {
      return;
    }
    try {
      await api.del(`/ideas/${id}`);
      setToast({ type: 'success', message: 'Idea deleted successfully.' });
      loadIdeas(page);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete idea.' });
    }
  };

  const filteredIdeas = ideas.filter(item => {
    const matchesSearch = !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = !selectedIndustry || item.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const industries = Array.from(new Set(ideas.map(i => i.industry).filter(Boolean)));

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search ideas by name or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        <Link to="/analyze" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Analyze Idea
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your portfolio ideas..." />
      ) : filteredIdeas.length === 0 ? (
        <EmptyState
          title="No startup ideas found"
          description={searchTerm || selectedIndustry ? "No ideas match your current filter criteria." : "You haven't submitted any startup ideas yet."}
          actionText="Analyze First Idea"
          actionLink="/analyze"
        />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {filteredIdeas.map((item) => {
              const score = item.readinessScore || (item.successScore ? item.successScore * 10 : 70);
              const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent';

              return (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        {item.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} /> {item.industry}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {dateStr}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-badge)',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: score >= 80 ? '#F0FDF4' : score >= 60 ? 'var(--color-primary-light)' : '#FFFBEB',
                      color: score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-primary)' : 'var(--color-warning)'
                    }}>
                      {score}/100
                    </div>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.summary}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Link to={`/analysis/${item.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} /> View
                    </Link>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleDownloadPdf(item.id, item.title)}
                        className="btn btn-secondary btn-sm"
                        title="Download PDF Report"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete Idea"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
