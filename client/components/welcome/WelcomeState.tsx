'use client';

import PromptButton from './PromptButton';
import FeatureHighlight from './FeatureHighlight';

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

const FEATURES = [
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
    ),
    title: 'Goal-based guidance',
    description: 'Share a goal and get a personalized action plan built around your timeline.',
    color: '#00d4ff',
    delay: 80,
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
    title: 'Automatic task extraction',
    description: 'Every response is analyzed to pull out concrete next steps, saved in your sidebar.',
    color: '#a78bfa',
    delay: 130,
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
      </svg>
    ),
    title: 'Conversation memory',
    description: 'Full context is maintained across messages so you never repeat yourself.',
    color: '#34d399',
    delay: 180,
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/>
      </svg>
    ),
    title: 'Smart summaries',
    description: 'Generate a structured summary of any conversation with key points and action items.',
    color: '#fb923c',
    delay: 230,
  },
];

const PROMPTS = [
  {
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
      </svg>
    ),
    label: 'Plan a career transition',
    prompt: 'Help me plan my career transition to product management in 6 months',
    accentColor: '#00d4ff',
  },
  {
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
      </svg>
    ),
    label: 'Break a goal into steps',
    prompt: 'Break my goal of learning machine learning into actionable weekly steps',
    accentColor: '#a78bfa',
  },
  {
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/>
      </svg>
    ),
    label: 'Create a learning roadmap',
    prompt: 'Create a 3-month learning roadmap for becoming a full-stack developer',
    accentColor: '#34d399',
  },
  {
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/>
      </svg>
    ),
    label: 'Summarize a topic',
    prompt: 'Give me a concise summary of how large language models work',
    accentColor: '#fb923c',
  },
];

export default function WelcomeState({ onSelectPrompt }: Props) {
  return (
    <div
      className="welcome-shell flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4 py-4 sm:px-5 sm:py-5"
      style={{ animation: 'welcomeFadeIn 0.25s ease-out both' }}
    >
      <div className="welcome-content w-full" style={{ maxWidth: 920 }}>
        <div className="flex flex-col items-center text-center mb-6" style={{ animation: 'welcomeSlideUp 0.3s ease-out both' }}>
          <div
            className="flex items-center justify-center mb-4 rounded-2xl"
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,102,204,0.08))',
              border: '1px solid rgba(0,212,255,0.25)',
              boxShadow: '0 0 40px rgba(0,212,255,0.12), inset 0 0 20px rgba(0,212,255,0.04)',
              animation: 'logoPulse 3s ease-in-out infinite',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <path d="M6 22 Q6 10 16 10 Q26 10 26 22" stroke="url(#wg)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <circle cx="16" cy="8" r="3.2" fill="url(#wg)"/>
              <path d="M10 22 Q10 27 16 27 Q22 27 22 22" stroke="url(#wg)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.45"/>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d4ff"/>
                  <stop offset="100%" stopColor="#0066cc"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1
            className="font-bold mb-2 tracking-tight"
            style={{
              fontSize: 'clamp(1.95rem, 3vw, 2.45rem)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 40%, rgba(0,212,255,0.75))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em',
            }}
          >
            Welcome to MindChat
          </h1>
          <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-3)' }}>
            An AI assistant that helps you plan goals, break them into tasks, and track your progress - all in one conversation.
          </p>
        </div>

        <div
          className="grid gap-2.5 mb-5"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          }}
        >
          {FEATURES.map((feature) => (
            <FeatureHighlight key={feature.title} {...feature} />
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Quick start</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <div
          className="grid gap-2.5"
          style={{
            animation: 'welcomeSlideUp 0.35s ease-out 100ms both',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          }}
        >
          {PROMPTS.map((prompt) => (
            <PromptButton key={prompt.label} {...prompt} onSelect={onSelectPrompt} />
          ))}
        </div>

        <p
          className="text-center text-xs mt-5"
          style={{ color: 'var(--text-3)', animation: 'welcomeFadeIn 0.4s ease-out 250ms both' }}
        >
          Or type anything below to get started.
        </p>
      </div>

      <style>{`
        .welcome-shell {
          justify-content: flex-start;
        }

        @media (min-height: 900px) {
          .welcome-shell {
            justify-content: center;
          }
        }

        @keyframes welcomeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes welcomeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0,212,255,0.1), inset 0 0 20px rgba(0,212,255,0.04); }
          50% { box-shadow: 0 0 50px rgba(0,212,255,0.22), inset 0 0 20px rgba(0,212,255,0.08); }
        }

        @keyframes featureFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
