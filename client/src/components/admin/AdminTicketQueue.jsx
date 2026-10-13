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
  User
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
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
            Author Ticket Queue
          </h3>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {tickets.length} incoming queries across 10 authors
          </span>
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--text-dim)' }} />
          <select 
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
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

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '0.85rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
            placeholder="Search author, book, ticket ID or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      {/* Filter Row: Category & Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Category</label>
          <select 
            className="form-select"
            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
            value={filters.category || 'All'}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>Priority</label>
          <select 
            className="form-select"
            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
            value={filters.priority || 'All'}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          >
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.3rem' }}>
        {STATUSES.map(st => (
          <button
            key={st}
            className={`btn btn-sm ${filters.status === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', whiteSpace: 'nowrap' }}
            onClick={() => onFilterChange({ ...filters, status: st })}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingRight: '0.2rem' }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
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
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)',
                  border: isSelected 
                    ? '1px solid var(--primary)' 
                    : isUrgent 
                      ? '1px solid rgba(239, 68, 68, 0.4)' 
                      : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {/* Top Badge Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontWeight: 600 }}>
                      #{t.id}
                    </span>
                    <span className={`badge badge-priority-${priorityLower}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                      {t.effective_priority || t.ai_priority}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isUrgent && (
                      <span className="urgent-indicator">URGENT</span>
                    )}
                    <span className={`badge badge-status-${t.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                  {t.subject}
                </h4>

                {/* Author & Book Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <User size={12} style={{ color: 'var(--text-dim)' }} />
                  <strong style={{ color: '#e2e8f0' }}>{t.author_name}</strong>
                  {t.book_title && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {t.book_title}
                      </span>
                    </>
                  )}
                </div>

                {/* Category & Footer Indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  <span className="badge badge-category" style={{ fontSize: '0.66rem', padding: '0.15rem 0.4rem' }}>
                    {t.effective_category || t.ai_category}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {t.note_count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#818cf8' }} title={`${t.note_count} internal notes`}>
                        <Lock size={11} /> {t.note_count}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <MessageSquare size={11} /> {t.message_count}
                    </span>
                    <span style={{ color: isOverdue ? '#f87171' : 'var(--text-dim)' }}>
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
