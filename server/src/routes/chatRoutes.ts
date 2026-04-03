import { Router } from 'express';
import { getChats, createChat, deleteChat } from '../controllers/chatController';
import { getMessages, sendMessage, generateSummary } from '../controllers/messageController';
import { getGoal, upsertGoal, getTasks, createTasks, updateTask, generateNextTasksHandler } from '../controllers/goalController';
import { readLimiter, writeLimiter, messageLimiter, summaryLimiter } from '../middleware/rateLimiter';

const router = Router();

// Chat routes
router.get('/chats', readLimiter, getChats);               
router.post('/chats', writeLimiter, createChat);
router.delete('/chats/:id', writeLimiter, deleteChat);

// Message routes
router.get('/chats/:id/messages', readLimiter, getMessages);
router.post('/chats/:id/messages', messageLimiter, sendMessage);
router.post('/chats/:id/summary', summaryLimiter, generateSummary);

//Goal routes
router.get('/chats/:chatId/goal', readLimiter, getGoal);
router.post('/chats/:chatId/goal', writeLimiter, upsertGoal);

// Task routes 
router.get('/chats/:chatId/tasks', readLimiter, getTasks);
router.post('/chats/:chatId/tasks', writeLimiter, createTasks);
router.post('/chats/:chatId/tasks/generate-next', summaryLimiter, generateNextTasksHandler);
router.patch('/tasks/:taskId', writeLimiter, updateTask);

export default router;