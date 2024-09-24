import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  markTodoAsCompleted,
  getalltodos,
} from "../controllers/todocontroller";
import { verifyJWT } from "../middlewares/authmiddleware";
const todoRouter = Router();

todoRouter.route("/create").post(verifyJWT, createTodo); // Create a new todo
todoRouter.route("/delete/:id").delete(verifyJWT, deleteTodo); // Delete a todo by ID
todoRouter.route("/update/:id").patch(verifyJWT, markTodoAsCompleted); // Update a todo by ID
todoRouter.route("/getall").get(verifyJWT, getalltodos); // Get all todos for the authenticated user

export default todoRouter;
