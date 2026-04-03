import { Schema, Types, model } from 'mongoose';

export interface ITask {
  chatId: Types.ObjectId;
  text: string;
  completed: boolean;
  completedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: undefined,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent exact duplicate tasks in the same chat.
TaskSchema.index({ chatId: 1, text: 1 }, { unique: true });
TaskSchema.index({ chatId: 1, order: 1 });

export default model<ITask>('Task', TaskSchema);
