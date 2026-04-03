import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  goal: string;
  timeline: string;
  detectedAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      unique: true, //We have one active goal per chat
      index: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    timeline: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'No specific timeline',
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGoal>('Goal', GoalSchema);