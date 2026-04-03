import { Request, Response, NextFunction } from 'express';
import Goal from '../models/Goal';
import Task from '../models/Task';
import Chat from '../models/Chat';
import { generateNextTasks } from '../services/goalService';


export async function getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const goal = await Goal.findOne({ chatId }).lean();
    res.json({ success: true, data: goal ?? null });
  } catch (err) {
    next(err);
  }
}


export async function upsertGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const { goal, timeline } = req.body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Goal text is required' });
      return;
    }

    // Verify chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ success: false, error: 'Chat not found' });
      return;
    }

    const saved = await Goal.findOneAndUpdate(
      { chatId },
      { goal: goal.trim().slice(0, 500), timeline: (timeline ?? 'No specific timeline').slice(0, 100) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

//  GET /api/chats/:chatId/tasks

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const tasks = await Task.find({ chatId }).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
}
//POST /api/chats/:chatId/tasks

export async function createTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const { tasks } = req.body; // string[]

    if (!Array.isArray(tasks) || tasks.length === 0) {
      res.status(400).json({ success: false, error: 'tasks must be a non-empty array' });
      return;
    }

    // Get current max order to append new tasks after existing ones
    const maxOrderDoc = await Task.findOne({ chatId }).sort({ order: -1 }).lean();
    const startOrder = (maxOrderDoc?.order ?? -1) + 1;

    // Insert with duplicate protection — skip existing identical tasks
    const results = await Promise.allSettled(
      tasks.map((text: string, i: number) =>
        Task.findOneAndUpdate(
          { chatId, text: text.trim() },
          { $setOnInsert: { chatId, text: text.trim(), completed: false, order: startOrder + i } },
          { upsert: true, new: true }
        )
      )
    );

    const saved = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      res.status(400).json({ success: false, error: 'completed must be a boolean' });
      return;
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        completed,
        completedAt: completed ? new Date() : undefined,
      },
      { new: true }
    );

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// Simple in-memory guard against rapid concurrent requests
const generatingChats = new Set<string>();

export async function generateNextTasksHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { chatId } = req.params;

  // Prevent duplicate concurrent generation for same chat
  if (generatingChats.has(chatId)) {
    res.status(429).json({ success: false, error: 'Already generating tasks for this chat' });
    return;
  }

  generatingChats.add(chatId);

  try {
    const goal = await Goal.findOne({ chatId }).lean();
    if (!goal) {
      res.status(404).json({ success: false, error: 'No goal set for this chat' });
      return;
    }

    const [completedTasks, remainingTasks] = await Promise.all([
      Task.find({ chatId, completed: true }).lean(),
      Task.find({ chatId, completed: false }).lean(),
    ]);

    const newTaskTexts = await generateNextTasks(
      goal.goal,
      goal.timeline,
      completedTasks,
      remainingTasks
    );

    // Get current max order
    const maxOrderDoc = await Task.findOne({ chatId }).sort({ order: -1 }).lean();
    const startOrder = (maxOrderDoc?.order ?? -1) + 1;

    // Save new tasks, skip duplicates
    const results = await Promise.allSettled(
      newTaskTexts.map((text, i) =>
        Task.findOneAndUpdate(
          { chatId, text: text.trim() },
          { $setOnInsert: { chatId, text: text.trim(), completed: false, order: startOrder + i } },
          { upsert: true, new: true }
        )
      )
    );

    const saved = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  } finally {
    generatingChats.delete(chatId);
  }
}