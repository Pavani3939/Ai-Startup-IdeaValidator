import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  HelpCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';

export default function FinancialFeasibility() {
  const { id } = useParams();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(id || '');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [projection, setProjection] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    initialInvestment: 15000,
    monthlyFixedCosts: 3500,
    variableCostPerUnit: 25,
    sellingPricePerUnit: 120,
    expectedUnits: 60
  });

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    if (selectedIdeaId) {
      loadLatestProjection(selectedIdeaId);
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
      setToast({ type: 'error', message: 'Failed to load startup ideas.' });
    }
  };

  const loadLatestProjection = async (ideaId) => {
    setLoading(true);
    try {
      const data = await api.get(`/ideas/${ideaId}/financial-projection`);
      if (data && data.estimatedRevenue !== undefined) {
        setProjection(data);
        setForm({
          initialInvestment: data.initialInvestment || 15000,
          monthlyFixedCosts: data.monthlyFixedCosts || 3500,
          variableCostPerUnit: data.variableCostPerUnit || 25,
          sellingPricePerUnit: data.sellingPricePerUnit || 120,
          expectedUnits: data.expectedUnits || 60
        });
      } else {
        setProjection(null);
      }
    } catch (err) {
      // No projection yet, keep default form
      setProjection(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!selectedIdeaId) {
      setToast({ type: 'warning', message: 'Please select an idea first.' });
      return;
    }

    setCalculating(true);
    try {
      const payload = {
        initialInvestment: parseFloat(form.initialInvestment) || 0,
        monthlyFixedCosts: parseFloat(form.monthlyFixedCosts) || 0,
        variableCostPerUnit: parseFloat(form.variableCostPerUnit) || 0,
        sellingPricePerUnit: parseFloat(form.sellingPricePerUnit) || 0,
        expectedUnits: parseInt(form.expectedUnits) || 0
      };

      const result = await api.post(`/ideas/${selectedIdeaId}/financial-projection`, payload);
      setProjection(result);
      setToast({ type: 'success', message: 'Deterministic financial model updated.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Calculation failed.' });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Idea Selector */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ maxWidth: '420px' }}>
          <label className="form-label" style={{ marginBottom: '6px' }}>
            Select Startup Idea for Modeling
          </label>
          <select
            className="form-select"
            value={selectedIdeaId}
            onChange={(e) => setSelectedIdeaId(e.target.value)}
          >
            {ideas.map(i => (
              <option key={i.id} value={i.id}>{i.title} ({i.industry})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
        gap: '32px',
        alignItems: 'start'
      }} className="financial-grid">

        {/* Inputs Form */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={20} style={{ color: 'var(--color-primary)' }} />
            Financial Model Inputs
          </h3>

          <form onSubmit={handleCalculate}>
            <div className="form-group">
              <label className="form-label" htmlFor="initialInvestment">
                Initial Capital Investment ($)
              </label>
              <input
                id="initialInvestment"
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.initialInvestment}
                onChange={(e) => setForm({ ...form, initialInvestment: e.target.value })}
                required
              />
              <span className="form-hint">Upfront tooling, legal, branding, and prototype build costs.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="monthlyFixedCosts">
                Monthly Fixed Operating Costs ($)
              </label>
              <input
                id="monthlyFixedCosts"
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.monthlyFixedCosts}
                onChange={(e) => setForm({ ...form, monthlyFixedCosts: e.target.value })}
                required
              />
              <span className="form-hint">Salaries, SaaS hosting, software tools, office overhead.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="variableCostPerUnit">
                Variable Cost Per Unit ($)
              </label>
              <input
                id="variableCostPerUnit"
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.variableCostPerUnit}
                onChange={(e) => setForm({ ...form, variableCostPerUnit: e.target.value })}
                required
              />
              <span className="form-hint">Direct fulfillment, API tokens, payment processing fees.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sellingPricePerUnit">
                Selling Price / Subscription Per Unit ($)
              </label>
              <input
                id="sellingPricePerUnit"
                type="number"
                min="0"
                step="any"
                className="form-input"
                value={form.sellingPricePerUnit}
                onChange={(e) => setForm({ ...form, sellingPricePerUnit: e.target.value })}
                required
              />
              <span className="form-hint">Average monthly revenue or selling price per subscriber/client.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expectedUnits">
                Expected Monthly Volume (Units / Subscriptions)
              </label>
              <input
                id="expectedUnits"
                type="number"
                min="0"
                className="form-input"
                value={form.expectedUnits}
                onChange={(e) => setForm({ ...form, expectedUnits: e.target.value })}
                required
              />
              <span className="form-hint">Expected monthly paying customer accounts or sold units.</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={calculating}
            >
              {calculating ? 'Computing Metrics...' : 'Calculate Feasibility'}
            </button>
          </form>
        </div>

        {/* Results & Assumptions Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {projection ? (
            <>
              {/* Output KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Estimated Monthly Revenue</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                    ${projection.estimatedRevenue?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {form.expectedUnits} units × ${form.sellingPricePerUnit}
                  </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Monthly Operating Costs</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    ${projection.estimatedTotalCosts?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Fixed (${form.monthlyFixedCosts}) + Variable (${projection.estimatedVariableCosts})
                  </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Est. Operating Profit / Mo.</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: projection.estimatedOperatingProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                    marginTop: '4px'
                  }}>
                    ${projection.estimatedOperatingProfit?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Margin: {projection.operatingMarginPercent !== null ? `${projection.operatingMarginPercent}%` : 'N/A'}
                  </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Break-Even Volume</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-info)', marginTop: '4px' }}>
                    {projection.breakEvenUnits !== null ? `${projection.breakEvenUnits} units` : 'Negative Margin'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Revenue needed: {projection.breakEvenRevenue ? `$${projection.breakEvenRevenue.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Unit Economics Breakdown Card */}
              <div className="card">
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                  Unit Economics Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Selling Price Per Unit:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>${projection.sellingPricePerUnit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Variable Delivery Cost Per Unit:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>-${projection.variableCostPerUnit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Unit Contribution Margin:</span>
                    <strong style={{ color: projection.contributionMarginPerUnit > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      ${projection.contributionMarginPerUnit} / unit
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Estimated Runway on Initial Investment:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {projection.monthlyFixedCosts > 0 ? `${(projection.initialInvestment / projection.monthlyFixedCosts).toFixed(1)} months buffer` : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Calculator size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                No Calculation Recorded
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                Adjust the input fields on the left and click "Calculate Feasibility" to view break-even volume and margin projections.
              </p>
            </div>
          )}

          {/* Model Assumptions & Disclaimers */}
          <div className="card" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} style={{ color: 'var(--color-primary)' }} />
              Deterministic Assumptions & Limitations
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <li>• Calculations are computed deterministically in Java backend logic rather than estimated by generative AI.</li>
              <li>• Operating profit excludes corporate taxation, debt interest financing, non-cash depreciation, and extraordinary capital expenditures.</li>
              <li>• Break-even volume assumes a constant contribution margin per unit regardless of order volume discounting.</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .financial-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
