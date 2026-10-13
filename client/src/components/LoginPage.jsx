import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck,
  AlertCircle
} from 'lucide-react';

export function LoginPage() {
  const { login, quickSwitch, demoAccounts } = useAuth();
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
      background: 'radial-gradient(ellipse at top, #112a20 0%, #0a0e17 70%)'
    }}>
      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 70%, #064e3b 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.15rem',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.45)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <BookOpen size={30} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-royal)', fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
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
            <div style={{ color: '#a7f3d0', fontWeight: 700 }}>Test Account Credentials:</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '2px' }}>
              Author Pass: <code style={{ color: '#fde68a', fontFamily: 'var(--font-code)' }}>password123</code> • Admin: <code style={{ color: '#fde68a', fontFamily: 'var(--font-code)' }}>adminpassword123</code>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button 
              type="button" 
              onClick={() => { setEmail('admin@bookleafpublishing.com'); setPassword('adminpassword123'); }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', color: '#cbd5e1', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Fill Admin
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('aarav.sharma@example.com'); setPassword('password123'); }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', color: '#cbd5e1', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
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
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Priya Sharma (Operations Admin)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Full ticket queue, AI drafting & overrides</span>
              </div>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('aarav.sharma@example.com', 'author')}
            >
              <UserCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Aarav Sharma (Author — Active Titles)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>₹5,500 pending royalties, 2 published books</span>
              </div>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('priya.sen@example.com', 'author')}
            >
              <UserCheck size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Priya Sen (Author — Rollover Edge Case)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>₹675 pending royalty below ₹1,000 threshold</span>
              </div>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', textAlign: 'left' }}
              onClick={() => quickSwitch('sarah.jenkins@example.com', 'author')}
            >
              <UserCheck size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem' }}>Sarah Jenkins (Author — In Production)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>2 books in Typesetting & Proofreading</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
