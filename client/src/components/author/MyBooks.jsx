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
  Calendar,
  Crown,
  Leaf,
  Globe,
  Truck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

function getBookGenreTheme(genre) {
  const g = (genre || '').toLowerCase();
  if (g.includes('fintech') || g.includes('finance') || g.includes('business')) return 'book-theme-fintech';
  if (g.includes('poetry') || g.includes('anthology')) return 'book-theme-poetry';
  if (g.includes('sci-fi') || g.includes('science') || g.includes('tech') || g.includes('quantum')) return 'book-theme-scifi';
  if (g.includes('culinary') || g.includes('food') || g.includes('recipe')) return 'book-theme-culinary';
  if (g.includes('mindful') || g.includes('wellness') || g.includes('health') || g.includes('ayurved')) return 'book-theme-mindfulness';
  return 'book-theme-general';
}

export function MyBooks({ booksData, onSelectBookForTicket }) {
  const { user } = useAuth();
  const [selectedBookModal, setSelectedBookModal] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [showSimulator, setShowSimulator] = useState(true);
  const [simCopies, setSimCopies] = useState(350);
  const { summary, books } = booksData || { summary: {}, books: [] };

  const bankDetails = user?.bank_details || {};
  const isBankVerified = bankDetails.is_verified;
  const isBestsellerPackage = user?.package === 'Bestseller Breakthrough';

  // Royalty Simulation math
  const simMrp = 450;
  const simPrint = 120;
  const simChannelCut = simMrp * 0.20; // 90
  const simNetProfit = simMrp - simPrint - simChannelCut; // 240
  const simAuthorShare = simNetProfit * 0.80; // 192
  const simTotalAuthorEarnings = Math.round(simCopies * simAuthorShare);
  const isSimEligible = simTotalAuthorEarnings >= 1000;

  return (
    <div>
      {/* ======================================================== */}
      {/* 1. AUTHOR PROFILE HERO BANNER                            */}
      {/* ======================================================== */}
      <div className="hero-banner-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div className="hero-badge-tag">
              <Sparkles size={14} />
              <span>BookLeaf Literary Atelier</span>
            </div>
            <h2 className="hero-title" style={{ fontFamily: 'var(--font-editorial)' }}>
              Welcome to your Atelier, {user?.name || 'Author'}
            </h2>
            <p className="hero-subtitle">
              Manage your published book catalog, track real-time marketplace sales, and review quarterly royalty statements under BookLeaf's 80/20 net profit model.
            </p>
          </div>

          {/* Author Tier & Bank Status Pill */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '240px' }}>
            <div style={{
              background: isBestsellerPackage ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))' : 'rgba(16, 185, 129, 0.15)',
              border: isBestsellerPackage ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: isBestsellerPackage ? '0 0 16px rgba(245, 158, 11, 0.15)' : 'none'
            }}>
              {isBestsellerPackage ? (
                <Crown size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
              ) : (
                <Leaf size={20} style={{ color: '#34d399', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Publishing Package
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                  {user?.package || 'Standard Free'}
                </div>
              </div>
            </div>

            {/* Bank Verification Status */}
            <div style={{
              background: isBankVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: isBankVerified ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontSize: '0.78rem'
            }}>
              {isBankVerified ? (
                <>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  <span style={{ color: '#a7f3d0' }}>
                    Payout Bank: <strong>{bankDetails.bank_name || 'Linked Account'} (Verified)</strong>
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} style={{ color: '#ef4444' }} />
                  <span style={{ color: '#fca5a5' }}>
                    <strong>Bank details pending verification</strong> (Disbursements paused)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS OVERVIEW CARDS                                  */}
      {/* ======================================================== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon emerald">
            <BookOpen size={22} />
          </div>
          <div className="stat-label">Published Catalog</div>
          <div className="stat-value">{summary?.published_books || 0} Titles</div>
          <div className="stat-sub">{summary?.in_production || 0} in active production stages</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon indigo">
            <TrendingUp size={22} />
          </div>
          <div className="stat-label">Marketplace Copies Sold</div>
          <div className="stat-value">{(summary?.total_copies_sold || 0).toLocaleString('en-IN')} Units</div>
          <div className="stat-sub">Across Amazon India, US, UK & Flipkart</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <DollarSign size={22} />
          </div>
          <div className="stat-label">Total Royalty Earned</div>
          <div className="stat-value text-foil-emerald">₹{(summary?.total_royalty_earned || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">80% Author Net Profit Split</div>
        </div>

        <div className="stat-card" style={{ borderColor: (summary?.royalty_pending || 0) >= 1000 ? 'rgba(245, 158, 11, 0.4)' : undefined }}>
          <div className="stat-icon amber">
            <Clock size={22} />
          </div>
          <div className="stat-label">Pending Royalty Payout</div>
          <div className="stat-value" style={{ color: (summary?.royalty_pending || 0) > 0 ? '#fbbf24' : '#ffffff' }}>
            ₹{(summary?.royalty_pending || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-sub">
            {(summary?.royalty_pending || 0) >= 1000 
              ? '✓ Eligible for next quarterly payout'
              : (summary?.royalty_pending || 0) > 0 
                ? 'ℹ Below ₹1,000 threshold (Rolls over)'
                : 'All calculated earnings disbursed'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE 80/20 ROYALTY PROFIT SIMULATOR           */}
      {/* ======================================================== */}
      <div className="royalty-simulator-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="hero-badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
              <Sparkles size={13} />
              <span>Interactive Royalty Economics</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem' }}>
              BookLeaf 80/20 Net Profit Simulator
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Simulate quarterly sales to see how BookLeaf's 80% net author profit split is calculated and when it meets the ₹1,000 disbursement threshold.
            </p>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Simulated Quarterly Author Payout</span>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-display)' }}>
              ₹{simTotalAuthorEarnings.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.72rem', color: isSimEligible ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
              {isSimEligible ? '✓ Exceeds ₹1,000 threshold (Scheduled for Payout)' : 'ℹ Below ₹1,000 threshold (Rolls over)'}
            </span>
          </div>
        </div>

        {/* Slider Controls */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <span>Projected Copies Sold this Quarter: <strong style={{ color: '#ffffff', fontSize: '1.05rem', marginLeft: '0.35rem' }}>{simCopies} books</strong></span>
            <span style={{ color: 'var(--text-dim)' }}>Drag slider to simulate volume:</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="2500" 
            step="10"
            value={simCopies} 
            onChange={(e) => setSimCopies(Number(e.target.value))} 
            className="royalty-slider"
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {[25, 100, 250, 500, 1000, 2000].map(cnt => (
              <button 
                key={cnt}
                type="button"
                onClick={() => setSimCopies(cnt)}
                style={{
                  background: simCopies === cnt ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: simCopies === cnt ? '1px solid #f59e0b' : '1px solid var(--border-glass)',
                  color: simCopies === cnt ? '#fbbf24' : 'var(--text-muted)',
                  fontSize: '0.74rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                {cnt} copies
              </button>
            ))}
          </div>
        </div>

        {/* Visual Formula Equation */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="formula-stage-chip">
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>MRP Retail Price</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>₹{simMrp}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Amazon/Flipkart</div>
          </div>
          <div className="formula-operator">−</div>
          <div className="formula-stage-chip">
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>POD Printing Cost</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>₹{simPrint}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Delhi/Repro Hub</div>
          </div>
          <div className="formula-operator">−</div>
          <div className="formula-stage-chip">
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Channel Margin (20%)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>₹{simChannelCut}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Retail Distribution</div>
          </div>
          <div className="formula-operator">=</div>
          <div className="formula-stage-chip" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            <div style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Net Profit / Copy</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>₹{simNetProfit}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>100% Distributable</div>
          </div>
          <div className="formula-operator">× 80% =</div>
          <div className="formula-stage-chip" style={{ background: 'rgba(16, 185, 129, 0.16)', borderColor: 'rgba(16, 185, 129, 0.5)' }}>
            <div style={{ fontSize: '0.68rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Author Royalty / Copy</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', marginTop: '0.2rem' }}>₹{simAuthorShare}</div>
            <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>80% Author Share</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION HEADER & VIEW TOGGLES                         */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Author Book Catalog ({books.length} Titles)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Physical hardcover previews, retail listing availability, printing partners, and sales performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <button 
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('cards')}
          >
            Visual Hardcovers
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            Financial Table
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. VISUAL CARDS VIEW                                     */}
      {/* ======================================================== */}
      {viewMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.75rem' }}>
          {books.map((book) => {
            const isProduction = book.status === 'In Production';
            const prodDetails = book.production_details || {};
            const stageIndex = PRODUCTION_STAGES.indexOf(book.production_stage);
            const isEligiblePayout = book.royalty_pending >= 1000;
            const isRollover = book.royalty_pending > 0 && book.royalty_pending < 1000;

            return (
              <div 
                key={book.id} 
                className="glass-panel book-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isProduction ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-glass)'
                }}
              >
                <div>
                  {/* Card Header with 3D Hardcover Book Showcase */}
                  <div style={{ display: 'flex', gap: '1.35rem', marginBottom: '1.35rem' }}>
                    {/* Realistic 3D Physical Hardcover Model */}
                    <div className="book-3d-scene" onClick={() => setSelectedBookModal(book)} title="Click to view financial ledger breakdown">
                      <div className={`book-3d-hardcover ${getBookGenreTheme(book.genre)}`}>
                        <div className="book-ribbon-bookmark" />
                        <div>
                          <div className="book-cover-title">{book.title}</div>
                          <div style={{ fontSize: '0.52rem', color: '#cbd5e1', opacity: 0.85, marginTop: '3px' }}>
                            {user?.name || 'Author'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div className="book-cover-leaf-seal">
                            <Leaf size={11} />
                          </div>
                          <span style={{ fontSize: '0.48rem', fontFamily: 'var(--font-royal)', color: '#fde68a', letterSpacing: '0.06em' }}>
                            BOOKLEAF
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span className="badge badge-category" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          {book.genre}
                        </span>
                        <span className={`badge ${isProduction ? 'badge-status-open' : 'badge-status-resolved'}`}>
                          {book.status}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.3' }}>
                        {book.title}
                      </h3>

                      <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                        ISBN: {book.isbn ? (
                          <span style={{ color: '#cbd5e1' }}>{book.isbn}</span>
                        ) : (
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>Pending Assignment</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Illuminated Manuscript 9-Stage Milestone Stepper */}
                  {isProduction ? (
                    <div className="milestone-stepper-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <div>
                          <span className="badge badge-priority-high" style={{ fontSize: '0.72rem' }}>
                            Stage {stageIndex + 1} of 9
                          </span>
                          <span style={{ marginLeft: '0.5rem', fontWeight: 800, color: '#fde68a', fontSize: '0.88rem' }}>
                            {book.production_stage}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-code)' }}>
                          {Math.round(((stageIndex + 1) / 9) * 100)}% Complete
                        </span>
                      </div>

                      {/* Stepper track */}
                      <div className="stepper-nodes-row">
                        <div className="stepper-connecting-line" />
                        <div 
                          className="stepper-connecting-progress" 
                          style={{ width: `${((stageIndex) / (PRODUCTION_STAGES.length - 1)) * 100}%` }} 
                        />
                        {PRODUCTION_STAGES.map((stg, idx) => {
                          const isDone = idx < stageIndex;
                          const isCurr = idx === stageIndex;
                          return (
                            <div key={stg} className="stepper-node-item" title={`Stage ${idx + 1}: ${stg}`}>
                              <div className={`stepper-node-circle ${isDone ? 'completed' : isCurr ? 'current' : 'upcoming'}`}>
                                {isDone ? <CheckCircle2 size={14} /> : idx + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Milestone Boundary Markers */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--text-dim)', padding: '0 4px', marginBottom: '0.65rem' }}>
                        <span>Stage 1: Manuscript</span>
                        <span style={{ color: '#fbbf24', fontWeight: 800, background: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          ★ Current: {book.production_stage}
                        </span>
                        <span>Stage 9: Live Release</span>
                      </div>

                      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.78rem', color: '#e2e8f0', marginTop: '0.85rem' }}>
                        <strong>Current Operational Focus:</strong> {prodDetails.waiting_on || 'Manuscript typesetting and interior layout formatting review'}
                        {prodDetails.estimated_completion && (
                          <div style={{ marginTop: '0.25rem', color: '#fde68a', fontSize: '0.74rem' }}>
                            📅 Target Release Date: <strong>{prodDetails.estimated_completion}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Published Sales & Royalty Metrics */
                    <div style={{
                      background: 'rgba(22, 34, 60, 0.7)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border-glass)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>COPIES SOLD</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
                            {book.total_copies_sold}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>ROYALTY EARNED</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
                            ₹{book.total_royalty_earned?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>PENDING PAYOUT</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: book.royalty_pending > 0 ? '#fbbf24' : '#94a3b8', marginTop: '0.15rem' }}>
                            ₹{book.royalty_pending?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Threshold Rollover / Eligibility Pill */}
                      <div style={{ 
                        fontSize: '0.74rem', 
                        padding: '0.35rem 0.65rem', 
                        borderRadius: '6px', 
                        textAlign: 'center',
                        fontWeight: 600,
                        background: isEligiblePayout ? 'rgba(16, 185, 129, 0.12)' : isRollover ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        color: isEligiblePayout ? '#34d399' : isRollover ? '#fbbf24' : 'var(--text-dim)',
                        border: isEligiblePayout ? '1px solid rgba(16, 185, 129, 0.25)' : isRollover ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid transparent'
                      }}>
                        {isEligiblePayout && '✓ Balance exceeds ₹1,000 threshold (Scheduled for payout)'}
                        {isRollover && 'ℹ Balance below ₹1,000 threshold (Rolls over to next quarter)'}
                        {book.royalty_pending === 0 && 'All calculated royalties disbursed to date'}
                      </div>
                    </div>
                  )}

                  {/* Metadata Chips (Print Partner, Page Count, Retail Channels) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem', fontSize: '0.74rem' }}>
                    <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border-glass)', color: '#cbd5e1' }}>
                      MRP: <strong>₹{book.mrp}</strong>
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border-glass)', color: '#cbd5e1' }}>
                      Pages: <strong>{book.page_count}</strong>
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border-glass)', color: '#cbd5e1' }}>
                      Press: <strong>{book.printing_partner}</strong>
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
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
                    title="View detailed distribution channels & net profit breakdown"
                  >
                    <BarChart3 size={14} />
                    <span>Ledger</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Financial Table View */
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>ISBN</th>
                <th>Genre</th>
                <th>Status / Stage</th>
                <th>MRP</th>
                <th>Copies Sold</th>
                <th>Total Royalty</th>
                <th>Disbursed</th>
                <th>Pending</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>{b.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.package}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                    {b.isbn || <span style={{ color: '#fbbf24' }}>In Production</span>}
                  </td>
                  <td>{b.genre}</td>
                  <td>
                    <span className={`badge ${b.status === 'Published' ? 'badge-status-resolved' : 'badge-status-open'}`}>
                      {b.status === 'Published' ? 'Published' : b.production_stage}
                    </span>
                  </td>
                  <td>₹{b.mrp}</td>
                  <td><strong>{b.total_copies_sold}</strong></td>
                  <td style={{ color: '#34d399', fontWeight: 700 }}>₹{b.total_royalty_earned?.toLocaleString('en-IN')}</td>
                  <td>₹{b.royalty_paid?.toLocaleString('en-IN')}</td>
                  <td style={{ color: b.royalty_pending > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 800 }}>
                    ₹{b.royalty_pending?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectBookForTicket(b.id)}
                    >
                      Query
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: SALES CHANNELS & ROYALTY BREAKDOWN             */}
      {/* ======================================================== */}
      {selectedBookModal && (
        <div className="modal-overlay" onClick={() => setSelectedBookModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedBookModal.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Line-by-line distribution ledger and net profit calculation formula.
                </p>
              </div>
              <button className="btn-close" onClick={() => setSelectedBookModal(null)}>×</button>
            </div>

            {/* Sales Volume by Platform */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                Sales Volume Across Retail Channels
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(selectedBookModal.sales_breakdown || {}).map(([channel, count]) => (
                  <div key={channel} style={{ background: 'rgba(22, 34, 60, 0.7)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>{channel}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Profit Formula Breakdown */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.9))',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '1.5rem',
              fontSize: '0.84rem'
            }}>
              <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.45rem' }}>
                BookLeaf 80/20 Net Profit Calculation:
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                <code>Net Profit = MRP (₹{selectedBookModal.mrp}) - (Printing Cost [Delhi/Repro] + Platform Commission [Amazon/Flipkart] + Shipping)</code>
                <br /><br />
                • <strong>80% Author Share:</strong> ₹{selectedBookModal.total_royalty_earned?.toLocaleString('en-IN')} earned to date.
                <br />
                • <strong>Disbursement:</strong> Transferred quarterly within 45 days to verified bank account.
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
