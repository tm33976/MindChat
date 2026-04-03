'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { useChats } from '@/hooks/useChats';

interface Props {
  children: React.ReactNode;
  activeChatId?: string;
}

export default function ChatLayout({ children, activeChatId }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chats, loading, createChat, deleteChat, updateChatTitle, bumpChatToTop } = useChats();

  return (
    <div style={{
      display: 'flex', height: '100dvh', overflow: 'hidden',
      background: 'var(--bg)', position: 'relative', zIndex: 1,
    }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 40, backdropFilter: 'blur(4px)',
        }} className="mobile-overlay" />
      )}

      <Sidebar
        chats={chats}
        loading={loading}
        activeChatId={activeChatId}
        onNewChat={createChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, overflow: 'hidden',
        background: 'var(--surface-1)',
      }}>
        <div style={{ display: 'none', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
          background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(12px)',
        }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{
            background: 'none', border: 'none', color: 'var(--text-2)',
            cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
          <MindChatLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: '1rem', background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MindChat</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0, overflow: 'hidden' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
          .mobile-header { display: flex !important; }
          .sidebar { position: fixed !important; top: 0; left: 0; bottom: 0; transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export function MindChatLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="mindgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#0066cc"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#mindgrad)" opacity="0.12"/>
      <rect width="32" height="32" rx="9" fill="none" stroke="url(#mindgrad)" strokeWidth="1"/>
      <path d="M8 20 Q8 12 16 12 Q24 12 24 20" stroke="url(#mindgrad)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="16" cy="10" r="2.5" fill="url(#mindgrad)"/>
      <path d="M12 20 Q12 24 16 24 Q20 24 20 20" stroke="url(#mindgrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  );
}