import { Router } from "express";

import {
  fetchTodos,
  createTodo,
  deleteTodo,
  updateTodoStatus,
} from "../controllers/todo.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("fetchall/").get(verifyJWT, fetchTodos); // Get all todos for the authenticated user
router.route("/").post(verifyJWT, createTodo); // Create a new todo
router.route("update/:id").patch(verifyJWT, updateTodoStatus); // Update a todo by ID
router.route("delete/:id").delete(verifyJWT, deleteTodo); // Delete a todo by ID

export default router;
