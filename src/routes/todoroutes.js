"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoRouter = (0, express_1.Router)();
todoRouter.route("/create").post(); // Create a new todo
todoRouter.route("/delete/:id").delete(); // Delete a todo by ID
todoRouter.route("/update/:id").patch(); // Update a todo by ID
todoRouter.route("/getall").get(); // Get all todos for the authenticated user
exports.default = todoRouter;
