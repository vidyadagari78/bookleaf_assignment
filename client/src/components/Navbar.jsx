import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  LogOut, 
  RefreshCw, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ChevronDown,
  X,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';

export function Navbar({ isWsConnected, onResetSuccess }) {
  const { user, logout, quickSwitch, demoAccounts, isAdmin } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  async function handleReset() {
    if (!window.confirm('Reset database back to the original 10 authors, 18 books, and 7 sample tickets?')) return;
    setIsResetting(true);
    try {
      const res = await api.resetSeed();
      setResetMessage('Database reset successfully!');
      setTimeout(() => setResetMessage(null), 3000);
      if (onResetSuccess) onResetSuccess();
    } catch (e) {
      alert('Reset failed: ' + e.message);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <>
      <header className="navbar">
        <div className="brand-wrapper" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-logo-icon">
            <BookOpen size={22} />
          </div>
          <div className="brand-text">
            <h1>
              BookLeaf <span className="brand-badge">PUBLISHING</span>
            </h1>
            <p className="brand-tagline">Author Support & Communication Portal</p>
          </div>
        </div>

        <div className="nav-actions">
          {/* Real-time WebSocket Status */}
          <div className="live-indicator" title={isWsConnected ? "Live bi-directional updates active" : "Reconnecting to stream..."}>
            <span className="pulse-dot" style={{ backgroundColor: isWsConnected ? '#10b981' : '#f59e0b', boxShadow: isWsConnected ? '0 0 8px #10b981' : '0 0 8px #f59e0b' }} />
            <span>{isWsConnected ? 'Real-Time Sync' : 'Connecting...'}</span>
          </div>

          {/* Quick Demo Switcher Button */}
          <button 
            className="btn btn-demo btn-sm"
            onClick={() => setShowDemoModal(true)}
            title="Switch demo account to test author or admin views"
          >
            <Sparkles size={14} />
            <span>Demo Accounts</span>
          </button>

          {/* API Docs Button */}
          <a 
            href="/api-docs" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-secondary btn-sm"
            title="Open Swagger/OpenAPI 3.0 Documentation"
          >
            <FileText size={14} />
            <span>API Docs</span>
            <ExternalLink size={12} style={{ opacity: 0.6 }} />
          </a>

          {/* User Profile Pill */}
          {user && (
            <div className="user-menu">
              <div className="user-badge-pill">
                <span className={`role-tag ${user.role}`}>
                  {user.role === 'admin' ? 'OPERATIONS ADMIN' : 'AUTHOR'}
                </span>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={logout}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Demo Account Switcher Modal */}
      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} style={{ color: '#f59e0b' }} />
                  Demo Accounts Switcher
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  One-click switch into any seeded account to test author-facing and admin-facing portals.
                </p>
              </div>
              <button className="btn-close" onClick={() => setShowDemoModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Admins Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <ShieldCheck size={16} style={{ color: '#818cf8' }} />
                <h4 style={{ fontSize: '0.9rem', color: '#c7d2fe', fontWeight: 600 }}>BookLeaf Operations Admins</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {demoAccounts.admins?.map((adm) => {
                  const isCurrent = user?.id === adm.id;
                  return (
                    <div 
                      key={adm.id}
                      onClick={() => {
                        quickSwitch(adm.email, 'admin');
                        setShowDemoModal(false);
                      }}
                      style={{
                        background: isCurrent ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface-elevated)',
                        border: isCurrent ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = isCurrent ? '#6366f1' : 'var(--border-subtle)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adm.name}</span>
                        {isCurrent && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{adm.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{adm.email}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Authors Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <UserCheck size={16} style={{ color: '#34d399' }} />
                <h4 style={{ fontSize: '0.9rem', color: '#a7f3d0', fontWeight: 600 }}>Sample Authors (10 Diverse States)</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {demoAccounts.authors?.map((auth) => {
                  const isCurrent = user?.id === auth.id;
                  return (
                    <div 
                      key={auth.id}
                      onClick={() => {
                        quickSwitch(auth.email, 'author');
                        setShowDemoModal(false);
                      }}
                      style={{
                        background: isCurrent ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-surface-elevated)',
                        border: isCurrent ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#34d399'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = isCurrent ? '#10b981' : 'var(--border-subtle)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{auth.name}</span>
                        {isCurrent && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {auth.book_count} books • {auth.package}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>{auth.city || auth.country}</span>
                        <span style={{ color: auth.total_pending > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 600 }}>
                          Pending: ₹{auth.total_pending?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Reset Button in Modal */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                Seed includes edge cases: 0 sales, pending under ₹1,000, and 2 books in production.
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                disabled={isResetting}
              >
                <RefreshCw size={14} className={isResetting ? "animate-spin" : ""} />
                <span>{isResetting ? 'Resetting...' : 'Reset Sample Data'}</span>
              </button>
            </div>
            {resetMessage && (
              <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.8rem', textAlign: 'center' }}>
                ✓ {resetMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
