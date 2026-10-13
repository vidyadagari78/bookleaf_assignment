import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  ArrowUpDown, 
  BookOpen, 
  User,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry'
];

const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

export function AdminTicketQueue({ tickets, selectedTicketId, onSelectTicket, filters, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  function handleSearchSubmit(e) {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm });
  }

  return (
    <div className="glass-panel" style={{ padding: '1.4rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Operations Ticket Queue
          </h3>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {tickets.length} incoming queries across 10 authors
          </span>
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--text-dim)' }} />
          <select 
            className="form-select"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', width: 'auto' }}
            value={filters.sort || 'newest'}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest_unresolved">Sort: Oldest Unresolved</option>
            <option value="priority_desc">Sort: Highest Priority Score</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
            placeholder="Search author, book, ticket ID or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      {/* Filter Row: Category & Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Category
          </label>
          <select 
            className="form-select"
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
            value={filters.category || 'All'}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Priority
          </label>
          <select 
            className="form-select"
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
            value={filters.priority || 'All'}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          >
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.35rem' }}>
        {STATUSES.map(st => (
          <button
            key={st}
            className={`btn btn-sm ${filters.status === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', whiteSpace: 'nowrap' }}
            onClick={() => onFilterChange({ ...filters, status: st })}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)', fontSize: '0.86rem' }}>
            No tickets match your filter criteria.
          </div>
        ) : (
          tickets.map(t => {
            const isSelected = t.id === selectedTicketId;
            const priorityLower = (t.effective_priority || t.ai_priority).toLowerCase();
            const isOverdue = t.is_overdue;
            const isUrgent = t.is_urgent;

            return (
              <div 
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(22, 34, 60, 0.95), rgba(15, 23, 42, 0.95))' 
                    : 'rgba(22, 34, 60, 0.55)',
                  border: isSelected 
                    ? '1.5px solid var(--primary)' 
                    : isUrgent 
                      ? '1.5px solid rgba(239, 68, 68, 0.5)' 
                      : '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected 
                    ? '0 4px 18px rgba(16, 185, 129, 0.2)' 
                    : isUrgent 
                      ? '0 0 16px rgba(239, 68, 68, 0.15)' 
                      : 'none',
                  position: 'relative'
                }}
              >
                {/* Top Badge Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-code)', color: 'var(--text-dim)', fontWeight: 700 }}>
                      #{t.id}
                    </span>
                    <span className={`badge badge-priority-${priorityLower}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      {t.effective_priority || t.ai_priority}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isUrgent && (
                      <span className="urgent-indicator">
                        <Flame size={12} /> URGENT
                      </span>
                    )}
                    <span className={`badge badge-status-${t.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.45rem', lineHeight: '1.3' }}>
                  {t.subject}
                </h4>

                {/* Author & Book Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  <User size={13} style={{ color: 'var(--text-dim)' }} />
                  <strong style={{ color: '#e2e8f0' }}>{t.author_name}</strong>
                  {t.book_title && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {t.book_title}
                      </span>
                    </>
                  )}
                </div>

                {/* Category & Footer Indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.55rem' }}>
                  <span className="badge badge-category" style={{ fontSize: '0.66rem', padding: '0.15rem 0.45rem' }}>
                    {t.effective_category || t.ai_category}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {t.note_count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#818cf8', fontWeight: 700 }} title={`${t.note_count} internal notes`}>
                        <Lock size={12} /> {t.note_count}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MessageSquare size={12} /> {t.message_count}
                    </span>
                    <span style={{ color: isOverdue ? '#f87171' : 'var(--text-dim)', fontWeight: isOverdue ? 700 : 500 }}>
                      {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
