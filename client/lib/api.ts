import axios from 'axios';
import { Chat, Message, SendMessageResponse, ApiResponse } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  timeout: 35_000,
  headers: { 'Content-Type': 'application/json' },
});

//Interceptors

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error ??
      (error.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error — is the server running?');
    return Promise.reject(new Error(message));
  }
);

//Chat API

export const chatApi = {
  getAll: async (): Promise<Chat[]> => {
    const res = await api.get<ApiResponse<Chat[]>>('/chats');
    return res.data.data;
  },

  create: async (title?: string): Promise<Chat> => {
    const res = await api.post<ApiResponse<Chat>>('/chats', { title });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/chats/${id}`);
  },
};


export const messageApi = {
  getAll: async (chatId: string): Promise<Message[]> => {
    const res = await api.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`);
    return res.data.data;
  },

  send: async (chatId: string, content: string): Promise<SendMessageResponse> => {
    const res = await api.post<ApiResponse<SendMessageResponse>>(
      `/chats/${chatId}/messages`,
      { content }
    );
    return res.data.data;
  },
};


export const summaryApi = {
  generate: async (chatId: string): Promise<{ summary: string; usedFallback: boolean; messageCount: number }> => {
    const res = await api.post<ApiResponse<{ summary: string; usedFallback: boolean; messageCount: number }>>(
      `/chats/${chatId}/summary`
    );
    return res.data.data;
  },
};

export default api;

export const goalApi = {
  get: async (chatId: string) => {
    const res = await api.get<ApiResponse<any>>(`/chats/${chatId}/goal`);
    return res.data.data;
  },
  upsert: async (chatId: string, goal: string, timeline: string) => {
    const res = await api.post<ApiResponse<any>>(`/chats/${chatId}/goal`, { goal, timeline });
    return res.data.data;
  },
};

// Task API

export const taskApi = {
  getAll: async (chatId: string) => {
    const res = await api.get<ApiResponse<any[]>>(`/chats/${chatId}/tasks`);
    return res.data.data;
  },
  create: async (chatId: string, tasks: string[]) => {
    const res = await api.post<ApiResponse<any[]>>(`/chats/${chatId}/tasks`, { tasks });
    return res.data.data;
  },
  update: async (taskId: string, completed: boolean) => {
    const res = await api.patch<ApiResponse<any>>(`/tasks/${taskId}`, { completed });
    return res.data.data;
  },
  generateNext: async (chatId: string) => {
    const res = await api.post<ApiResponse<any[]>>(`/chats/${chatId}/tasks/generate-next`);
    return res.data.data;
  },
};