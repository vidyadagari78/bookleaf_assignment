import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText
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
  if (lowerText.includes('royalty') || lowerText.includes('payment') || lowerText.includes('threshold')) {
    policyHint = '💡 Tip: BookLeaf calculates royalties quarterly (80/20 split) and disburses within 45 days. Minimum payout threshold is ₹1,000 (balances below roll over).';
  } else if (lowerText.includes('isbn') || lowerText.includes('mismatch')) {
    policyHint = '⚡ Note: ISBN mismatch reports are treated with critical priority and escalated directly to our production desk for 48-hour resolution.';
  } else if (lowerText.includes('print') || lowerText.includes('quality') || lowerText.includes('blurry') || lowerText.includes('misalign')) {
    policyHint = '📷 Tip: For print defects, please describe the issue in detail. You can attach photos of the defective copies below for our free reprint warranty.';
  } else if (lowerText.includes('amazon') || lowerText.includes('unavailable')) {
    policyHint = '🔄 Note: Amazon "Currently Unavailable" listings are typically stock sync lags. Our operations team can trigger a manual re-sync within 24–48 hours.';
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
      setError('Please provide both a subject and a detailed query description.');
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
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700, color: '#ffffff' }}>
          Raise a Support Query
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Our operations desk and AI-assisted support team will review your query and respond promptly.
        </p>
      </div>

      {submittedTicket ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={32} />
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Ticket Submitted Successfully!
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Ticket reference: <strong style={{ color: '#ffffff' }}>#{submittedTicket.id}</strong>. Our team has received your query and auto-triaged it with our operations desk.
          </p>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            maxWidth: '520px',
            margin: '0 auto 1.5rem',
            textAlign: 'left',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>AI Auto-Classification:</span>
              <span className="badge badge-category">{submittedTicket.ai_category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Priority Level:</span>
              <span className={`badge badge-priority-${submittedTicket.ai_priority?.toLowerCase()}`}>
                {submittedTicket.ai_priority} (Score: {submittedTicket.ai_priority_score}/100)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
              {submittedTicket.ai_rationale}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
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
              View in My Tickets
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Book Selection Dropdown */}
          <div className="form-group">
            <label className="form-label">
              Select Book / Subject Area <span style={{ color: '#ef4444' }}>*</span>
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
          <div className="form-group">
            <label className="form-label">
              Subject Line <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. When will my Q3 royalty payment be disbursed? or Print defect on author copies"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Query Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea 
              className="form-textarea"
              rows={5}
              placeholder="Please provide full details about your concern, including any relevant dates, order numbers, or screenshots..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Real-time Policy Hint */}
          {policyHint && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: '#bae6fd',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease'
            }}>
              <span>{policyHint}</span>
            </div>
          )}

          {/* File Attachment Support (UI upload simulation with preview) */}
          <div className="form-group">
            <label className="form-label">
              Attachment (Optional — Photos of defect, royalty statements, screenshots)
            </label>
            {attachment ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface-elevated)',
                padding: '0.65rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{attachment.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>({attachment.size})</span>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setAttachment(null)}
                  title="Remove attachment"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                transition: 'border-color 0.2s'
              }}>
                <Paperclip size={16} />
                <span>Click or drop image / PDF file to attach (Max 10MB)</span>
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '160px' }}
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
