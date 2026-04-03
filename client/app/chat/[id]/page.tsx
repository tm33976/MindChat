'use client';

import { useState, useCallback, useRef } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import MessageList from '@/components/chat/MessageList';
import ChatInput, { ChatInputHandle } from '@/components/chat/ChatInput';
import GoalPanel from '@/components/goals/GoalPanel';
import ChatEmptyStateWrapper from '@/components/welcome/ChatEmptyStateWrapper';
import { useMessages } from '@/hooks/useMessages';
import { useChats } from '@/hooks/useChats';

interface Props {
  params: { id: string };
}

export default function ChatIdPage({ params }: Props) {
  const chatId = params.id;
  const { updateChatTitle, bumpChatToTop } = useChats();
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  const inputRef = useRef<ChatInputHandle>(null);

  const handleMessageSent = useCallback(() => {
    setTimeout(() => setTaskRefreshKey((k) => k + 1), 1500);
  }, []);

  const { messages, loading, sending, error, usedFallback, sendMessage, stopGeneration, clearError } =
    useMessages({ chatId, onTitleUpdate: updateChatTitle, onBumpToTop: bumpChatToTop });

  const handleSend = useCallback(async (content: string) => {
    const ok = await sendMessage(content);
    if (ok) handleMessageSent();
    return ok;
  }, [sendMessage, handleMessageSent]);

  // When user clicks a prompt chip: fill input, optionally auto-send
  const handleSelectPrompt = useCallback((prompt: string) => {
    inputRef.current?.fill(prompt, false); // fill only — user confirms with Enter
  }, []);

  return (
    <ChatLayout activeChatId={chatId}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', width: '100%' }}>
        {/* Chat column */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

          {/* Smart empty state wrapper */}
          <ChatEmptyStateWrapper
            messages={messages}
            onSelectPrompt={handleSelectPrompt}
          >
            <MessageList
              messages={messages}
              loading={loading}
              sending={sending}
              error={error}
              usedFallback={usedFallback}
              onClearError={clearError}
            />
          </ChatEmptyStateWrapper>

          <ChatInput
            ref={inputRef}
            onSend={handleSend}
            onStop={stopGeneration}
            disabled={loading}
            sending={sending}
          />
        </div>

        <GoalPanel chatId={chatId} refreshKey={taskRefreshKey} />
      </div>
    </ChatLayout>
  );
}