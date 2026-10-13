import React, { useState } from 'react';
import { 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  PlusCircle,
  BarChart3,
  Building2,
  Calendar
} from 'lucide-react';

const PRODUCTION_STAGES = [
  'Manuscript Received',
  'Editing',
  'Cover Design',
  'Typesetting',
  'Proofreading',
  'ISBN Assignment',
  'Printing',
  'Distribution Setup',
  'Published & Live'
];

export function MyBooks({ booksData, onSelectBookForTicket }) {
  const [selectedBookModal, setSelectedBookModal] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const { summary, books } = booksData || { summary: {}, books: [] };

  return (
    <div>
      {/* Financial Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon emerald">
            <BookOpen size={20} />
          </div>
          <div className="stat-label">Published Titles</div>
          <div className="stat-value">{summary?.published_books || 0}</div>
          <div className="stat-sub">{summary?.in_production || 0} in active production</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon indigo">
            <TrendingUp size={20} />
          </div>
          <div className="stat-label">Total Copies Sold</div>
          <div className="stat-value">{(summary?.total_copies_sold || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Across Amazon, Flipkart & Store</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <DollarSign size={20} />
          </div>
          <div className="stat-label">Total Royalty Earned</div>
          <div className="stat-value">₹{(summary?.total_royalty_earned || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">80% author net profit share</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={20} />
          </div>
          <div className="stat-label">Royalty Pending Payout</div>
          <div className="stat-value" style={{ color: (summary?.royalty_pending || 0) > 0 ? '#fbbf24' : '#ffffff' }}>
            ₹{(summary?.royalty_pending || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-sub">
            {(summary?.royalty_pending || 0) >= 1000 
              ? '✓ Eligible for next quarterly disbursement'
              : (summary?.royalty_pending || 0) > 0 
                ? 'ℹ Below ₹1,000 threshold (Rolls over)'
                : 'All earned royalties disbursed'}
          </div>
        </div>
      </div>

      {/* Royalty Policy Alert Banner */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <HelpCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            <strong>BookLeaf 80/20 Royalty Policy:</strong> Royalties are computed quarterly and paid within 45 days of quarter close. Minimum payout threshold is <strong>₹1,000</strong>.
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
          Next Payout Cycle: Q1 (Disburses by May 15)
        </span>
      </div>

      {/* Section Header with View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700 }}>
            My Published Books & Catalog
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track ISBN allocations, print partners, sales volumes, and quarterly royalty earnings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            Detailed Table
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {books.map((book) => {
            const isProduction = book.status === 'In Production';
            const prodDetails = book.production_details || {};
            const stageIndex = PRODUCTION_STAGES.indexOf(book.production_stage);

            return (
              <div 
                key={book.id} 
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isProduction ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-category">
                      {book.genre}
                    </span>
                    <span className={`badge ${isProduction ? 'badge-status-open' : 'badge-status-resolved'}`}>
                      {book.status}
                    </span>
                  </div>

                  {/* Title & ISBN */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {book.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    ISBN: {book.isbn || <span style={{ color: '#f59e0b' }}>Pending Assignment ({book.production_stage})</span>}
                  </div>

                  {/* Production Milestone Tracker if in production */}
                  {isProduction ? (
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>
                          Current Milestone: {book.production_stage}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Stage {stageIndex + 1} of 9
                        </span>
                      </div>

                      {/* Mini Stepper Line */}
                      <div style={{ display: 'flex', gap: '3px', marginBottom: '0.75rem' }}>
                        {PRODUCTION_STAGES.map((stg, idx) => (
                          <div 
                            key={stg} 
                            style={{ 
                              flex: 1, 
                              height: '5px', 
                              borderRadius: '2px',
                              background: idx < stageIndex 
                                ? '#10b981' 
                                : idx === stageIndex 
                                  ? '#f59e0b' 
                                  : 'rgba(255, 255, 255, 0.1)' 
                            }} 
                            title={stg}
                          />
                        ))}
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                        <strong>Action:</strong> {prodDetails.waiting_on || 'Manuscript undergoing editorial review'}
                      </div>
                      {prodDetails.estimated_completion && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                          Target Publication: {prodDetails.estimated_completion}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Published Sales & Royalty Metrics */
                    <div style={{
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      marginBottom: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>COPIES SOLD</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.1rem' }}>
                          {book.total_copies_sold}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ROYALTY EARNED</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginTop: '0.1rem' }}>
                          ₹{book.total_royalty_earned.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>PENDING PAYOUT</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: book.royalty_pending > 0 ? '#fbbf24' : '#94a3b8', marginTop: '0.1rem' }}>
                          ₹{book.royalty_pending.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    <span style={{ background: 'var(--bg-surface)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      MRP: ₹{book.mrp}
                    </span>
                    <span style={{ background: 'var(--bg-surface)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      Pages: {book.page_count}
                    </span>
                    <span style={{ background: 'var(--bg-surface)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      Print: {book.printing_partner}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onSelectBookForTicket(book.id)}
                  >
                    <PlusCircle size={14} />
                    <span>Raise Query for Book</span>
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedBookModal(book)}
                    title="View detailed distribution & royalty breakdown"
                  >
                    <BarChart3 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>ISBN</th>
                <th>Genre</th>
                <th>Status / Stage</th>
                <th>MRP</th>
                <th>Copies Sold</th>
                <th>Total Royalty</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{b.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.package}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {b.isbn || <span style={{ color: '#f59e0b' }}>In Production</span>}
                  </td>
                  <td>{b.genre}</td>
                  <td>
                    <span className={`badge ${b.status === 'Published' ? 'badge-status-resolved' : 'badge-status-open'}`}>
                      {b.status === 'Published' ? 'Published' : b.production_stage}
                    </span>
                  </td>
                  <td>₹{b.mrp}</td>
                  <td><strong>{b.total_copies_sold}</strong></td>
                  <td style={{ color: '#34d399', fontWeight: 600 }}>₹{b.total_royalty_earned.toLocaleString('en-IN')}</td>
                  <td>₹{b.royalty_paid.toLocaleString('en-IN')}</td>
                  <td style={{ color: b.royalty_pending > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>
                    ₹{b.royalty_pending.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectBookForTicket(b.id)}
                    >
                      Raise Query
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBookModal && (
        <div className="modal-overlay" onClick={() => setSelectedBookModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedBookModal.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Detailed sales channels and royalty computation ledger.
                </p>
              </div>
              <button className="btn-close" onClick={() => setSelectedBookModal(null)}>×</button>
            </div>

            {/* Channels Breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem' }}>
                Sales Volume by Retail Channel
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                {Object.entries(selectedBookModal.sales_breakdown || {}).map(([channel, count]) => (
                  <div key={channel} style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{channel}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Profit Calculation Formula */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                Net Profit Formula Breakdown:
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                <code>Net Profit = MRP (₹{selectedBookModal.mrp}) - (Printing Cost + Platform Commission + Shipping)</code>
                <br />
                <strong>Author Share (80%):</strong> Disbursed quarterly to your registered bank account.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedBookModal(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const id = selectedBookModal.id;
                  setSelectedBookModal(null);
                  onSelectBookForTicket(id);
                }}
              >
                Raise Query for this Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
