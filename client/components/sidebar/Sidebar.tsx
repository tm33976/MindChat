'use client';

import { useRouter } from 'next/navigation';
import { Chat } from '@/types';
import ConversationItem from './ConversationItem';
import { MindChatLogo } from '@/components/layout/ChatLayout';

interface Props {
  chats: Chat[];
  loading: boolean;
  activeChatId?: string;
  onNewChat: () => Promise<Chat | null>;
  onDeleteChat: (id: string) => Promise<boolean>;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ chats, loading, activeChatId, onNewChat, onDeleteChat, isOpen, onClose }: Props) {
  const router = useRouter();

  const handleNewChat = async () => {
    const chat = await onNewChat();
    if (chat) { router.push(`/chat/${chat._id}`); onClose(); }
  };

  const handleDelete = async (id: string) => {
    await onDeleteChat(id);
    if (id === activeChatId) router.push('/chat');
  };

  return (
    <aside style={{
      width: 268, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', borderRight: '1px solid var(--border)',
      height: '100dvh', transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
      position: 'relative', zIndex: 50,
    }} className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

      {/* Brand header */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <MindChatLogo size={30} />
          <div>
            <div style={{
              fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em',
              background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>MindChat</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 1 }}>AI Assistant</div>
          </div>
        </div>

        {/* New chat button */}
        <button onClick={handleNewChat} style={{
          width: '100%', padding: '9px 14px',
          background: 'var(--accent-muted)',
          border: '1px solid var(--accent-border)',
          borderRadius: 10, cursor: 'pointer',
          color: 'var(--accent)', fontSize: '0.8rem',
          fontFamily: 'inherit', fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          transition: 'all 0.18s',
          letterSpacing: '0.01em',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.14)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,212,255,0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-muted)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
          </svg>
          New conversation
        </button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {loading ? (
          <div style={{ padding: '8px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 52, borderRadius: 10, marginBottom: 4,
                background: 'var(--surface-2)',
                backgroundImage: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                opacity: 1 - i * 0.18,
              }}/>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, margin: '0 auto 14px',
              background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"/>
              </svg>
            </div>
            <div style={{ color: 'var(--text-2)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 4 }}>No conversations yet</div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>Start a new one above</div>
          </div>
        ) : (
          <>
            <div style={{ padding: '4px 10px 6px', fontSize: '0.68rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              Recent
            </div>
            {chats.map((chat) => (
              <ConversationItem
                key={chat._id}
                chat={chat}
                isActive={chat._id === activeChatId}
                onDelete={handleDelete}
                onClose={onClose}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff22, #0066cc22)',
          border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', color: 'var(--accent)',
        }}>AI</div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 500 }}>MindChat v1.0</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Powered by Groq · Llama 3.3</div>
        </div>
      </div>
    </aside>
  );
}