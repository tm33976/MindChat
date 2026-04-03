import rateLimit from 'express-rate-limit';

/**
 * READ limiter — GET requests (loading chats, messages).
 * Very generous: 300 per 15 min. Multiple tabs/devices won't hit this.
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please refresh in a moment.' },
});

/**
 * WRITE limiter — POST/DELETE (create chat, delete chat).
 * 60 per 15 min — generous enough for normal use.
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});

/**
 * MESSAGE limiter — sending messages (hits Groq API).
 * 30 per minute — protects token quota.
 */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Sending too fast. Wait a moment.' },
});

/**
 * SUMMARY limiter — expensive LLM call.
 * 15 per minute.
 */
export const summaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many summary requests. Please wait.' },
});