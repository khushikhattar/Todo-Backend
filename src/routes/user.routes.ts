import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUser,
  updatePassword,
  deleteUser,
  fetchUser,
} from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/fetch").get(verifyJWT, fetchUser);
router.route("/register").post(registerUser); // Register a new user
router.route("/login").post(loginUser); // User login
router.route("/logout").post(verifyJWT, logoutUser); // User logout
router.route("/update").patch(verifyJWT, updateUser); // Update user details
router.route("/update-password").patch(verifyJWT, updatePassword); // Update user password
router.route("/refresh-access-token").post(verifyJWT, refreshAccessToken); // Refresh access token
router.route("/").delete(verifyJWT, deleteUser); // Delete user account

export default router;
