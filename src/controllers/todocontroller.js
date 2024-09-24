"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usermodel_1 = require("../models/usermodel");
const todomodel_1 = require("../models/todomodel");
const zod_1 = require("zod");
const TodoSchema = zod_1.z.object({
    title: zod_1.z.string().min(4, "Title is required"),
    description: zod_1.z.string().min(5, "Description is required"),
    markedAsCompleted: zod_1.z.boolean().default(false),
});
const createTodo = async (req, res) => {
    const parsedata = TodoSchema.safeParse(req.body);
    if (!parsedata.success) {
        return res
            .status(400)
            .json({ message: "Validation errors", errors: parsedata.error.errors });
    }
    const { title, description, markedAsCompleted } = parsedata.data;
    try {
        const newTodo = await todomodel_1.Todo.create({
            title,
            description,
            markedAsCompleted,
        });
        await usermodel_1.User.findByIdAndUpdate(req.user._id, {
            $push: { todolist: newTodo._id },
        });
        res.status(200).json({ message: "Todo created successfully", newTodo });
    }
    catch (error) {
        res.status(500).json({
            message: "Error creating todo",
            error: error.message,
        });
    }
};
const deleteTodo = async (req, res) => {
    try {
        const deletedTodo = await todomodel_1.Todo.findByIdAndDelete(req.query._id);
        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        return res
            .status(200)
            .json({ message: "Todo deleted successfully", deletedTodo });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting todo",
            error: error.message,
        });
    }
};
const markTodoAsCompleted = async (req, res) => {
    try {
        const todo = await todomodel_1.Todo.findByIdAndUpdate(req.query._id, {
            $set: { markedAsCompleted: true },
        });
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json({ message: "Todo marked as completed", todo });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating todo",
            error: error.message,
        });
    }
};
