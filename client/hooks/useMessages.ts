'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types';
import { messageApi } from '@/lib/api';

interface UseMessagesOptions {
  chatId: string;
  onTitleUpdate?: (chatId: string, title: string) => void;
  onBumpToTop?: (chatId: string) => void;
}

export function useMessages({ chatId, onTitleUpdate, onBumpToTop }: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const isSendingRef = useRef(false);
  const lastSentRef = useRef<string>('');
  const stopRef = useRef(false); // abort flag
  const optimisticIdRef = useRef<string>('');

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setMessages([]);
    setError(null);
    stopRef.current = false;

    messageApi
      .getAll(chatId)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [chatId]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    const trimmed = content.trim();
    if (!trimmed || isSendingRef.current || trimmed === lastSentRef.current) return false;

    isSendingRef.current = true;
    lastSentRef.current = trimmed;
    stopRef.current = false;
    setSending(true);
    setError(null);
    setUsedFallback(false);

    const optimisticId = `optimistic-${Date.now()}`;
    optimisticIdRef.current = optimisticId;

    const optimisticUserMsg: Message = {
      _id: optimisticId,
      chatId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const result = await messageApi.send(chatId, trimmed);

      // If user stopped, remove optimistic message and don't show AI response
      if (stopRef.current) {
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
        return false;
      }

      setMessages((prev) => [
        ...prev.filter((m) => m._id !== optimisticId),
        result.userMessage,
        result.assistantMessage,
      ]);

      setUsedFallback(result.usedFallback);
      onTitleUpdate?.(chatId, result.chatTitle);
      onBumpToTop?.(chatId);
      return true;
    } catch (err) {
      if (!stopRef.current) {
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
      return false;
    } finally {
      setSending(false);
      isSendingRef.current = false;
      setTimeout(() => { lastSentRef.current = ''; }, 2000);
    }
  }, [chatId, onTitleUpdate, onBumpToTop]);

  // Stop/cancel current generation
  const stopGeneration = useCallback(() => {
    if (!isSendingRef.current) return;
    stopRef.current = true;
    setSending(false);
    isSendingRef.current = false;
    // Remove the optimistic user message that was added
    const optId = optimisticIdRef.current;
    if (optId) {
      setMessages((prev) => prev.filter((m) => m._id !== optId));
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { messages, loading, sending, error, usedFallback, sendMessage, stopGeneration, clearError };
}