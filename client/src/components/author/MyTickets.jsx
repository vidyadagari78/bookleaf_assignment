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
  Sparkles,
  BookOpen
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Author Support Threads & Queries
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time conversational thread with BookLeaf Author Operations.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.7)', padding: '0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <MessageSquare size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>No Tickets Raised Yet</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
            Have a question regarding royalties, ISBNs, print copies, or publication milestones? Submit a query above!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 1fr) 2.2fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Tickets Queue */}
          <div className="glass-panel" style={{ padding: '1.15rem', maxHeight: '740px', overflowY: 'auto' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  className="form-input"
                  style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
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
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'linear-gradient(135deg, rgba(22, 34, 60, 0.95), rgba(16, 26, 45, 0.95))' : 'rgba(22, 34, 60, 0.5)',
                      border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-code)', color: 'var(--text-dim)', fontWeight: 600 }}>
                        #{t.id}
                      </span>
                      <span className={`badge badge-status-${t.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.66rem', padding: '0.15rem 0.45rem' }}>
                        {t.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.45rem', lineHeight: '1.3' }}>
                      {t.subject}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      <span className="badge badge-category" style={{ fontSize: '0.66rem', padding: '0.12rem 0.45rem' }}>
                        {t.effective_category || t.ai_category}
                      </span>
                      <span>
                        {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ticket Conversation Thread */}
          {ticketDetails ? (
            <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', minHeight: '640px' }}>
              {/* Header */}
              <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-dim)', fontWeight: 600 }}>
                        #{ticketDetails.id}
                      </span>
                      <span className={`badge badge-status-${ticketDetails.status.toLowerCase().replace(' ', '')}`}>
                        {ticketDetails.status}
                      </span>
                      <span className="badge badge-category">
                        {ticketDetails.effective_category || ticketDetails.ai_category}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.3' }}>
                      {ticketDetails.subject}
                    </h3>

                    {ticketDetails.book_title && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <BookOpen size={14} style={{ color: 'var(--primary)' }} />
                        <span>Referenced Book:</span>
                        <strong style={{ color: '#ffffff' }}>{ticketDetails.book_title}</strong>
                        {ticketDetails.book_isbn && (
                          <span style={{ fontFamily: 'var(--font-code)', color: 'var(--text-dim)' }}>({ticketDetails.book_isbn})</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                    <div>Created {new Date(ticketDetails.created_at).toLocaleString()}</div>
                    <div style={{ color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 600 }}>⚡ Real-Time Active</div>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.35rem', marginBottom: '1.5rem', paddingRight: '0.35rem' }}>
                {ticketDetails.messages?.map((msg) => {
                  const isAdminMsg = msg.sender_role === 'admin';
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdminMsg ? 'flex-start' : 'flex-end',
                        maxWidth: '92%',
                        alignSelf: isAdminMsg ? 'flex-start' : 'flex-end'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', fontSize: '0.74rem' }}>
                        {isAdminMsg ? (
                          <>
                            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontWeight: 800, color: '#a7f3d0' }}>{msg.sender_name} (BookLeaf Operations)</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>You</span>
                            <User size={14} style={{ color: 'var(--text-dim)' }} />
                          </>
                        )}
                        <span style={{ color: 'var(--text-dim)' }}>
                          • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{
                        background: isAdminMsg ? 'linear-gradient(135deg, rgba(22, 34, 60, 0.9), rgba(15, 23, 42, 0.9))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                        border: isAdminMsg ? '1px solid var(--border-glass)' : '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: isAdminMsg ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                        padding: '1.15rem 1.4rem',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        lineHeight: '1.65',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-end' }}>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Type your reply to BookLeaf Operations..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ minHeight: '68px', flex: 1 }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSending || !replyText.trim()}
                    style={{ height: '52px', padding: '0 1.4rem' }}
                  >
                    <Send size={16} />
                    <span>{isSending ? 'Sending...' : 'Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Select a query from the list to view its real-time conversational thread.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
