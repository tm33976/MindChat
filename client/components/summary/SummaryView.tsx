'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { summaryApi } from '@/lib/api';
import { SummaryData } from '@/types';

// Normalize any array — LLM sometimes returns objects instead of strings
function toStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'object' && item !== null) {
      // handles {topic: "...", assistant: "..."} or {point: "..."} etc.
      return Object.values(item as Record<string, unknown>)
        .filter((v) => typeof v === 'string')
        .join(' — ')
        .trim();
    }
    return String(item ?? '').trim();
  }).filter(Boolean);
}

function normalizeSummary(raw: Record<string, unknown>): SummaryData {
  return {
    overview: typeof raw.overview === 'string' ? raw.overview : String(raw.overview ?? 'No overview available'),
    keyPoints: toStringArray(raw.keyPoints),
    topicsDiscussed: toStringArray(raw.topicsDiscussed),
    actionItems: toStringArray(raw.actionItems),
  };
}

export default function SummaryView({ chatId }: { chatId: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await summaryApi.generate(chatId);
      const raw = JSON.parse(result.summary);
      setSummary(normalizeSummary(raw));
      setMessageCount(result.messageCount);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      setStatus('error');
    }
  }, [chatId]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px', maxWidth: 740, margin: '0 auto', width: '100%' }}>

      <div style={{ marginBottom: 24 }}>
        <Link href={`/chat/${chatId}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.8rem', color: 'var(--text-3)', textDecoration: 'none',
          marginBottom: 20, padding: '5px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--surface-2)',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)'}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Back to chat
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{
              margin: '0 0 5px', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #fff 50%, rgba(0,212,255,0.8))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Conversation Summary</h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-3)' }}>
              {status === 'loading' ? 'Analyzing your conversation…' : `Analyzed ${messageCount} messages`}
            </p>
          </div>
          {status === 'success' && (
            <button onClick={fetchSummary} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
              borderRadius: 10, padding: '8px 16px',
              color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
              Regenerate
            </button>
          )}
        </div>
      </div>

      {status === 'loading' && <SummarySkeleton />}

      {status === 'error' && (
        <div style={{
          padding: '28px', background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.2)', borderRadius: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠</div>
          <p style={{ margin: '0 0 18px', color: '#f87171', fontSize: '0.9rem' }}>{error}</p>
          <button onClick={fetchSummary} style={{
            background: 'var(--surface-3)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '9px 22px', cursor: 'pointer',
            color: 'var(--text-1)', fontSize: '0.875rem', fontFamily: 'inherit',
          }}>Try again</button>
        </div>
      )}

      {status === 'success' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.3s ease-out' }}>
          <SummaryCard title="Overview" icon="◎" accent>
            <p style={{ margin: 0, color: 'var(--text-1)', lineHeight: 1.75, fontSize: '0.9375rem' }}>
              {summary.overview}
            </p>
          </SummaryCard>

          {summary.keyPoints.length > 0 && (
            <SummaryCard title="Key points" icon="◆">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.keyPoints.map((pt, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
                      background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)',
                    }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-1)', fontSize: '0.9rem', lineHeight: 1.65 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </SummaryCard>
          )}

          {summary.topicsDiscussed.length > 0 && (
            <SummaryCard title="Topics discussed" icon="◉">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {summary.topicsDiscussed.map((topic, i) => (
                  <span key={i} style={{
                    padding: '5px 14px', borderRadius: 99,
                    background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
                    fontSize: '0.8rem', color: 'var(--accent)',
                  }}>{topic}</span>
                ))}
              </div>
            </SummaryCard>
          )}

          {summary.actionItems.length > 0 && (
            <SummaryCard title="Action items" icon="✓">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.actionItems.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--text-1)', fontSize: '0.9rem', lineHeight: 1.65 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </SummaryCard>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      `}</style>
    </div>
  );
}

function SummarySkeleton() {
  const shimmer: React.CSSProperties = {
    backgroundImage: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s ease-in-out infinite',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Overview skeleton */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--accent-border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-3)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--surface-4)', ...shimmer }}/>
          <div style={{ width: 80, height: 13, borderRadius: 6, background: 'var(--surface-4)', ...shimmer }}/>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[100, 92, 78].map((w, i) => (
            <div key={i} style={{ height: 14, borderRadius: 6, width: `${w}%`, background: 'var(--surface-3)', ...shimmer }}/>
          ))}
        </div>
      </div>

      {/* Key points skeleton */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-3)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--surface-4)', ...shimmer }}/>
          <div style={{ width: 100, height: 13, borderRadius: 6, background: 'var(--surface-4)', ...shimmer }}/>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[95, 80, 88].map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: 'var(--surface-3)', ...shimmer }}/>
              <div style={{ height: 14, borderRadius: 6, width: `${w}%`, background: 'var(--surface-3)', ...shimmer }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Topics skeleton */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-3)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--surface-4)', ...shimmer }}/>
          <div style={{ width: 130, height: 13, borderRadius: 6, background: 'var(--surface-4)', ...shimmer }}/>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[70, 90, 60, 80, 55].map((w, i) => (
            <div key={i} style={{ height: 28, width: w, borderRadius: 99, background: 'var(--surface-3)', ...shimmer }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, icon, children, accent }: {
  title: string; icon: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: accent ? '0 0 20px rgba(0,212,255,0.06)' : 'none',
    }}>
      <div style={{
        padding: '12px 18px',
        borderBottom: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', gap: 8,
        background: accent ? 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,102,204,0.04))' : 'var(--surface-3)',
      }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>{title}</span>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}