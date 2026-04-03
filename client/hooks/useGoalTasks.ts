'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Goal, Task } from '@/types';
import { goalApi, taskApi } from '@/lib/api';

export function useGoalTasks(chatId: string) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const [goalData, taskData] = await Promise.all([
        goalApi.get(chatId),
        taskApi.getAll(chatId),
      ]);
      setGoal(goalData);
      setTasks(taskData ?? []);
    } catch (err) {
      // Silently fail — goal panel is non-critical
      console.error('Goal/task fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Call after each AI message to pick up newly extracted tasks
  const refreshTasks = useCallback(async () => {
    if (!chatId) return;
    try {
      const [goalData, taskData] = await Promise.all([
        goalApi.get(chatId),
        taskApi.getAll(chatId),
      ]);
      setGoal(goalData);
      setTasks(taskData ?? []);
    } catch {
      // silent
    }
  }, [chatId]);

  const toggleTask = useCallback(async (taskId: string, completed: boolean) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId
          ? { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined }
          : t
      )
    );
    try {
      await taskApi.update(taskId, completed);
    } catch (err) {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: !completed, completedAt: undefined } : t))
      );
      setError('Failed to update task');
    }
  }, []);

  const generateNext = useCallback(async () => {
    if (isGeneratingRef.current || !chatId) return;
    isGeneratingRef.current = true;
    setGenerating(true);
    setError(null);
    try {
      const newTasks = await taskApi.generateNext(chatId);
      setTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t._id));
        const fresh = (newTasks ?? []).filter((t: Task) => !existingIds.has(t._id));
        return [...prev, ...fresh];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tasks');
    } finally {
      setGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [chatId]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  return {
    goal, tasks, loading, generating, error,
    toggleTask, generateNext, refreshTasks,
    completedCount, totalCount, allDone,
  };
}