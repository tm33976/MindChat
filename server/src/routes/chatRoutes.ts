import { Router } from 'express';
import { getChats, createChat, deleteChat } from '../controllers/chatController';
import { getMessages, sendMessage, generateSummary } from '../controllers/messageController';
import { getGoal, upsertGoal, getTasks, createTasks, updateTask, generateNextTasksHandler } from '../controllers/goalController';
import { messageLimiter, summaryLimiter } from '../middleware/rateLimiter';

const router = Router();

//Chat routes 
router.get('/chats', getChats);
router.post('/chats', createChat);
router.delete('/chats/:id', deleteChat);

router.get('/chats/:id/messages', getMessages);
router.post('/chats/:id/messages', messageLimiter, sendMessage);
router.post('/chats/:id/summary', summaryLimiter, generateSummary);

//Goal routes
router.get('/chats/:chatId/goal', getGoal);
router.post('/chats/:chatId/goal', upsertGoal);

// Task routes 
router.get('/chats/:chatId/tasks', getTasks);
router.post('/chats/:chatId/tasks', createTasks);
router.post('/chats/:chatId/tasks/generate-next', generateNextTasksHandler);

//Task update (no chatId needed)
router.patch('/tasks/:taskId', updateTask);

export default router;