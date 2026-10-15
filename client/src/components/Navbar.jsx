import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  X,
  CheckCircle2,
  Crown,
  Leaf,
  Layers,
  Palette,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

export function Navbar({ isWsConnected, onResetSuccess }) {
  const { user, logout, quickSwitch, demoAccounts, isAdmin } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  async function handleReset() {
    if (!window.confirm('Reset database back to the original 10 authors, 18 books, and 7 sample tickets?')) return;
    setIsResetting(true);
    try {
      const res = await api.resetSeed();
      setResetMessage('Database restored to initial seed!');
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
            <Leaf size={24} />
          </div>
          <div className="brand-text">
            <h1 style={{ fontFamily: 'var(--font-royal)', letterSpacing: '0.02em' }}>
              BookLeaf <span className="brand-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.5)', textShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}>ATELIER</span>
            </h1>
            <p className="brand-tagline">Author Support & Operations Engine • India & US</p>
          </div>
        </div>

        <div className="nav-actions">
          {/* Real-time WebSocket Status */}
          <div className="live-indicator" title={isWsConnected ? "Live bi-directional WebSocket connected" : "Reconnecting to stream..."}>
            <span 
              className="pulse-dot" 
              style={{ 
                backgroundColor: isWsConnected ? '#10b981' : '#f59e0b', 
                boxShadow: isWsConnected ? '0 0 10px #10b981' : '0 0 10px #f59e0b' 
              }} 
            />
            <span>{isWsConnected ? 'Live Real-Time' : 'Syncing...'}</span>
          </div>

          {/* Visual Theme / Design Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowThemeMenu(prev => !prev)}
              title="Change visual theme / design aesthetic"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.75rem' }}
            >
              <Palette size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 600 }}>
                {theme === 'editorial' ? '🏛️ Editorial Ivory' : theme === 'nordic' ? '🌌 Nordic Slate' : '🌿 Midnight Gold'}
              </span>
              <ChevronDown size={12} style={{ opacity: 0.6 }} />
            </button>

            {showThemeMenu && (
              <div 
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 250,
                  minWidth: '225px',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.25)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                  Visual Design Theme
                </div>
                {themes.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: theme === t.id ? '1px solid var(--primary)' : '1px solid transparent',
                      background: theme === t.id ? 'var(--primary-light)' : 'transparent',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: theme === t.id ? 700 : 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{t.icon}</span>
                    <div>
                      <div style={{ lineHeight: '1.2' }}>{t.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Demo Switcher Button */}
          <button 
            className="btn btn-demo btn-sm"
            onClick={() => setShowDemoModal(true)}
            title="Switch demo account to test author or admin views"
          >
            <Sparkles size={14} />
            <span>⚡ Demo Accounts</span>
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
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</span>
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
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={22} style={{ color: '#f59e0b' }} />
                  Demo Accounts Switcher
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Select any pre-seeded persona to test author and operations features.
                </p>
              </div>
              <button className="btn-close" onClick={() => setShowDemoModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Admins Section */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                <ShieldCheck size={18} style={{ color: '#818cf8' }} />
                <h4 style={{ fontSize: '0.92rem', color: '#c7d2fe', fontWeight: 700 }}>BookLeaf Operations Admins</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
                        background: isCurrent ? 'rgba(99, 102, 241, 0.22)' : 'var(--bg-card)',
                        border: isCurrent ? '1.5px solid #6366f1' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isCurrent ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>{adm.name}</span>
                        {isCurrent && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '0.15rem' }}>{adm.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{adm.email}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Authors Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                <UserCheck size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  Catalog Authors (10 Sample Scenarios)
                </h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.35rem' }}>
                {demoAccounts.authors?.map((auth) => {
                  const isCurrent = user?.id === auth.id;
                  const isBreakthrough = auth.package === 'Bestseller Breakthrough';
                  return (
                    <div 
                      key={auth.id}
                      onClick={() => {
                        quickSwitch(auth.email, 'author');
                        setShowDemoModal(false);
                      }}
                      style={{
                        background: isCurrent ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                        border: isCurrent ? '1.5px solid #10b981' : '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isCurrent ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>{auth.name}</span>
                        {isCurrent && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        {isBreakthrough ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700 }}>
                            <Crown size={12} /> Bestseller Breakthrough
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                            Standard Free
                          </span>
                        )}
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>• {auth.book_count} books</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.74rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>{auth.city || auth.country}</span>
                        <span style={{ color: auth.total_pending > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>
                          Pending: ₹{auth.total_pending?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Reset Button in Modal */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                Restore pristine dataset (10 authors, 18 books, 7 sample tickets).
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                disabled={isResetting}
              >
                <RefreshCw size={14} className={isResetting ? "animate-spin" : ""} />
                <span>{isResetting ? 'Restoring...' : 'Reset Dataset'}</span>
              </button>
            </div>
            {resetMessage && (
              <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                ✓ {resetMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
