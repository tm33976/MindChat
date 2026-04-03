export interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  usedFallback: boolean;
  chatTitle: string;
}

export interface SummaryData {
  overview: string;
  keyPoints: string[];
  topicsDiscussed: string[];
  actionItems: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface Goal {
  _id: string;
  chatId: string;
  goal: string;
  timeline: string;
  detectedAt: string;
}

export interface Task {
  _id: string;
  chatId: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  createdAt: string;
}