'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface ChatInputHandle {
  fill: (text: string, autoSend?: boolean) => void;
}

interface Props {
  onSend: (content: string) => Promise<boolean>;
  onStop?: () => void;
  disabled?: boolean;
  sending?: boolean;
}

const ChatInput = forwardRef<ChatInputHandle, Props>(function ChatInput(
  { onSend, onStop, disabled = false, sending = false },
  ref
) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled && !sending;

  // Expose fill() to parent via ref
  useImperativeHandle(ref, () => ({
    fill: (text: string, autoSend = false) => {
      setValue(text);
      setTimeout(() => {
        textareaRef.current?.focus();
        adjustHeight();
        if (autoSend) {
          // Small delay so state updates first
          setTimeout(() => handleSendRef.current?.(), 50);
        }
      }, 0);
    },
  }));

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  // Keep a stable ref to handleSend for the autoSend path
  const handleSendRef = useRef<(() => void) | null>(null);

  const handleSend = useCallback(async () => {
    const content = value.trim();
    if (!content || disabled || sending) return;
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    await onSend(content);
  }, [value, disabled, sending, onSend]);

  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  useEffect(() => { adjustHeight(); }, [value]);

  return (
    <div style={{
      padding: '14px 20px 18px',
      borderTop: '1px solid var(--border)',
      background: 'linear-gradient(to top, var(--bg) 0%, var(--surface-1) 100%)',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '12px 14px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = 'var(--accent-border)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.06), 0 0 24px rgba(0,212,255,0.08)';
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => { setValue(e.target.value); adjustHeight(); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={sending ? 'MindChat is thinking…' : 'Ask MindChat anything…'}
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            resize: 'none', color: 'var(--text-1)',
            fontSize: '0.9375rem', fontFamily: 'inherit', lineHeight: 1.6,
            padding: 0, minHeight: '1.6em', maxHeight: 180, overflowY: 'auto',
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {/* Stop button */}
        {sending && onStop && (
          <button onClick={onStop} title="Stop generating" style={{
            width: 38, height: 38, borderRadius: 12,
            border: '1.5px solid rgba(248,113,113,0.4)',
            background: 'rgba(248,113,113,0.08)',
            color: '#f87171', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.18s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.18)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.7)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.4)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="2" width="10" height="10" rx="2"/>
            </svg>
          </button>
        )}

        {/* Send button */}
        {!sending && (
          <button onClick={handleSend} disabled={!canSend} title="Send message" style={{
            width: 38, height: 38, borderRadius: 12, border: 'none',
            background: canSend ? 'linear-gradient(135deg, #00d4ff, #0066cc)' : 'var(--surface-3)',
            color: '#fff', cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.18s',
            boxShadow: canSend ? '0 4px 16px rgba(0,212,255,0.3)' : 'none',
          }}
            onMouseEnter={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
            onMouseDown={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
            onMouseUp={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5"/>
            </svg>
          </button>
        )}
      </div>

      <p style={{ margin: '8px 0 0', fontSize: '0.68rem', color: 'var(--text-3)', textAlign: 'center' }}>
        {sending
          ? 'MindChat is generating · Click ■ to stop'
          : 'Press Enter to send · Shift+Enter for new line'}
      </p>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
});

export default ChatInput;