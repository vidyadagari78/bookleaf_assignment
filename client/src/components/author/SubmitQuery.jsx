import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export function SubmitQuery({ books, preselectedBookId, onTicketCreated }) {
  const [bookId, setBookId] = useState(preselectedBookId || '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState(null);

  // Policy context hint based on user typing
  const lowerText = `${subject} ${description}`.toLowerCase();
  let policyHint = null;
  if (lowerText.includes('royalty') || lowerText.includes('payment') || lowerText.includes('threshold') || lowerText.includes('money')) {
    policyHint = '💡 Tip: BookLeaf calculates royalties quarterly (80/20 split) and disburses within 45 days. Minimum payout threshold is ₹1,000 (balances below roll over automatically).';
  } else if (lowerText.includes('isbn') || lowerText.includes('mismatch') || lowerText.includes('barcode')) {
    policyHint = '⚡ Priority SLA: ISBN mismatch reports are treated with Critical priority and escalated directly to our production desk for 48-hour resolution.';
  } else if (lowerText.includes('print') || lowerText.includes('quality') || lowerText.includes('blurry') || lowerText.includes('misalign')) {
    policyHint = '📷 Quality Warranty: For printing defects, describe the issue and attach clear photos below. BookLeaf provides a 100% free reprint once verified.';
  } else if (lowerText.includes('amazon') || lowerText.includes('unavailable') || lowerText.includes('out of stock')) {
    policyHint = '🔄 Catalog Sync: Amazon "Currently Unavailable" listings are typically automated stock sync desyncs. Our team triggers manual re-syncs within 24–48 hours.';
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setAttachment({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file)
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject line and a detailed description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createTicket({
        book_id: bookId ? bookId : null,
        subject: subject.trim(),
        description: description.trim(),
        attachment_name: attachment?.name || null,
        attachment_url: attachment?.url || null
      });

      setSubmittedTicket(res.ticket);
      setSubject('');
      setDescription('');
      setAttachment(null);
      if (onTicketCreated) onTicketCreated(res.ticket);
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <div className="hero-badge-tag" style={{ margin: '0 auto 0.75rem' }}>
          <Sparkles size={14} />
          <span>Operations Support Desk</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Submit an Author Support Query
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0.35rem auto 0' }}>
          Our operations team and AI-assisted triage engine will review your request, ground it in BookLeaf policies, and respond promptly.
        </p>
      </div>

      {submittedTicket ? (
        /* Submission Success & AI Triaging Confirmation Screen */
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.45)', boxShadow: '0 0 35px rgba(16, 185, 129, 0.12)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.1))',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
            Support Ticket Registered Successfully
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Ticket ID: <strong style={{ color: '#ffffff', fontFamily: 'var(--font-code)' }}>#{submittedTicket.id}</strong>. Our team has received your inquiry and initialized automated AI triaging.
          </p>

          <div style={{
            background: 'rgba(22, 34, 60, 0.75)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            maxWidth: '560px',
            margin: '0 auto 1.75rem',
            textAlign: 'left',
            border: '1px solid var(--border-glass)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Auto-Classification:</span>
              <span className="badge badge-category">{submittedTicket.ai_category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Priority:</span>
              <span className={`badge badge-priority-${submittedTicket.ai_priority?.toLowerCase()}`}>
                {submittedTicket.ai_priority} (Score: {submittedTicket.ai_priority_score}/100)
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '0.6rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.6rem', lineHeight: '1.5' }}>
              <strong>AI Triage Rationale:</strong> {submittedTicket.ai_rationale}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setSubmittedTicket(null)}
            >
              Raise Another Query
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (onTicketCreated) onTicketCreated(submittedTicket);
              }}
            >
              <span>View in My Tickets</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Ticket Form */
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.15rem',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Book Dropdown */}
          <div style={{ marginBottom: '1.35rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Select Book Title / Area <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              className="form-select"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            >
              <option value="">General / Account Level (Not Book-Specific)</option>
              {books?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} {b.isbn ? `(ISBN: ${b.isbn})` : `(${b.status}: ${b.production_stage})`}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Line */}
          <div style={{ marginBottom: '1.35rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Subject Line <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. When will my Q3 royalty payment disburse? or Defective spine on author copies"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: '1.35rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Detailed Query Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea 
              className="form-textarea"
              rows={5}
              placeholder="Please provide full details about your concern, including any order numbers, sales figures, platforms, or dates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Dynamic Policy Context Hint */}
          {policyHint && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.8))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.15rem',
              fontSize: '0.82rem',
              color: '#bae6fd',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <span>{policyHint}</span>
            </div>
          )}

          {/* File Attachment Dropzone */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
              Attachment (Optional — Photos of defect, sales reports, or receipts)
            </label>
            {attachment ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(22, 34, 60, 0.75)',
                padding: '0.75rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileText size={20} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>{attachment.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({attachment.size})</span>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setAttachment(null)}
                  title="Remove attachment"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                padding: '1.25rem',
                border: '2px dashed var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
                transition: 'all 0.2s ease'
              }}>
                <Paperclip size={18} />
                <span>Click to browse or drop screenshots / PDF files (Max 10MB)</span>
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '180px', padding: '0.75rem 1.4rem' }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Triaging with AI...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
