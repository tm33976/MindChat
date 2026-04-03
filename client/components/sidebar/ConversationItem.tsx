'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Chat } from '@/types';
import { truncate, formatSidebarDate } from '@/lib/utils';

interface Props {
  chat: Chat;
  isActive: boolean;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function ConversationItem({ chat, isActive, onDelete, onClose }: Props) {
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    await onDelete(chat._id);
  };

  return (
    <Link
      href={`/chat/${chat._id}`}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 10px', borderRadius: 10, marginBottom: 2,
        background: isActive
          ? 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,102,204,0.08))'
          : hovered ? 'var(--surface-2)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
        cursor: 'pointer', textDecoration: 'none', color: 'inherit',
        transition: 'all 0.15s', gap: 8,
        boxShadow: isActive ? '0 0 12px rgba(0,212,255,0.08)' : 'none',
      }}
    >
      {/* Chat icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: isActive ? 'rgba(0,212,255,0.12)' : 'var(--surface-3)',
        border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="12" height="12" fill="none" stroke={isActive ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: isActive ? 500 : 400,
          color: isActive ? 'var(--accent)' : 'var(--text-1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          lineHeight: 1.4,
        }}>
          {truncate(chat.title, 30)}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2 }}>
          {formatSidebarDate(chat.updatedAt)}
        </div>
      </div>

      {(hovered || isActive) && (
        <button onClick={handleDelete} disabled={deleting}
          style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: deleting ? 'not-allowed' : 'pointer',
            padding: '3px', borderRadius: 5, display: 'flex', alignItems: 'center',
            flexShrink: 0, transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      )}
    </Link>
  );
}