import { Request, Response, NextFunction } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import Goal from '../models/Goal';
import Task from '../models/Task';
import { sendMessageToGemini, generateSummaryFromGemini } from '../services/geminiService';
import { detectGoalFromMessage, extractTasksFromResponse } from '../services/goalService';

function deriveTitleFromMessage(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 60) || 'New Chat';
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: chatId } = req.params;
    const chat = await Chat.findById(chatId).lean();
    if (!chat) { res.status(404).json({ success: false, error: 'Chat not found' }); return; }
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: chatId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Message content is required' });
      return;
    }

    const trimmedContent = content.trim();
    const chat = await Chat.findById(chatId);
    if (!chat) { res.status(404).json({ success: false, error: 'Chat not found' }); return; }

    // Save user message
    const userMessage = await Message.create({
      chatId, role: 'user', content: trimmedContent, timestamp: new Date(),
    });

    if (chat.title === 'New Chat') {
      chat.title = deriveTitleFromMessage(trimmedContent);
      await chat.save();
    }

    const history = await Message.find({ chatId, _id: { $ne: userMessage._id } })
      .sort({ timestamp: 1 }).lean();

    //Get AI response (primary, always runs)
    const aiResult = await sendMessageToGemini({ userMessage: trimmedContent, history });

    const assistantMessage = await Message.create({
      chatId, role: 'assistant', content: aiResult.content, timestamp: new Date(),
    });

    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    // Goal + task processing (async, non-blocking, best-effort)
   
    res.status(201).json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        usedFallback: aiResult.usedFallback,
        searchUsed: aiResult.searchUsed,
        chatTitle: chat.title,
      },
    });

    // Background processing — runs after response sent
    setImmediate(async () => {
      try {
        // Check if goal already exists for this chat
        const existingGoal = await Goal.findOne({ chatId }).lean();

        // Only run goal detection if no goal yet (saves tokens for established chats)
        if (!existingGoal) {
          const goalDetection = await detectGoalFromMessage(trimmedContent);
          if (goalDetection.hasGoal && goalDetection.goal) {
            await Goal.findOneAndUpdate(
              { chatId },
              { goal: goalDetection.goal, timeline: goalDetection.timeline },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }

        // Only extract tasks if a goal exists and AI gave a substantive response
        const goalForExtraction = existingGoal || await Goal.findOne({ chatId }).lean();
        if (goalForExtraction && aiResult.content.length > 100) {
          const extracted = await extractTasksFromResponse(aiResult.content, goalForExtraction.goal);
          if (extracted.length > 0) {
            const maxOrderDoc = await Task.findOne({ chatId }).sort({ order: -1 }).lean();
            const startOrder = (maxOrderDoc?.order ?? -1) + 1;
            await Promise.allSettled(
              extracted.map((text, i) =>
                Task.findOneAndUpdate(
                  { chatId, text: text.trim() },
                  { $setOnInsert: { chatId, text: text.trim(), completed: false, order: startOrder + i } },
                  { upsert: true, new: true }
                )
              )
            );
          }
        }
      } catch (err) {
        // Silent — background processing never crashes the app
        console.error('Background goal/task processing failed:', (err as Error).message);
      }
    });

  } catch (err) { next(err); }
}

export async function generateSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: chatId } = req.params;
    const chat = await Chat.findById(chatId).lean();
    if (!chat) { res.status(404).json({ success: false, error: 'Chat not found' }); return; }

    const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();
    if (messages.length < 2) {
      res.json({ success: true, data: {
        summary: JSON.stringify({ overview: 'Conversation too short to summarize.', keyPoints: [], topicsDiscussed: [], actionItems: [] }),
        usedFallback: false, messageCount: messages.length,
      }});
      return;
    }

    const { summary, usedFallback } = await generateSummaryFromGemini(messages);
    res.json({ success: true, data: { summary, usedFallback, messageCount: messages.length } });
  } catch (err) { next(err); }
}