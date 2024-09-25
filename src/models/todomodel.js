"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
var mongoose_1 = require("mongoose");
var TodoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    markedAsCompleted: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
exports.Todo = mongoose_1.default.model("Todo", TodoSchema);
