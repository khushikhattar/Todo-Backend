import { z } from "zod";
import { Request, Response } from "express";

import { User } from "../models/user.model";
import { Todo } from "../models/todo.model";

// Define the schema for validating todos
const TodoSchema = z.object({
  title: z.string().min(4, "Title is required"),
  description: z.string().min(5, "Description is required"),
  markedAsCompleted: z.boolean().default(false),
});

// Create a new Todo
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

    // Check if the user update was successful
    const updatedUser = await User.findByIdAndUpdate(req.user!._id, {
      $push: { todolist: newTodo._id },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({ message: "Todo created successfully", newTodo });
  } catch (error) {
    res.status(500).json({
      message: "Error creating todo",
      error: (error as Error).message,
    });
  }
};

// Delete a Todo
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

// Update the status of a Todo
const updateTodoStatus = async (req: Request, res: Response) => {
  const { markedAsCompleted } = req.body;

  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { markedAsCompleted },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({
      message: `Todo ${
        markedAsCompleted ? "marked as completed" : "not completed"
      }`,
      todo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating todo",
      error: (error as Error).message,
    });
  }
};

// Fetch Todos for the authenticated user
const fetchTodos = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not found" });
    }
    const user = await User.findById(req.user._id).populate("todolist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ usertodos: user.todolist || [] });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching todos",
      error: (error as Error).message,
    });
  }
};

export { createTodo, deleteTodo, updateTodoStatus, fetchTodos };
