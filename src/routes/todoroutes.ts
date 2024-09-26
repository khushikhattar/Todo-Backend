import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  updateTodoStatus,
  fetchTodos,
} from "../controllers/todocontroller";
import { verifyJWT } from "../middlewares/authmiddleware";
const todoRouter = Router();

todoRouter.route("/create").post(verifyJWT, createTodo); // Create a new todo
todoRouter.route("/delete/:id").delete(verifyJWT, deleteTodo); // Delete a todo by ID
todoRouter.route("/update/:id").patch(verifyJWT, updateTodoStatus); // Update a todo by ID
todoRouter.route("/getall").get(verifyJWT, fetchTodos); // Get all todos for the authenticated user

export default todoRouter;
