import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Lock, 
  User, 
  BookOpen, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  Edit3,
  Flame,
  Zap,
  Cpu
} from 'lucide-react';
import { api } from '../../services/api';

const CATEGORIES = [
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry'
];

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

export function AdminTicketDetail({ ticketId, onTicketUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Draft Studio state
  const [aiDraft, setAiDraft] = useState('');
  const [aiMeta, setAiMeta] = useState(null);
  const [toneStyle, setToneStyle] = useState('Empathetic & Professional');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSendingResponse, setIsSendingResponse] = useState(false);

  // Status & Override form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState('');
  const [selectedPriorityOverride, setSelectedPriorityOverride] = useState('');
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);

  // Internal Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation'); // 'conversation' | 'notes' | 'author_context'

  useEffect(() => {
    if (!ticketId) return;
    loadTicket();
  }, [ticketId]);

  function loadTicket() {
    setLoading(true);
    api.getTicketById(ticketId)
      .then(res => {
        setTicket(res.ticket);
        setSelectedStatus(res.ticket.status);
        setSelectedCategoryOverride(res.ticket.category_override || '');
        setSelectedPriorityOverride(res.ticket.priority_override || '');
      })
      .catch(err => console.error('Failed to load ticket:', err))
      .finally(() => setLoading(false));
  }

  // Generate or regenerate AI Draft
  async function handleGenerateAiDraft() {
    setIsGeneratingDraft(true);
    try {
      const res = await api.generateAiDraft(ticketId, toneStyle);
      setAiDraft(res.draft);
      setAiMeta(res.metadata);
    } catch (err) {
      alert('Failed to generate AI draft: ' + err.message);
    } finally {
      setIsGeneratingDraft(false);
    }
  }

  // Send response to author
  async function handleSendResponse(targetStatus = 'In Progress') {
    if (!aiDraft.trim()) return;

    setIsSendingResponse(true);
    try {
      await api.addMessage(ticketId, aiDraft.trim(), targetStatus);
      setAiDraft('');
      setAiMeta(null);
      loadTicket();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      alert('Failed to send response: ' + err.message);
    } finally {
      setIsSendingResponse(false);
    }
  }

  // Apply Category / Priority Overrides or Status Change
  async function handleApplyOverrides() {
    setIsUpdatingMeta(true);
    try {
      await api.updateTicket(ticketId, {
        status: selectedStatus,
        category_override: selectedCategoryOverride || null,
        priority_override: selectedPriorityOverride || null
      });
      loadTicket();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      alert('Failed to update ticket: ' + err.message);
    } finally {
      setIsUpdatingMeta(false);
    }
  }

  // Add Internal Note
  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    try {
      await api.addInternalNote(ticketId, newNoteText.trim());
      setNewNoteText('');
      loadTicket();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setIsAddingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <RefreshCw size={26} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1.25rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading ticket details & operations context...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select a ticket from the queue to inspect and draft responses.</p>
      </div>
    );
  }

  const effectiveCategory = ticket.category_override || ticket.ai_category;
  const effectivePriority = ticket.priority_override || ticket.ai_priority;
  const isOverriddenCategory = !!ticket.category_override;
  const isOverriddenPriority = !!ticket.priority_override;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* ======================================================== */}
      {/* LEFT COLUMN: Thread, Author Profile & Internal Notes     */}
      {/* ======================================================== */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        {/* Ticket Header */}
        <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-dim)', fontWeight: 700 }}>
                  #{ticket.id}
                </span>
                <span className={`badge badge-status-${ticket.status.toLowerCase().replace(' ', '')}`}>
                  {ticket.status}
                </span>
                <span className={`badge badge-priority-${effectivePriority.toLowerCase()}`}>
                  {effectivePriority}
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.3' }}>
                {ticket.subject}
              </h2>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
              <div>Raised {new Date(ticket.created_at).toLocaleString()}</div>
              {ticket.assigned_to_name && (
                <div style={{ color: '#818cf8', marginTop: '0.25rem', fontWeight: 600 }}>
                  Assigned: {ticket.assigned_to_name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Left Column */}
        <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.65rem' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'conversation' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('conversation')}
          >
            Author Thread ({ticket.messages?.length || 0})
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('notes')}
          >
            <Lock size={12} />
            <span>Internal Notes ({ticket.internal_notes?.length || 0})</span>
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'author_context' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('author_context')}
          >
            <User size={12} />
            <span>Author & Catalog Profile</span>
          </button>
        </div>

        {/* Tab 1: Conversation Thread */}
        {activeTab === 'conversation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', maxHeight: '540px', overflowY: 'auto', paddingRight: '0.35rem' }}>
            {ticket.messages?.map((msg) => {
              const isAdmin = msg.sender_role === 'admin';
              return (
                <div 
                  key={msg.id}
                  style={{
                    background: isAdmin ? 'linear-gradient(135deg, rgba(22, 34, 60, 0.9), rgba(15, 23, 42, 0.9))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                    border: isAdmin ? '1px solid var(--border-glass)' : '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', fontSize: '0.76rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {isAdmin ? (
                        <>
                          <ShieldCheck size={15} style={{ color: 'var(--primary)' }} />
                          <strong style={{ color: '#a7f3d0' }}>{msg.sender_name} (BookLeaf Operations)</strong>
                        </>
                      ) : (
                        <>
                          <User size={15} style={{ color: 'var(--text-muted)' }} />
                          <strong style={{ color: '#ffffff' }}>{msg.sender_name} (Author)</strong>
                        </>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-dim)' }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Internal Notes (Private to Operations) */}
        {activeTab === 'notes' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(15, 23, 42, 0.8))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.15rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#c7d2fe',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <Lock size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
              <span>Internal notes are <strong>strictly confidential</strong> and never sent to authors or exposed in public API routes.</span>
            </div>

            {/* Existing Notes Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.35rem', maxHeight: '360px', overflowY: 'auto' }}>
              {ticket.internal_notes?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.86rem' }}>
                  No internal notes recorded yet.
                </div>
              ) : (
                ticket.internal_notes.map((n) => (
                  <div key={n.id} style={{ background: 'rgba(22, 34, 60, 0.75)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.4rem' }}>
                      <strong style={{ color: '#818cf8' }}>{n.admin_name}</strong>
                      <span style={{ color: 'var(--text-dim)' }}>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.55' }}>{n.note}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote}>
              <textarea 
                className="form-textarea"
                rows={3}
                placeholder="Record private operational notes (e.g. Verified Repro India print batch logs, approving reprint)..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button type="submit" className="btn btn-secondary btn-sm" disabled={isAddingNote || !newNoteText.trim()}>
                  <Lock size={12} />
                  <span>{isAddingNote ? 'Saving...' : 'Add Private Note'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Author & Catalog Profile Context */}
        {activeTab === 'author_context' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Author Profile */}
            <div style={{ background: 'rgba(22, 34, 60, 0.75)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.65rem' }}>
                Author Profile: {ticket.author_name}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <div>Email: <strong style={{ color: '#ffffff' }}>{ticket.author_email}</strong></div>
                <div>Country: <strong>{ticket.author_country}</strong> ({ticket.author_city || 'N/A'})</div>
                <div>Package: <strong style={{ color: '#fbbf24' }}>{ticket.author_package}</strong></div>
                <div>
                  Bank Verified: {ticket.author_bank_details?.is_verified ? (
                    <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Yes ({ticket.author_bank_details.bank_name})</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠ Not Verified / Pending</span>
                  )}
                </div>
              </div>
            </div>

            {/* Linked Book */}
            {ticket.book_title ? (
              <div style={{ background: 'rgba(22, 34, 60, 0.75)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.65rem' }}>
                  Linked Book: {ticket.book_title}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <div>ISBN: <strong>{ticket.book_isbn || 'Pending'}</strong></div>
                  <div>Status: <strong>{ticket.book_status}</strong></div>
                  <div>Stage: <strong>{ticket.book_production_stage}</strong></div>
                  <div>Copies Sold: <strong style={{ color: '#ffffff' }}>{ticket.book_total_copies_sold}</strong></div>
                  <div>Royalty Earned: <strong style={{ color: '#34d399' }}>₹{ticket.book_total_royalty_earned?.toLocaleString('en-IN')}</strong></div>
                  <div>Royalty Pending: <strong style={{ color: '#fbbf24' }}>₹{ticket.book_royalty_pending?.toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(22, 34, 60, 0.75)', padding: '1.25rem', borderRadius: 'var(--radius-md)', color: 'var(--text-dim)', fontSize: '0.82rem', border: '1px solid var(--border-glass)' }}>
                This is an account-level or general query not tied to a specific book.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: AI Operations Studio & Admin Overrides     */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. AI Auto-Classification & Priority Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.35)', boxShadow: '0 0 25px rgba(99, 102, 241, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                <Cpu size={16} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                AI Auto-Classification & Triage
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#a5b4fc', fontWeight: 700, background: 'rgba(99, 102, 241, 0.15)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
              Score: {ticket.ai_priority_score}/100
            </span>
          </div>

          {/* AI Category & Override */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Domain Category</label>
              {isOverriddenCategory ? (
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>• Admin Overridden</span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>• AI Detected</span>
              )}
            </div>
            <select 
              className="form-select"
              value={selectedCategoryOverride || ticket.ai_category}
              onChange={(e) => setSelectedCategoryOverride(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c} {c === ticket.ai_category ? '(AI Recommended)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* AI Priority & Override */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Urgency Priority</label>
              {isOverriddenPriority ? (
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>• Admin Overridden</span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>• AI Scored ({ticket.ai_priority_score})</span>
              )}
            </div>
            <select 
              className="form-select"
              value={selectedPriorityOverride || ticket.ai_priority}
              onChange={(e) => setSelectedPriorityOverride(e.target.value)}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>
                  {p} {p === ticket.ai_priority ? '(AI Recommended)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
              Ticket Status Lifecycle
            </label>
            <select 
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Rationale explanation */}
          <div style={{ background: 'rgba(22, 34, 60, 0.75)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1.25rem', border: '1px solid var(--border-glass)', lineHeight: '1.5' }}>
            <strong style={{ color: '#ffffff' }}>AI Triage Rationale:</strong> {ticket.ai_rationale}
          </div>

          {/* Save overrides button */}
          <button 
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', padding: '0.65rem' }}
            onClick={handleApplyOverrides}
            disabled={isUpdatingMeta}
          >
            <Sliders size={14} />
            <span>{isUpdatingMeta ? 'Applying Updates...' : 'Apply Status & Override Changes'}</span>
          </button>
        </div>

        {/* 2. AI-Drafted Response Studio (Athena Engine) */}
        <div className="glass-panel" style={{ padding: '1.6rem', borderColor: 'rgba(16, 185, 129, 0.45)', boxShadow: '0 0 35px rgba(16, 185, 129, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)' }}>
                <Sparkles size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Athena Neural Drafting Studio
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Policy-Grounded Editorial AI</span>
              </div>
            </div>
            <div className="waveform-bars" title="Neural synthesis engine active">
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: '1.5' }}>
            Synthesizes responses using BookLeaf's 80/20 royalty formula, 45-day window, printing SLAs, and empathetic tone guidelines.
          </p>

          {/* Active Policy Citations */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
              Grounded Policy Clauses
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="policy-citation-tag" title="80% net author profit share">
                §4.1 Royalty Split (80/20)
              </span>
              <span className="policy-citation-tag" title="₹1,000 threshold with automatic quarterly rollover">
                §5.2 ₹1,000 Rollover Rule
              </span>
              <span className="policy-citation-tag" title="Quarterly distribution within 45 days">
                §6.0 45-Day Payout SLA
              </span>
              {ticket.ai_category === 'ISBN & Metadata Issues' && (
                <span className="policy-citation-tag" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }} title="Raja Rammohun Roy National Agency escalation">
                  §2.3 Critical ISBN Priority
                </span>
              )}
              {ticket.ai_category === 'Printing & Quality' && (
                <span className="policy-citation-tag" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde68a' }} title="100% free replacement on verified printing flaws">
                  §3.2 Free Reprint Warranty
                </span>
              )}
            </div>
          </div>

          {/* Tone Selector & Generator Button */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <select 
              className="form-select"
              style={{ fontSize: '0.82rem', flex: 1, minWidth: '180px' }}
              value={toneStyle}
              onChange={(e) => setToneStyle(e.target.value)}
            >
              <option value="Empathetic & Professional">🌿 Tone: Empathetic & Professional</option>
              <option value="Direct & Expedited">⚡ Tone: Direct & Expedited Action</option>
              <option value="Detailed Breakdown">📐 Tone: Detailed Ledger Breakdown</option>
            </select>

            <button 
              className="btn btn-primary btn-sm"
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingDraft}
              style={{ padding: '0.65rem 1.1rem' }}
            >
              <Sparkles size={14} />
              <span>{isGeneratingDraft ? 'Synthesizing...' : 'Generate Draft'}</span>
            </button>
          </div>

          {/* Metadata banner if generated */}
          {aiMeta && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.8))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.95rem',
              fontSize: '0.75rem',
              color: '#a7f3d0',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>Model:</strong> {aiMeta.provider}</span>
              <span><strong>Tokens:</strong> ~{aiMeta.tokens_used} ({aiMeta.cost_savings})</span>
            </div>
          )}

          {/* Editable Draft Textarea */}
          <div style={{ marginBottom: '1rem' }}>
            <textarea 
              className="form-textarea"
              rows={8}
              placeholder="Click 'Generate Draft' above to synthesize a response grounded in BookLeaf policies, or draft manually..."
              value={aiDraft}
              onChange={(e) => setAiDraft(e.target.value)}
              style={{ fontSize: '0.86rem', lineHeight: '1.6' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button 
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => handleSendResponse('In Progress')}
              disabled={isSendingResponse || !aiDraft.trim()}
            >
              <Send size={15} />
              <span>{isSendingResponse ? 'Sending...' : 'Send to Author'}</span>
            </button>

            <button 
              className="btn btn-secondary"
              title="Send and mark ticket as Resolved"
              onClick={() => handleSendResponse('Resolved')}
              disabled={isSendingResponse || !aiDraft.trim()}
            >
              <CheckCircle2 size={15} />
              <span>Resolve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
