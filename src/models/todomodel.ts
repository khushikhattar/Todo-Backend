import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface Todo extends Document {
  title: string;
  description: string;
  markedAsCompleted: boolean;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema<Todo> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    markedAsCompleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Todo: Model<Todo> = mongoose.model<Todo>("Todo", TodoSchema);
