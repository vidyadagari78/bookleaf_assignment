import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  BookOpen,
  PieChart
} from 'lucide-react';

export function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(res => setStats(res.stats))
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Aggregating operations metrics and AI performance analytics...</p>
      </div>
    );
  }

  const {
    total_tickets,
    status_breakdown,
    urgent_unresolved,
    category_breakdown,
    ai_agreement_rate,
    ai_overridden_tickets,
    avg_hours_to_resolve,
    financials
  } = stats;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
          Operations & AI Analytics Dashboard
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          High-level operational health, author support SLAs, catalog financial liabilities, and AI triaging performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon rose">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-label">Urgent / Critical Unresolved</div>
          <div className="stat-value" style={{ color: urgent_unresolved > 0 ? '#ef4444' : '#ffffff' }}>
            {urgent_unresolved}
          </div>
          <div className="stat-sub">High priority queries requiring immediate SLA action</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={20} />
          </div>
          <div className="stat-label">Open Support Queue</div>
          <div className="stat-value">{status_breakdown.Open + status_breakdown['In Progress']}</div>
          <div className="stat-sub">{status_breakdown.Open} Open • {status_breakdown['In Progress']} In Progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <Sparkles size={20} />
          </div>
          <div className="stat-label">AI Triaging Agreement Rate</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{ai_agreement_rate}%</div>
          <div className="stat-sub">{ai_overridden_tickets} admin overrides recorded</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon indigo">
            <BarChart3 size={20} />
          </div>
          <div className="stat-label">Avg. Resolution SLA</div>
          <div className="stat-value">{avg_hours_to_resolve}h</div>
          <div className="stat-sub">BookLeaf standard SLA target: &lt; 48 hours</div>
        </div>
      </div>

      {/* Two Column Layout: Categories & Financial Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Ticket Volume by Inquiry Category
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {category_breakdown?.map((cat) => {
              const percentage = total_tickets > 0 ? Math.round((cat.count / total_tickets) * 100) : 0;
              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cat.count} tickets ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: getCategoryColor(cat.category), 
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catalog Financial Liabilities */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.25rem' }}>
            <DollarSign size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Catalog Royalty & Sales Overview
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>TOTAL COPIES SOLD ACROSS CATALOG</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {financials?.total_copies_sold?.toLocaleString('en-IN')} units
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>TOTAL AUTHOR ROYALTIES EARNED (80% SHARE)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                ₹{financials?.total_royalty_earned?.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>PENDING QUARTERLY PAYOUT LIABILITY</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.2rem' }}>
                ₹{financials?.total_royalty_pending?.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Includes roll-over balances below ₹1,000 threshold
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryColor(category) {
  switch (category) {
    case 'Royalty & Payments': return '#10b981';
    case 'ISBN & Metadata Issues': return '#ef4444';
    case 'Printing & Quality': return '#f59e0b';
    case 'Distribution & Availability': return '#38bdf8';
    case 'Book Status & Production Updates': return '#818cf8';
    default: return '#94a3b8';
  }
}
