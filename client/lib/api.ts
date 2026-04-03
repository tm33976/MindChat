import axios, { AxiosError, AxiosInstance } from 'axios';
import { Chat, Message, SendMessageResponse, ApiResponse } from '@/types';


async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      attempt++;

      // Only retry on 429 (rate limit) and 503 (service unavailable)
      if ((status === 429 || status === 503) && attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(`Request got ${status}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      throw err;
    }
  }
}


const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  timeout: 35_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    let message: string;

    if (status === 429) {
      message = 'Too many requests — please wait a moment and try again.';
    } else if (status === 503 || status === 502) {
      message = 'Server is starting up — please wait a few seconds and refresh.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out — check your connection.';
    } else if (!error.response) {
      message = 'Cannot reach the server. Is the backend running?';
    } else {
      message = data?.error ?? 'Something went wrong. Please try again.';
    }

    return Promise.reject(new Error(message));
  }
);



export const chatApi = {
  getAll: async (): Promise<Chat[]> => {
    return withRetry(async () => {
      const res = await api.get<ApiResponse<Chat[]>>('/chats');
      return res.data.data;
    });
  },

  create: async (title?: string): Promise<Chat> => {
    return withRetry(async () => {
      const res = await api.post<ApiResponse<Chat>>('/chats', { title });
      return res.data.data;
    });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/chats/${id}`);
  },
};



export const messageApi = {
  getAll: async (chatId: string): Promise<Message[]> => {
    return withRetry(async () => {
      const res = await api.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`);
      return res.data.data;
    });
  },

  send: async (chatId: string, content: string): Promise<SendMessageResponse> => {
    // No retry on send — user should decide to resend
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


export const goalApi = {
  get: async (chatId: string) => {
    return withRetry(async () => {
      const res = await api.get<ApiResponse<any>>(`/chats/${chatId}/goal`);
      return res.data.data;
    });
  },
  upsert: async (chatId: string, goal: string, timeline: string) => {
    const res = await api.post<ApiResponse<any>>(`/chats/${chatId}/goal`, { goal, timeline });
    return res.data.data;
  },
};



export const taskApi = {
  getAll: async (chatId: string) => {
    return withRetry(async () => {
      const res = await api.get<ApiResponse<any[]>>(`/chats/${chatId}/tasks`);
      return res.data.data;
    });
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

export default api;