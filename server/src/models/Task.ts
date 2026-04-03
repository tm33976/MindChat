import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  text: string;
  completed: boolean;
  completedAt?: Date;
  order: number;
  createdAt: Date;
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

// Prevent exact duplicate tasks in same chat
TaskSchema.index({ chatId: 1, text: 1 }, { unique: true });
TaskSchema.index({ chatId: 1, order: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);