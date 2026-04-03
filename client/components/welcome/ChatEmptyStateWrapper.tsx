'use client';

import { useCallback, useRef } from 'react';
import WelcomeState from './WelcomeState';

interface Props {
  messages: { _id: string }[];
  children: React.ReactNode;
  onSelectPrompt: (prompt: string) => void;
}


export default function ChatEmptyStateWrapper({ messages, children, onSelectPrompt }: Props) {
  const hasHadMessages = useRef(messages.length > 0);

  // Once we've seen messages, never go back to welcome state in this session
  if (messages.length > 0) hasHadMessages.current = true;
  const showWelcome = !hasHadMessages.current && messages.length === 0;

  if (showWelcome) {
    return <WelcomeState onSelectPrompt={onSelectPrompt} />;
  }

  return <>{children}</>;
}