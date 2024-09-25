"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var usercontroller_1 = require("../controllers/usercontroller");
var authmiddleware_1 = require("../middlewares/authmiddleware");
var userRouter = (0, express_1.Router)();
userRouter.route("/register").post(usercontroller_1.registerUser); // Register a new user
userRouter.route("/login").post(usercontroller_1.loginUser); // User login
userRouter.route("/logout").post(authmiddleware_1.verifyJWT, usercontroller_1.logoutUser); // User logout
userRouter.route("/updateuserdetails").patch(authmiddleware_1.verifyJWT, usercontroller_1.updateUser); // Update user details
userRouter.route("/updateuserpassword").patch(authmiddleware_1.verifyJWT, usercontroller_1.updatePassword); // Update user password
userRouter.route("/deleteUser").delete(authmiddleware_1.verifyJWT, usercontroller_1.deleteUser); // Delete user account
userRouter.route("/refreshaccesstoken").post(authmiddleware_1.verifyJWT, usercontroller_1.refreshAccessToken); // Refresh access token
exports.default = userRouter;
