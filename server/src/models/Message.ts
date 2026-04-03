import { Schema, Types, model } from 'mongoose';

export type MessageRole = 'user' | 'assistant';

export interface IMessage {
  chatId: Types.ObjectId;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      // No maxlength here - we handle context window on the service layer.
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for fast chronological retrieval within a chat.
MessageSchema.index({ chatId: 1, timestamp: 1 });

export default model<IMessage>('Message', MessageSchema);
