import OpenAI from 'openai';
import { IMessage } from '../models/Message';

// Model chain
const MODEL_CHAIN = [
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'llama-3.3-70b-versatile',
];

const MAX_CONTEXT_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 4000;

// Our System prompt 
const SYSTEM_PROMPT = `You are MindChat, a sharp and genuinely helpful AI assistant created by Tushar Mishra.

Identity (NEVER break these):
- If asked who created/built you: "I was built by Tushar Mishra."
- If asked what you are: "I'm MindChat, an AI assistant built by Tushar Mishra."
- Never claim to be ChatGPT, Claude, Gemini, or any other AI

Personality:
- Talk like a knowledgeable friend, not a corporate bot
- Skip filler: "Certainly!", "Great question!", "As an AI language model"
- Be direct and confident. Match the user's tone
- For code: write clean, working code with brief inline comments
- Keep responses concise unless depth is genuinely needed

Never do:
- Start with "Certainly!", "Of course!", "Absolutely!", "Sure!"
- Say "I hope this helps" or "Let me know if you need anything"
- Output raw function syntax like Function=web_search>{...}`;

interface CacheEntry {
  result: string;
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCached(query: string): string | null {
  const key = getCacheKey(query);
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(query: string, result: string): void {
  const key = getCacheKey(query);
  // Keep cache bounded — evict oldest if over 50 entries
  if (searchCache.size >= 50) {
    const oldest = [...searchCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) searchCache.delete(oldest[0]);
  }
  searchCache.set(key, { result, timestamp: Date.now() });
}

// Search rate limiter — max 1 search per 4 seconds
let lastSearchAt = 0;
const SEARCH_MIN_INTERVAL_MS = 4000;

function canSearch(): boolean {
  return Date.now() - lastSearchAt >= SEARCH_MIN_INTERVAL_MS;
}

function markSearchUsed(): void {
  lastSearchAt = Date.now();
}


const MUST_SEARCH_PATTERNS = [
  // Current role/position questions
  /\bwho is (the )?(current |now )?(ceo|cto|coo|cmo|cfo|founder|president|prime minister|minister|director|head|chief|chairman)\b/i,
  // Specific price/value lookups
  /\b(price|cost|rate|stock price|share price|value) of\b/i,
  // Weather
  /\b(weather|temperature|forecast)\b.*\b(today|now|tomorrow|this week)\b/i,
  /\bweather in\b/i,
  // Current events with strong recency signal
  /\b(today|right now|this (week|month|year)|2025|2026)\b.*\b(news|update|result|score|winner)\b/i,
  // Specific company/product info where training might be stale
  /\bwhat does (the company |)\w+\s?\w+ do\b/i,
  /\b(latest|newest|recent) (version|update|release) of\b/i,
];

const NEVER_SEARCH_PATTERNS = [
  /\b(explain|how does|what does|what is a|difference between|compare|vs\.?|example|tutorial|learn|understand)\b/i,
  /\b(help me|can you|could you|write|create|generate|make|build|code|program|script|essay|email)\b/i,
  /\b(summarize|analyze|review|feedback|improve|fix|debug|optimize)\b/i,
  /\b(what are|list|give me|show me)\b.*\b(tips|steps|ways|ideas|examples|methods)\b/i,
  /\b(i want to|i need to|i am|i'm|my goal|help me)\b/i,
];

function shouldSearch(message: string): boolean {
  const msg = message.trim();

  // Too short to need search
  if (msg.length < 10) return false;

  // Explicitly skip search for these
  if (NEVER_SEARCH_PATTERNS.some(r => r.test(msg))) return false;

  // Must match a strong search pattern
  return MUST_SEARCH_PATTERNS.some(r => r.test(msg));
}

// Web search — Tavily preferred, DuckDuckGo fallback 
interface TavilyResponse {
  answer?: string;
  results?: { title: string; content?: string }[];
}

interface DuckDuckGoResponse {
  AbstractText?: string;
  Answer?: string;
  RelatedTopics?: { Text?: string }[];
}

async function performWebSearch(query: string): Promise<string> {
  // 1. Check cache first — no network call needed
  const cached = getCached(query);
  if (cached) {
    console.log(`Search cache hit: "${query.slice(0, 50)}"`);
    return cached;
  }

  // 2. Rate limit check — don't hammer the search API
  if (!canSearch()) {
    console.log(`Search rate limited — answering from training knowledge`);
    return ''; // Empty = no context injected, LLM answers from training
  }

  markSearchUsed();
  console.log(`Web search: "${query.slice(0, 60)}"`);

  // 3. Try Tavily (best quality, free tier: 1000/month)
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          search_depth: 'basic',
          max_results: 3,
          include_answer: true,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) throw new Error(`Tavily ${res.status}`);
      const data = await res.json() as TavilyResponse;

      const parts: string[] = [];
      if (data.answer) parts.push(data.answer);
      if (data.results?.length) {
        parts.push(
          data.results
            .slice(0, 3)
            .map((r) => `${r.title}: ${(r.content ?? '').slice(0, 200)}`)
            .join('\n')
        );
      }

      const result = parts.join('\n\n').trim();
      if (result) {
        setCache(query, result);
        return result;
      }
    } catch (err) {
      console.warn('Tavily failed:', (err as Error).message);
    }
  }

