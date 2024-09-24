"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
userRouter.route("/register").post(); // Register a new user
userRouter.route("/login").post(); // User login
userRouter.route("/logout").post(); // User logout
userRouter.route("/updateuserdetails").patch(); // Update user details
userRouter.route("/updateuserpassword").patch(); // Update user password
userRouter.route("/deleteUser").delete(); // Delete user account
userRouter.route("/refreshaccesstoken").post(); // Refresh access token
exports.default = userRouter;
