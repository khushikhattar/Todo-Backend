import { User } from "../models/usermodel";
import { Todo } from "../models/todomodel";
import { z } from "zod";
import { Request, Response } from "express";

const TodoSchema = z.object({
  title: z.string().min(4, "Title is required"),
  description: z.string().min(5, "Description is required"),
  markedAsCompleted: z.boolean().default(false),
});

const createTodo = async (req: Request, res: Response) => {
  const parsedata = TodoSchema.safeParse(req.body);
  if (!parsedata.success) {
    return res
      .status(400)
      .json({ message: "Validation errors", errors: parsedata.error.errors });
  }

  const { title, description, markedAsCompleted } = parsedata.data;
  try {
    const newTodo = await Todo.create({
      title,
      description,
      markedAsCompleted,
    });

    await User.findByIdAndUpdate((req as any).user._id, {
      $push: { todolist: newTodo._id },
    });
    res.status(200).json({ message: "Todo created successfully", newTodo });
  } catch (error) {
    res.status(500).json({
      message: "Error creating todo",
      error: (error as Error).message,
    });
  }
};

const deleteTodo = async (req: Request, res: Response) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.query._id);
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    return res
      .status(200)
      .json({ message: "Todo deleted successfully", deletedTodo });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting todo",
      error: (error as Error).message,
    });
  }
};

const markTodoAsCompleted = async (req: Request, res: Response) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.query._id, {
      $set: { markedAsCompleted: true },
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo marked as completed", todo });
  } catch (error) {
    res.status(500).json({
      message: "Error updating todo",
      error: (error as Error).message,
    });
  }
};

const getalltodos = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not found" });
  }
  const usertodos = Todo.find({
    userId: req.user._id,
  });
  if (!usertodos) {
    return res.status(404).json({ message: "Todos not found" });
  }
  return res.status(200).json({ usertodos });
};
export { createTodo, deleteTodo, markTodoAsCompleted, getalltodos };
