'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/types';
import { formatMessageTime } from '@/lib/utils';

export default function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 12, alignItems: 'flex-start',
      animation: 'fadeUp 0.24s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: isUser ? '50%' : 10, flexShrink: 0, marginTop: 2,
        background: isUser
          ? 'linear-gradient(135deg, #243047, #1a2235)'
          : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,204,0.1))',
        border: `1px solid ${isUser ? 'var(--border)' : 'var(--accent-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isUser ? 'none' : '0 0 16px rgba(0,212,255,0.12)',
      }}>
        {isUser ? (
          <svg width="15" height="15" fill="none" stroke="var(--text-2)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <path d="M8 20 Q8 12 16 12 Q24 12 24 20" stroke="url(#bg2)" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <circle cx="16" cy="10" r="2.5" fill="url(#bg2)"/>
            <defs>
              <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00d4ff"/><stop offset="100%" stopColor="#0066cc"/>
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '76%', minWidth: 0 }}>
        <div style={{
          padding: isUser ? '11px 16px' : '14px 18px',
          borderRadius: isUser ? '20px 20px 6px 20px' : '6px 20px 20px 20px',
          background: isUser
            ? 'linear-gradient(135deg, #00a8cc, #0055bb)'
            : 'var(--surface-2)',
          border: `1px solid ${isUser ? 'transparent' : 'var(--border)'}`,
          color: '#fff',
          fontSize: '0.9375rem',
          lineHeight: 1.65,
          wordBreak: 'break-word',
          boxShadow: isUser
            ? '0 4px 24px rgba(0,168,204,0.25)'
            : '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#fff' }}>{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? '');
                    const inline = !match;
                    return !inline ? (
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 14px', background: 'rgba(0,0,0,0.4)',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '0.7rem', color: 'var(--accent)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          <span>{match[1]}</span>
                          <CopyCodeButton code={String(children)} />
                        </div>
                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                          customStyle={{ margin: 0, padding: '14px 16px', background: 'transparent', fontSize: '0.82rem' }}
                          {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  },
                }}
              >{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 5,
          justifyContent: isUser ? 'flex-end' : 'flex-start',
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>
            {formatMessageTime(message.timestamp)}
          </span>
          {!isUser && (
            <button onClick={handleCopy} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: copied ? 'var(--accent)' : 'var(--text-3)',
              padding: '2px 6px', borderRadius: 5,
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.68rem', fontFamily: 'inherit', transition: 'color 0.15s',
            }}>
              {copied ? (
                <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>Copied</>
              ) : (
                <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handleCopy} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? 'var(--accent)' : 'var(--text-3)',
      padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontFamily: 'inherit', transition: 'color 0.15s',
    }}>{copied ? 'Copied!' : 'Copy'}</button>
  );
}