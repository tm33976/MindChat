'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chat } from '@/types';
import { chatApi } from '@/lib/api';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      setError(null);
      const data = await chatApi.getAll();
      setChats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = useCallback(async (title?: string): Promise<Chat | null> => {
    try {
      const chat = await chatApi.create(title);
      setChats((prev) => [chat, ...prev]);
      return chat;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
      return null;
    }
  }, []);

  const deleteChat = useCallback(async (id: string): Promise<boolean> => {
    // Optimistic update
    setChats((prev) => prev.filter((c) => c._id !== id));
    try {
      await chatApi.delete(id);
      return true;
    } catch (err) {
      // Rollback on failure
      await fetchChats();
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
      return false;
    }
  }, [fetchChats]);

  const updateChatTitle = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const bumpChatToTop = useCallback((id: string) => {
    setChats((prev) => {
      const chat = prev.find((c) => c._id === id);
      if (!chat) return prev;
      return [{ ...chat, updatedAt: new Date().toISOString() }, ...prev.filter((c) => c._id !== id)];
    });
  }, []);

  return { chats, loading, error, createChat, deleteChat, updateChatTitle, bumpChatToTop, refetch: fetchChats };
}
