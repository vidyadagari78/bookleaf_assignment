import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminAuthorsView({ onSelectAuthor }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { quickSwitch } = useAuth();

  useEffect(() => {
    api.getAuthors()
      .then(res => setAuthors(res.authors || []))
      .catch(err => console.error('Failed to load authors:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAuthors = authors.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.city && a.city.toLowerCase().includes(search.toLowerCase())) ||
    (a.country && a.country.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
            BookLeaf Authors Directory (10 Catalog Authors)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Complete view of authors, catalog titles, sales figures, and pending royalty liabilities.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
            placeholder="Search by author name, email or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Location</th>
              <th>Package</th>
              <th>Books</th>
              <th>Copies Sold</th>
              <th>Total Royalty</th>
              <th>Pending Payout</th>
              <th>Bank Status</th>
              <th>Open Tickets</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuthors.map((a) => {
              const isBankVerified = a.bank_details?.is_verified;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{a.email}</div>
                  </td>
                  <td>{a.city ? `${a.city}, ${a.country}` : a.country}</td>
                  <td>
                    <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>
                      {a.package}
                    </span>
                  </td>
                  <td><strong>{a.book_count}</strong></td>
                  <td>{a.total_copies_sold?.toLocaleString('en-IN')}</td>
                  <td style={{ color: '#34d399', fontWeight: 600 }}>
                    ₹{a.total_royalty_earned?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ color: a.royalty_pending > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>
                    ₹{a.royalty_pending?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    {isBankVerified ? (
                      <span style={{ color: '#34d399', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={13} /> Unverified
                      </span>
                    )}
                  </td>
                  <td>
                    {a.open_tickets_count > 0 ? (
                      <span className="badge badge-status-open" style={{ fontSize: '0.7rem' }}>
                        {a.open_tickets_count} Open
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>None</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      title="Switch login to this author to view their portal"
                      onClick={() => quickSwitch(a.email, 'author')}
                    >
                      <ExternalLink size={12} />
                      <span>View as Author</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
