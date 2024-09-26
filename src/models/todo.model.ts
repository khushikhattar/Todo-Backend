import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface Todo extends Document {
  title: string;
  description: string;
  completed: boolean;
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
    completed: {
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