  // 4. DuckDuckGo instant answers (no key, no rate limit, but limited coverage)
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as DuckDuckGoResponse;

    const parts: string[] = [];
    if (data.AbstractText) parts.push(data.AbstractText);
    if (data.Answer) parts.push(data.Answer);
    if (data.RelatedTopics?.length) {
      const topics = data.RelatedTopics
        .slice(0, 2)
        .filter((t: any) => t.Text)
        .map((t: any) => t.Text);
      if (topics.length) parts.push(topics.join('\n'));
    }

    const result = parts.join('\n').trim();
    if (result) {
      setCache(query, result);
      return result;
    }
  } catch (err) {
    console.warn('DuckDuckGo failed:', (err as Error).message);
  }

  return ''; // Search failed entirely — LLM answers from training, no crash
}

// Groq client
let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');
    client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
  }
  return client;
}

function isRateLimitError(err: Error): boolean {
  return err.message.includes('429') || err.message.toLowerCase().includes('rate limit');
}

async function withModelFallback<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastError: Error = new Error('All models exhausted');
  for (const model of MODEL_CHAIN) {
    try {
      return await fn(model);
    } catch (err) {
      const error = err as Error;
      if (isRateLimitError(error)) {
        console.warn(`Rate limit on ${model}, trying next...`);
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function buildMessages(
  history: IMessage[],
  userMessage: string,
  searchContext?: string
): OpenAI.ChatCompletionMessageParam[] {
  const systemContent = searchContext
    ? `${SYSTEM_PROMPT}\n\n[LIVE WEB DATA — use naturally, don't say "according to search results"]:\n${searchContext}`
    : SYSTEM_PROMPT;

  return [
    { role: 'system', content: systemContent },
    ...history.slice(-MAX_CONTEXT_MESSAGES).map((m): OpenAI.ChatCompletionMessageParam => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, MAX_CHARS_PER_MESSAGE),
    })),
    { role: 'user', content: userMessage.slice(0, MAX_CHARS_PER_MESSAGE) },
  ];
}

//  Mock fallback
const MOCK_RESPONSES = [
  "I'm rate-limited right now. Give it 60 seconds and try again.",
  "Hit the rate limit — the free tier resets per minute. Try again shortly.",
];
let mockIdx = 0;
function getMockResponse(): string {
  return MOCK_RESPONSES[mockIdx++ % MOCK_RESPONSES.length];
}

export async function sendMessageToGemini(options: {
  userMessage: string;
  history: IMessage[];
}): Promise<{ content: string; usedFallback: boolean; searchUsed: boolean }> {
  const { userMessage, history } = options;

  // Search decision — conservative, cached, rate-limited
  let searchContext: string | undefined;
  let searchUsed = false;

  if (shouldSearch(userMessage)) {
    const result = await performWebSearch(userMessage);
    if (result) {
      searchContext = result;
      searchUsed = true;
    }
  
  }

  try {
    const content = await withModelFallback(async (model) => {
      const res = await getClient().chat.completions.create({
        model,
        messages: buildMessages(history, userMessage, searchContext),
        max_tokens: 1024,
        temperature: 0.72,
      });

      const text = res.choices[0]?.message?.content;
      if (!text) throw new Error('Empty response');

      return text
        .replace(/Function=\w+>\{[^}]*\}/g, '')
        .replace(/\[TOOL_CALL:[^\]]*\]/g, '')
        .trim();
    });

    return { content, usedFallback: false, searchUsed };
  } catch (err) {
    console.error('LLM error:', (err as Error).message);
    return { content: getMockResponse(), usedFallback: true, searchUsed };
  }
}

// Summary
export async function generateSummaryFromGemini(messages: IMessage[]): Promise<{
  summary: string;
  usedFallback: boolean;
}> {
  if (messages.length === 0) {
    return {
      summary: JSON.stringify({ overview: 'No messages yet.', keyPoints: [], topicsDiscussed: [], actionItems: [] }),
      usedFallback: false,
    };
  }

  const transcript = messages
    .slice(-30)
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 600)}`)
    .join('\n\n');

  const prompt = `Analyze this conversation. Reply ONLY with valid JSON — no markdown, no extra fields.
ALL array values must be plain strings — never objects or nested arrays.
{"overview":"2-3 sentence summary","keyPoints":["plain string"],"topicsDiscussed":["topic name only"],"actionItems":["action string"]}

TRANSCRIPT:
${transcript}`;

  try {
    const raw = await withModelFallback(async (model) => {
      const res = await getClient().chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a conversation analyst. Reply only with the JSON object, nothing else.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.2,
      });
      return res.choices[0]?.message?.content?.trim() ?? '';
    });

    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    JSON.parse(cleaned); // validate
    return { summary: cleaned, usedFallback: false };
  } catch (err) {
    console.error('Summary error:', (err as Error).message);
    return {
      summary: JSON.stringify({ overview: 'Could not generate summary right now.', keyPoints: [], topicsDiscussed: [], actionItems: [] }),
      usedFallback: true,
    };
  }
}