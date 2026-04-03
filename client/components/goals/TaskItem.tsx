'use client';

import { useState } from 'react';
import { Task } from '@/types';

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
}

export default function TaskItem({ task, onToggle }: Props) {
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    if (pending) return;
    setPending(true);
    await onToggle(task._id, !task.completed);
    setPending(false);
  };

  return (
    <div
      onClick={handleToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        cursor: pending ? 'wait' : 'pointer',
        background: task.completed ? 'rgba(0,212,255,0.04)' : 'transparent',
        border: `1px solid ${task.completed ? 'rgba(0,212,255,0.12)' : 'var(--border)'}`,
        marginBottom: 5,
        transition: 'all 0.18s',
        opacity: pending ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!task.completed) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-3)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = task.completed ? 'rgba(0,212,255,0.04)' : 'transparent';
      }}
    >
      {/* Custom checkbox */}
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: `1.5px solid ${task.completed ? 'var(--accent)' : 'var(--surface-4)'}`,
        background: task.completed ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
        boxShadow: task.completed ? '0 0 8px rgba(0,212,255,0.3)' : 'none',
      }}>
        {task.completed && (
          <svg width="10" height="10" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6l3 3 5.5-5.5"/>
          </svg>
        )}
        {pending && !task.completed && (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            border: '1.5px solid var(--accent)',
            borderTopColor: 'transparent',
            animation: 'spin 0.6s linear infinite',
          }}/>
        )}
      </div>

      <span style={{
        fontSize: '0.8125rem',
        color: task.completed ? 'var(--text-3)' : 'var(--text-2)',
        lineHeight: 1.5,
        textDecoration: task.completed ? 'line-through' : 'none',
        transition: 'all 0.18s',
        flex: 1,
      }}>
        {task.text}
      </span>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}