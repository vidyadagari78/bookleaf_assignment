import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BookOpen, 
  DollarSign, 
  Printer, 
  Globe, 
  Layers, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  ChevronRight
} from 'lucide-react';

export function KnowledgeBaseExplorer() {
  const [kb, setKb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('royalty_policy');

  useEffect(() => {
    api.getKnowledgeBase()
      .then(res => setKb(res.knowledge_base))
      .catch(err => console.error('Failed to load KB:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !kb) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading active BookLeaf Knowledge Base...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
          BookLeaf Knowledge Base & Tone Guidelines
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Author operations policies and prompt context injected into the AI-assisted response engine.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Navigation Sidebar */}
        <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button 
            className={`tab-btn ${activeSection === 'royalty_policy' ? 'active' : ''}`}
            onClick={() => setActiveSection('royalty_policy')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <DollarSign size={16} />
            <span>Royalty & Payments Policy</span>
          </button>

          <button 
            className={`tab-btn ${activeSection === 'isbn_policy' ? 'active' : ''}`}
            onClick={() => setActiveSection('isbn_policy')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <ShieldCheck size={16} />
            <span>ISBN & Metadata Policy</span>
          </button>

          <button 
            className={`tab-btn ${activeSection === 'printing_and_quality' ? 'active' : ''}`}
            onClick={() => setActiveSection('printing_and_quality')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Printer size={16} />
            <span>Printing & Quality SLAs</span>
          </button>

          <button 
            className={`tab-btn ${activeSection === 'distribution_and_availability' ? 'active' : ''}`}
            onClick={() => setActiveSection('distribution_and_availability')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Globe size={16} />
            <span>Distribution & Retail Channels</span>
          </button>

          <button 
            className={`tab-btn ${activeSection === 'production_stages' ? 'active' : ''}`}
            onClick={() => setActiveSection('production_stages')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Layers size={16} />
            <span>Production Stages (9 Milestones)</span>
          </button>

          <button 
            className={`tab-btn ${activeSection === 'communication_tone_guidelines' ? 'active' : ''}`}
            onClick={() => setActiveSection('communication_tone_guidelines')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <MessageCircle size={16} />
            <span>Communication Tone Guidelines</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          {activeSection === 'royalty_policy' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <DollarSign size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Royalty & Net Profit Policy
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#ffffff' }}>Royalty Split:</strong> {kb.royalty_policy.split_percentage}
                  <br />
                  <strong style={{ color: '#ffffff' }}>Net Profit Formula:</strong> <code>{kb.royalty_policy.net_profit_formula}</code>
                </div>

                <div>
                  <strong style={{ color: '#ffffff' }}>Disbursement Frequency:</strong> {kb.royalty_policy.payout_frequency}
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <strong style={{ color: '#fbbf24' }}>Minimum Threshold & Rollover:</strong>
                  <p style={{ marginTop: '0.2rem' }}>{kb.royalty_policy.threshold_rule}</p>
                </div>

                <div>
                  <strong style={{ color: '#ffffff' }}>Quarterly Payout Cycles:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {kb.royalty_policy.quarterly_cycles?.map(q => (
                      <div key={q.quarter} style={{ background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                        <strong style={{ color: '#38bdf8' }}>{q.quarter}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Disburses by: {q.payout_deadline}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'isbn_policy' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldCheck size={22} style={{ color: '#ef4444' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  ISBN & Bibliographic Metadata Policy
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                <p><strong>Assignment:</strong> {kb.isbn_policy.assignment}</p>
                <p><strong>Author Custom Imprint:</strong> {kb.isbn_policy.custom_imprint}</p>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#fca5a5' }}>
                  <strong>Critical Escalation Rule:</strong> {kb.isbn_policy.isbn_errors}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'printing_and_quality' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Printer size={22} style={{ color: '#f59e0b' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Printing Capacity & Quality Guarantee
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                <p><strong>Facilities:</strong> {kb.printing_and_quality.production_capacity}</p>
                <p><strong>Standard Turnaround:</strong> {kb.printing_and_quality.standard_turnaround}</p>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', color: '#a7f3d0' }}>
                  <strong>100% Free Reprint Policy:</strong> {kb.printing_and_quality.quality_guarantee}
                </div>
                <p><strong>Verification:</strong> {kb.printing_and_quality.verification_process}</p>
              </div>
            </div>
          )}

          {activeSection === 'distribution_and_availability' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Globe size={22} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Distribution Channels & Stock Sync
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                <div>
                  <strong>Retail Channels:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {kb.distribution_and_availability.retail_channels?.map(ch => (
                      <span key={ch} className="badge badge-category">{ch}</span>
                    ))}
                  </div>
                </div>
                <p><strong>Listing Go-Live Window:</strong> {kb.distribution_and_availability.go_live_turnaround}</p>
                <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#38bdf8' }}>Stock Sync Desync Resolution:</strong>
                  <p style={{ marginTop: '0.3rem' }}>{kb.distribution_and_availability.stock_sync_issues}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'production_stages' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Layers size={22} style={{ color: '#818cf8' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  The 9 Production Milestones
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {kb.production_stages?.map((stg) => (
                  <div key={stg.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--secondary-light)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {stg.order}
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{stg.name}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{stg.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'communication_tone_guidelines' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <MessageCircle size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                  BookLeaf Communication Tone Guidelines
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {kb.communication_tone_guidelines?.core_principles?.map((principle, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
