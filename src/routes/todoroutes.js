"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var todocontroller_1 = require("../controllers/todocontroller");
var authmiddleware_1 = require("../middlewares/authmiddleware");
var todoRouter = (0, express_1.Router)();
todoRouter.route("/create").post(authmiddleware_1.verifyJWT, todocontroller_1.createTodo); // Create a new todo
todoRouter.route("/delete/:id").delete(authmiddleware_1.verifyJWT, todocontroller_1.deleteTodo); // Delete a todo by ID
todoRouter.route("/update/:id").patch(authmiddleware_1.verifyJWT, todocontroller_1.markTodoAsCompleted); // Update a todo by ID
todoRouter.route("/getall").get(authmiddleware_1.verifyJWT, todocontroller_1.getalltodos); // Get all todos for the authenticated user
exports.default = todoRouter;
