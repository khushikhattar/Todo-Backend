import { Router } from "express";

import {
  fetchTodos,
  createTodo,
  deleteTodo,
  toggleTodo,
  editTodo,
} from "../controllers/todo.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(verifyJWT, fetchTodos); // Get all todos for the authenticated user
router.route("/").post(verifyJWT, createTodo); // Create a new todo
router.route("/:id").patch(verifyJWT, toggleTodo); // Update a todo by ID
router.route("/:id").delete(verifyJWT, deleteTodo); // Delete a todo by ID
router.route("/:id").patch(verifyJWT, editTodo);

export default router;
