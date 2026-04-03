import OpenAI from 'openai';
import { IMessage } from '../models/Message';
import { ITask } from '../models/Task';

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');
    client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
  }
  return client;
}

// Use cheapest model for goal/task operations
const MODEL = 'llama-3.1-8b-instant';

function extractJSON<T>(raw: string): T | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

// Pre-filter: skip LLM if message obviously has no goal


const GOAL_KEYWORDS = [
  /\bwant to\b/i, /\bwish to\b/i, /\bhope to\b/i, /\bplan to\b/i,
  /\bmy goal\b/i, /\bi am trying\b/i, /\bi want\b/i, /\bi need to\b/i,
  /\bbecome a\b/i, /\blearn\b.*\bin\b/i, /\bswitch to\b/i, /\btransition\b/i,
  /\bin \d+ (months?|weeks?|years?)\b/i, /\bby (january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  /\bcareer\b/i, /\bpromote\b/i, /\bget a job\b/i, /\bstart a\b/i,
];

function mightHaveGoal(message: string): boolean {
  return GOAL_KEYWORDS.some((r) => r.test(message));
}

//GOAL DETECTION

interface GoalDetectionResult {
  hasGoal: boolean;
  goal: string;
  timeline: string;
}

export async function detectGoalFromMessage(userMessage: string): Promise<GoalDetectionResult> {
  const noGoal = { hasGoal: false, goal: '', timeline: '' };

  // Skip LLM entirely if no goal keywords present — saves tokens
  if (!mightHaveGoal(userMessage)) return noGoal;

  const prompt = `Does this message contain a personal goal the user wants to achieve?

Message: "${userMessage.slice(0, 300)}"

Reply ONLY with this JSON:
{"hasGoal":true/false,"goal":"concise goal in 60 chars or empty","timeline":"e.g. 6 months or No specific timeline"}

hasGoal=true only for clear personal goals (career, skill, fitness, project). false for questions/chat.`;

  try {
    const res = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Extract goals from messages. Reply only with JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 80,  
      temperature: 0.1,
    });

    const raw = res.choices[0]?.message?.content ?? '';
    const result = extractJSON<GoalDetectionResult>(raw);
    if (!result || typeof result.hasGoal !== 'boolean') return noGoal;
    return result;
  } catch (err) {
    console.error('Goal detection failed:', (err as Error).message);
    return noGoal;
  }
}

// TASK EXTRACTION

// Pre-filter: only extract tasks if AI response contains action-oriented content
const TASK_KEYWORDS = /\b(should|could|recommend|suggest|start|begin|try|read|watch|practice|build|create|sign up|apply|contact|research|learn|schedule|set up|download|join|follow)\b/i;

export async function extractTasksFromResponse(aiResponse: string, goal: string): Promise<string[]> {
  // Skip if response doesn't look like it contains actionable advice
  if (!TASK_KEYWORDS.test(aiResponse)) return [];

  const prompt = `Goal: "${goal}"

AI response (excerpt):
${aiResponse.slice(0, 1500)}

Extract 2-3 specific actionable tasks from this response that help achieve the goal.
Each task: starts with a verb, completable in 1-2 weeks, concrete.

Reply ONLY with JSON: {"tasks":["task 1","task 2"]}
If no actionable content: {"tasks":[]}`;

  try {
    const res = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Extract actionable tasks. Reply only with JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,  // small
      temperature: 0.2,
    });

    const raw = res.choices[0]?.message?.content ?? '';
    const result = extractJSON<{ tasks: string[] }>(raw);
    if (!result?.tasks || !Array.isArray(result.tasks)) return [];

    return result.tasks
      .filter((t) => typeof t === 'string' && t.trim().length > 5 && t.length < 200)
      .map((t) => t.trim())
      .slice(0, 3);
  } catch (err) {
    console.error('Task extraction failed:', (err as Error).message);
    return [];
  }
}

// NEXT TASK GENERATION

export async function generateNextTasks(
  goal: string,
  timeline: string,
  completedTasks: ITask[],
  remainingTasks: ITask[]
): Promise<string[]> {
  const done = completedTasks.map((t) => `✓ ${t.text}`).join('\n') || 'None';
  const pending = remainingTasks.map((t) => `• ${t.text}`).join('\n') || 'None';

  const prompt = `Goal: ${goal} (${timeline})

Done: ${done}
Pending: ${pending}

Generate exactly 3 new specific next steps that build on completed work.
Reply ONLY with JSON: {"tasks":["task 1","task 2","task 3"]}`;

  try {
    const res = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Generate next-step tasks. Reply only with JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.6,
    });

    const raw = res.choices[0]?.message?.content ?? '';
    const result = extractJSON<{ tasks: string[] }>(raw);
    if (!result?.tasks || !Array.isArray(result.tasks)) throw new Error('Invalid JSON');

    return result.tasks
      .filter((t) => typeof t === 'string' && t.trim().length > 5)
      .map((t) => t.trim())
      .slice(0, 3);
  } catch (err) {
    console.error('Next task generation failed:', (err as Error).message);
    return [
      `Review your progress toward: ${goal}`,
      'Identify your single biggest blocker right now',
      'Schedule a 30-minute focused work session this week',
    ];
  }
}