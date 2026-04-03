'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Message } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useParams } from 'next/navigation';

interface Props {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  usedFallback: boolean;
  onClearError: () => void;
}


export default function MessageList({ messages, loading, sending, error, usedFallback, onClearError }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const chatId = params?.id as string;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid var(--accent-muted)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
          boxShadow: '0 0 20px rgba(0,212,255,0.2)',
        }}/>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Loading…</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {usedFallback && (
        <div style={{
          padding: '10px 16px', borderRadius: 10,
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
          fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠</span><span>Running in fallback mode — AI service temporarily limited.</span>
        </div>
      )}
      {error && (
        <div style={{
          padding: '10px 16px', borderRadius: 10,
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
          fontSize: '0.8rem', color: '#f87171',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span>⚠ {error}</span>
          <button onClick={onClearError} style={{
            background: 'rgba(248,113,113,0.12)', border: 'none', borderRadius: 6,
            padding: '3px 10px', cursor: 'pointer', color: '#f87171',
            fontSize: '0.75rem', fontFamily: 'inherit',
          }}>Dismiss</button>
        </div>
      )}

      {messages.map((msg) => <MessageBubble key={msg._id} message={msg} />)}
      {sending && <TypingIndicator />}

      {messages.length >= 4 && chatId && !sending && (
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <Link href={`/chat/${chatId}/summary`} prefetch={true} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.75rem', color: 'var(--text-3)',
            textDecoration: 'none', padding: '5px 14px',
            borderRadius: 99, border: '1px solid var(--border)',
            transition: 'all 0.15s', background: 'var(--surface-2)',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent-border)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
            }}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2"/>
            </svg>
            View conversation summary
          </Link>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}