import { Request, Response, NextFunction } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';

//GET /api/chats 

export async function getChats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt')
      .lean();

    res.json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
}

// POST /api/chats

export async function createChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title = 'New Chat' } = req.body;

    const chat = await Chat.create({ title: String(title).slice(0, 200) });

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
}

//  DELETE /api/chats/:id 

export async function deleteChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const chat = await Chat.findByIdAndDelete(id);
    if (!chat) {
      res.status(404).json({ success: false, error: 'Chat not found' });
      return;
    }

    // We will  Cascade-delete all messages in this chat
    await Message.deleteMany({ chatId: id });

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
}
