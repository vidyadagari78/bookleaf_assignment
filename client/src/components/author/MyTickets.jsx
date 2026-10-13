import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  Paperclip, 
  User, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';

export function MyTickets({ tickets, selectedTicketId, onSelectTicket, onRefreshNeeded }) {
  const [activeTicketId, setActiveTicketId] = useState(selectedTicketId || (tickets[0]?.id || null));
  const [ticketDetails, setTicketDetails] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Keep active ticket in sync with prop
  useEffect(() => {
    if (selectedTicketId) {
      setActiveTicketId(selectedTicketId);
    }
  }, [selectedTicketId]);

  // Fetch full details of active ticket
  useEffect(() => {
    if (!activeTicketId) return;

    api.getTicketById(activeTicketId)
      .then(res => setTicketDetails(res.ticket))
      .catch(err => console.error('Failed to load ticket details:', err));
  }, [activeTicketId]);

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;

    setIsSending(true);
    try {
      const res = await api.addMessage(activeTicketId, replyText.trim());
      setTicketDetails(prev => ({
        ...prev,
        status: res.ticket_status,
        messages: [...(prev?.messages || []), res.message]
      }));
      setReplyText('');
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setIsSending(false);
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch = !searchTerm || 
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
            My Support Queries & Tickets
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time conversational thread with BookLeaf Author Operations.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <MessageSquare size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>No Tickets Raised Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Have a question about royalties, ISBNs, print copies, or publication? Submit a query above!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Tickets List */}
          <div className="glass-panel" style={{ padding: '1rem', maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredTickets.map(t => {
                const isActive = t.id === activeTicketId;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTicketId(t.id);
                      if (onSelectTicket) onSelectTicket(t.id);
                    }}
                    style={{
                      padding: '0.95rem',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        #{t.id}
                      </span>
                      <span className={`badge badge-status-${t.status.toLowerCase().replace(' ', '')}`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                      {t.subject}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      <span className="badge badge-category" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                        {t.effective_category || t.ai_category}
                      </span>
                      <span>
                        {new Date(t.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ticket Conversation Thread */}
          {ticketDetails ? (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
              {/* Header */}
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                        #{ticketDetails.id}
                      </span>
                      <span className={`badge badge-status-${ticketDetails.status.toLowerCase().replace(' ', '')}`}>
                        {ticketDetails.status}
                      </span>
                      <span className="badge badge-category">
                        {ticketDetails.effective_category || ticketDetails.ai_category}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
                      {ticketDetails.subject}
                    </h3>
                    {ticketDetails.book_title && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Linked Book: <strong>{ticketDetails.book_title}</strong> {ticketDetails.book_isbn ? `(${ticketDetails.book_isbn})` : ''}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                    <div>Created {new Date(ticketDetails.created_at).toLocaleString()}</div>
                    <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>⚡ Real-Time Connected</div>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
                {ticketDetails.messages?.map((msg) => {
                  const isAdminMsg = msg.sender_role === 'admin';
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdminMsg ? 'flex-start' : 'flex-end',
                        maxWidth: '90%',
                        alignSelf: isAdminMsg ? 'flex-start' : 'flex-end'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', fontSize: '0.74rem' }}>
                        {isAdminMsg ? (
                          <>
                            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontWeight: 700, color: '#a7f3d0' }}>{msg.sender_name} (BookLeaf Operations)</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>You</span>
                            <User size={14} style={{ color: 'var(--text-dim)' }} />
                          </>
                        )}
                        <span style={{ color: 'var(--text-dim)' }}>
                          • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{
                        background: isAdminMsg ? 'var(--bg-surface-elevated)' : 'rgba(16, 185, 129, 0.15)',
                        border: isAdminMsg ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: varRadius(isAdminMsg),
                        padding: '1rem 1.25rem',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        boxShadow: varShadow(isAdminMsg)
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Type your reply to BookLeaf Operations..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ minHeight: '60px' }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSending || !replyText.trim()}
                    style={{ height: '48px', padding: '0 1.25rem' }}
                  >
                    <Send size={16} />
                    <span>{isSending ? 'Sending...' : 'Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Select a ticket from the list to view its real-time conversational thread.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function varRadius(isAdmin) {
  return isAdmin ? '4px 16px 16px 16px' : '16px 4px 16px 16px';
}

function varShadow(isAdmin) {
  return isAdmin ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 10px rgba(16, 185, 129, 0.15)';
}
