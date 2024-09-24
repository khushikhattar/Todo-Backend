import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUser,
  updatePassword,
  deleteUser,
} from "../controllers/usercontroller";
import { verifyJWT } from "../middlewares/authmiddleware";
const userRouter = Router();

userRouter.route("/register").post(registerUser); // Register a new user
userRouter.route("/login").post(loginUser); // User login
userRouter.route("/logout").post(verifyJWT, logoutUser); // User logout
userRouter.route("/updateuserdetails").patch(verifyJWT, updateUser); // Update user details
userRouter.route("/updateuserpassword").patch(verifyJWT, updatePassword); // Update user password
userRouter.route("/deleteUser").delete(verifyJWT, deleteUser); // Delete user account
userRouter.route("/refreshaccesstoken").post(verifyJWT, refreshAccessToken); // Refresh access token

export default userRouter;
