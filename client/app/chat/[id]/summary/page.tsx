'use client';

import ChatLayout from '@/components/layout/ChatLayout';
import SummaryView from '@/components/summary/SummaryView';

interface Props {
  params: { id: string };
}

export default function SummaryPage({ params }: Props) {
  const chatId = params.id;
  return (
    <ChatLayout activeChatId={chatId}>
      <SummaryView chatId={chatId} />
    </ChatLayout>
  );
}