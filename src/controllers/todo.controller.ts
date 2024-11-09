import { z } from "zod";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Todo } from "../models/todo.model";

const TodoSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters long"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters long"),
  markedAsCompleted: z.boolean().default(false),
});

const editTodoSchema = z.object({
  newTitle: z
    .string()
    .min(4, "New Title must be at least 4 characters long")
    .optional(),
  newDescription: z
    .string()
    .min(5, "New Description must be at least 5 characters long")
    .optional(),
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

    const updatedUser = await User.findByIdAndUpdate(req.user!._id, {
      $push: { todolist: newTodo._id },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({ message: "Todo created successfully", newTodo });
  } catch (error) {
    console.error("Error creating todo:", error);
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
    console.error("Error deleting todo:", error);
    res.status(500).json({
      message: "Error deleting todo",
      error: (error as Error).message,
    });
  }
};

const toggleTodo = async (req: Request, res: Response) => {
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
        markedAsCompleted ? "marked as completed" : "marked as incomplete"
      }`,
      todo,
    });
  } catch (error) {
    console.error("Error updating todo status:", error);
    res.status(500).json({
      message: "Error updating todo status",
      error: (error as Error).message,
    });
  }
};

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
    console.error("Error fetching todos:", error);
    return res.status(500).json({
      message: "Error fetching todos",
      error: (error as Error).message,
    });
  }
};

const editTodo = async (req: Request, res: Response) => {
  const parseResult = editTodoSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: "Validation errors",
      errors: parseResult.error.errors,
    });
  }

  const { newTitle, newDescription } = parseResult.data;
  const updateFields: Partial<{ title: string; description: string }> = {};

  if (newTitle && newTitle.trim()) updateFields.title = newTitle.trim();
  if (newDescription && newDescription.trim())
    updateFields.description = newDescription.trim();

  if (Object.keys(updateFields).length === 0) {
    return res
      .status(400)
      .json({ message: "At least one field must be updated" });
  }

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({
      message: "Todo updated successfully",
      updatedTodo,
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    return res.status(500).json({
      message: "Error updating todo",
      error: (error as Error).message,
    });
  }
};

export { createTodo, deleteTodo, toggleTodo, fetchTodos, editTodo };
