'use client';

import { useState, useEffect } from 'react';
import { useGoalTasks } from '@/hooks/useGoalTasks';
import TaskItem from './TaskItem';

interface Props {
  chatId: string;
  refreshKey?: number;
}

export default function GoalPanel({ chatId, refreshKey }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false); // controls whether panel is shown at all
  const {
    goal, tasks, loading, generating, error,
    toggleTask, generateNext, refreshTasks,
    completedCount, totalCount, allDone,
  } = useGoalTasks(chatId);

  // Refresh when parent bumps refreshKey
  useEffect(() => {
    if (refreshKey && refreshKey > 0) refreshTasks();
  }, [refreshKey, refreshTasks]);

  // Show panel once loading is done and goal exists
  useEffect(() => {
    if (!loading) {
      setVisible(!!goal || tasks.length > 0);
    }
  }, [loading, goal, tasks.length]);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Always render the container so layout doesn't shift, but hide it with zero width when no goal
  const panelWidth = !visible ? 0 : collapsed ? 48 : 300;

  return (
    <aside style={{
      width: panelWidth,
      flexShrink: 0,
      borderLeft: visible ? '1px solid var(--border)' : 'none',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
      position: 'relative',
    }}>

      {visible && (
        <>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              position: 'absolute', top: 14,
              left: collapsed ? 8 : 10,
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l8 8-8 8"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M16 4l-8 8 8 8"/>
              }
            </svg>
          </button>

          {/* Collapsed mini view */}
          {collapsed && (
            <div style={{
              marginTop: 54, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 12, padding: '0 9px',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
              </div>
              {totalCount > 0 && (
                <div style={{
                  fontSize: '0.62rem', fontWeight: 700, color: 'var(--accent)',
                  background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
                  borderRadius: 99, padding: '2px 5px', whiteSpace: 'nowrap',
                }}>
                  {completedCount}/{totalCount}
                </div>
              )}
            </div>
          )}

          {/* Expanded content */}
          {!collapsed && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '52px 13px 20px', minWidth: 0 }}>

              {/* Section label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="11" height="11" fill="none" stroke="var(--accent)" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Goal Tracker
                </span>
              </div>

              {loading ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {/* Goal card */}
                  {goal && (
                    <div style={{
                      padding: '11px 13px', borderRadius: 12, marginBottom: 13,
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.07), rgba(0,102,204,0.04))',
                      border: '1px solid var(--accent-border)',
                    }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Your Goal
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-1)', lineHeight: 1.5, fontWeight: 500 }}>
                        {goal.goal}
                      </div>
                      {goal.timeline && goal.timeline !== 'No specific timeline' && (
                        <div style={{
                          marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.68rem', color: 'var(--text-3)',
                          background: 'var(--surface-3)', padding: '2px 8px', borderRadius: 99,
                        }}>
                          <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                          </svg>
                          {goal.timeline}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  {totalCount > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-3)', fontWeight: 500 }}>Progress</span>
                        <span style={{ fontSize: '0.66rem', color: progressPct === 100 ? 'var(--accent)' : 'var(--text-2)', fontWeight: 600 }}>
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${progressPct}%`,
                          background: 'linear-gradient(90deg, #00d4ff, #0066cc)',
                          transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
                          boxShadow: progressPct > 0 ? '0 0 8px rgba(0,212,255,0.4)' : 'none',
                        }}/>
                      </div>
                    </div>
                  )}

                  {/* Pending tasks */}
                  {pendingTasks.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Next steps
                      </div>
                      {pendingTasks.map((task) => (
                        <TaskItem key={task._id} task={task} onToggle={toggleTask} />
                      ))}
                    </div>
                  )}

                  {/* Completed tasks */}
                  {doneTasks.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Completed
                      </div>
                      {doneTasks.map((task) => (
                        <TaskItem key={task._id} task={task} onToggle={toggleTask} />
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {tasks.length === 0 && goal && (
                    <div style={{ textAlign: 'center', padding: '18px 6px' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: 7, color: 'var(--accent)', opacity: 0.5 }}>✦</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                        Tasks appear as you chat about your goal
                      </div>
                    </div>
                  )}

                  {error && (
                    <div style={{
                      padding: '7px 10px', borderRadius: 8, marginBottom: 8,
                      background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)',
                      fontSize: '0.72rem', color: '#f87171',
                    }}>{error}</div>
                  )}

                  {/* Generate next button */}
                  {goal && tasks.length > 0 && (
                    <button
                      onClick={generateNext}
                      disabled={generating}
                      style={{
                        width: '100%', padding: '8px 12px', marginTop: 4,
                        background: generating ? 'var(--surface-3)' : 'var(--accent-muted)',
                        border: `1px solid ${generating ? 'var(--border)' : 'var(--accent-border)'}`,
                        borderRadius: 10, cursor: generating ? 'not-allowed' : 'pointer',
                        color: generating ? 'var(--text-3)' : 'var(--accent)',
                        fontSize: '0.76rem', fontFamily: 'inherit', fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { if (!generating) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.14)'; }}
                      onMouseLeave={e => { if (!generating) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-muted)'; }}
                    >
                      {generating ? (
                        <><Spinner />{' '}Generating…</>
                      ) : (
                        <>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/>
                          </svg>
                          {allDone ? 'Generate next steps' : 'Get more tasks'}
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 11, height: 11, borderRadius: '50%',
      border: '1.5px solid var(--text-3)',
      borderTopColor: 'var(--accent)',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {[85, 55, 95, 65, 80].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 60 : 24, borderRadius: 8, width: `${w}%`,
          background: 'var(--surface-2)',
          backgroundImage: 'linear-gradient(90deg,var(--surface-2) 25%,var(--surface-3) 50%,var(--surface-2) 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
        }}/>
      ))}
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
}