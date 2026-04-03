import { Schema, model } from 'mongoose';

export interface IChat {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: 'New Chat',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for sorting sidebar by most recent
ChatSchema.index({ updatedAt: -1 });

export default model<IChat>('Chat', ChatSchema);
