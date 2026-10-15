import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BookOpen, 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck,
  AlertCircle,
  Palette,
  ChevronDown
} from 'lucide-react';

export function LoginPage() {
  const { login, quickSwitch, demoAccounts } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg-deep)',
      position: 'relative'
    }}>
      {/* Top Floating Theme Switcher */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 100 }}>
        <div style={{ position: 'relative' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowThemeMenu(prev => !prev)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', boxShadow: 'var(--shadow-card)' }}
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
                minWidth: '220px',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card-hover)',
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
      </div>

      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-card-hover)' }}>
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.15rem',
            boxShadow: '0 8px 24px var(--primary-glow)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <BookOpen size={30} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-royal)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            BookLeaf <span className="text-foil-gold">Publishing</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Author Support & Operations Neural Portal
          </p>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.45rem', fontStyle: 'italic' }}>
            Processing 1,200+ monthly titles across 22,000+ authors
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: '#f87171',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Credentials Info Box */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.78rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 700 }}>Test Account Credentials:</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '2px' }}>
              Author Pass: <code style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-code)' }}>password123</code> • Admin: <code style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-code)' }}>adminpassword123</code>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button 
              type="button" 
              onClick={() => { setEmail('admin@bookleafpublishing.com'); setPassword('adminpassword123'); }}
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Fill Admin
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('priya.sharma@email.com'); setPassword('password123'); }}
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Fill Author
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="author@example.com or admin@bookleafpublishing.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Fast Login for Reviewers */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              1-Click Reviewer Test Logins
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('admin@bookleafpublishing.com', 'admin')}
            >
              <ShieldCheck size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Sunita Kapoor (Operations Admin)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Full ticket queue, AI drafting & overrides</span>
              </div>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('priya.sharma@email.com', 'author')}
            >
              <UserCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Priya Sharma (Author — Active Titles)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>₹3,570 pending royalties, 2 published books</span>
              </div>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('kavita.deshmukh@email.com', 'author')}
            >
              <UserCheck size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Kavita Deshmukh (Author — Rollover Edge Case)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>₹850 pending royalty below ₹1,000 threshold</span>
              </div>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('sneha.kulkarni@email.com', 'author')}
            >
              <UserCheck size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Sneha Kulkarni (Author — In Production)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>3 titles (Midnight in Mysore in Cover Design)</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
