'use client';

import ChatLayout from '@/components/layout/ChatLayout';
import { MindChatLogo } from '@/components/layout/ChatLayout';
import { useRouter } from 'next/navigation';
import { useChats } from '@/hooks/useChats';

export default function ChatPage() {
  const router = useRouter();
  const { createChat } = useChats();

  const handleNewChat = async () => {
    const chat = await createChat();
    if (chat) router.push(`/chat/${chat._id}`);
  };

  return (
    <ChatLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{
          width: 88, height: 88, borderRadius: 24, marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,102,204,0.08))',
          border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 50px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05)',
          animation: 'glowPulse 3s ease-in-out infinite',
        }}>
          <MindChatLogo size={44} />
        </div>

        <h1 style={{
          margin: '0 0 10px', fontSize: '2rem', fontWeight: 700,
          letterSpacing: '-0.03em', textAlign: 'center',
          background: 'linear-gradient(135deg, #fff 40%, rgba(0,212,255,0.8))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Welcome to MindChat
        </h1>
        <p style={{ margin: '0 0 32px', color: 'var(--text-3)', fontSize: '0.9375rem', textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
          Your intelligent AI assistant. Start a conversation or select one from the sidebar.
        </p>

        <button onClick={handleNewChat} style={{
          padding: '12px 28px',
          background: 'linear-gradient(135deg, #00d4ff, #0066cc)',
          border: 'none', borderRadius: 12, cursor: 'pointer',
          color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 24px rgba(0,212,255,0.3)',
          transition: 'all 0.2s', letterSpacing: '0.01em',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,212,255,0.4)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,212,255,0.3)';
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
          </svg>
          Start New Conversation
        </button>

        <style>{`@keyframes glowPulse{0%,100%{box-shadow:0 0 30px rgba(0,212,255,0.1)}50%{box-shadow:0 0 50px rgba(0,212,255,0.25)}}`}</style>
      </div>
    </ChatLayout>
  );
}