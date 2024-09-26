import { z } from "zod";
import { Request, Response } from "express";

import { User } from "../models/user.model";
import { Todo } from "../models/todo.model";

const TodoSchema = z.object({
  title: z.string().min(4, "Title is required"),
  description: z.string().min(5, "Description is required"),
  completed: z.boolean().default(false),
});

const createTodo = async (req: Request, res: Response) => {
  const validatedFields = TodoSchema.safeParse(req.body);
  if (!validatedFields.success) {
    return res
      .status(400)
      .json({ message: "Validation errors", errors: validatedFields.error.errors });
  }

  const { title, description, completed } = validatedFields.data;
  try {
    const newTodo = await Todo.create({
      title,
      description,
      completed,
      userId: String(req.user?._id)
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
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
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

const updateTodoStatus = async (req: Request, res: Response) => {
  const { completed } = req.body

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, {
      completed
    },
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo marked as completed", updatedTodo });
  } catch (error) {
    res.status(500).json({
      message: "Error updating todo",
      error: (error as Error).message,
    });
  }
};

const fetchTodos = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not found" });
  }

  const userTodos = await Todo.find({
    userId: String(req.user?._id)
  });

  if (!userTodos) {
    return res.status(404).json({ message: "Todos not found" });
  }
  return res.status(200).json(userTodos);
};
export { createTodo, deleteTodo, updateTodoStatus, fetchTodos };
