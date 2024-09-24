import { Router } from "express";
const userRouter = Router();

userRouter.route("/register").post(); // Register a new user
userRouter.route("/login").post(); // User login
userRouter.route("/logout").post(); // User logout
userRouter.route("/updateuserdetails").patch(); // Update user details
userRouter.route("/updateuserpassword").patch(); // Update user password
userRouter.route("/deleteUser").delete(); // Delete user account
userRouter.route("/refreshaccesstoken").post(); // Refresh access token

export default userRouter;
