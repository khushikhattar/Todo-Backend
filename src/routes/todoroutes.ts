import { Router } from "express";
const todoRouter = Router();

todoRouter.route("/create").post(); // Create a new todo
todoRouter.route("/delete/:id").delete(); // Delete a todo by ID
todoRouter.route("/update/:id").patch(); // Update a todo by ID
todoRouter.route("/getall").get(); // Get all todos for the authenticated user

export default todoRouter;
