import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

import { User } from "../models/user.model";

interface UserPayload {
  _id: string;
}

const UserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const LoginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Schemas for updating user and password
const UpdateUserSchema = z.object({
  username: z.string().min(1, "New username is required").optional(),
  email: z.string().email("Invalid email address").optional(),
});

const UpdatePasswordSchema = z.object({
  oldpassword: z
    .string()
    .min(6, "Old password must be at least 6 characters long"),
  newpassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = user.genaccesstoken();
    const refreshToken = user.genrefreshtoken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Error generating tokens: ${(error as Error).message}`);
  }
};

// Register user
const registerUser = async (req: Request, res: Response) => {
  const parseResult = UserSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ message: "Validation errors", errors: parseResult.error.errors });
  }

  const { username, email, password } = parseResult.data;
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    return res
      .status(409)
      .json({ message: "User with email or username already exists" });
  }

  const createdUser = await User.create({ username, password, email });

  if (!createdUser) {
    return res.status(500).json({ message: "Error creating the user" });
  }

  return res.status(201).json({ message: "User registered successfully" });
};

// Login user
const loginUser = async (req: Request, res: Response) => {
  const parseResult = LoginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ message: "Validation errors", errors: parseResult.error.errors });
  }

  const { username, password } = parseResult.data;
  const user = await User.findOne({ $or: [{ username }, { password }] });

  if (!user) {
    return res.status(404).json({ message: "User does not exist" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id.toString()
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "User Logged In Successfully",
      user: loggedInUser,
      token: accessToken,
    });
};

// Logout user
const logoutUser = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not found" });
  }

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshtoken: "" } },
      { new: true, timestamps: false }
    );
    const options = { httpOnly: true, secure: true };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User Logged Out Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging out user" });
  }
};

// Refresh access token
const refreshAccessToken = async (req: Request, res: Response) => {
  const incomingreftoken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingreftoken) {
    return res.status(400).json({ message: "Unauthorized request" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingreftoken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as UserPayload;
    const user = await User.findById(decodedToken._id);
    if (!user || incomingreftoken !== user.refreshtoken) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );
    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "Access token refreshed successfully" });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid refresh token",
      error: (error as Error).message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const parseResult = UpdateUserSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ message: "Validation errors", errors: parseResult.error.errors });
  }

  const { username, email } = parseResult.data;

  if (!(username || email)) {
    return res.status(400).json({ message: "Username and email are required" });
  }

  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not found" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { username, email } },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res
    .status(200)
    .json({ message: "User Details Updated Successfully", user });
};

const updatePassword = async (req: Request, res: Response) => {
  const parseResult = UpdatePasswordSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ message: "Validation errors", errors: parseResult.error.errors });
  }

  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not found" });
  }

  const { oldpassword, newpassword } = parseResult.data;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid current password" });
  }

  const hashedPassword = await bcrypt.hash(newpassword, 10);
  user.password = hashedPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ message: "Password changed successfully" });
};

const deleteUser = async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User not found" });
  }

  const deleteduser = await User.findByIdAndDelete(req.user._id);

  if (!deleteduser) {
    return res
      .status(404)
      .json({ message: "Error occurred in deleting the user" });
  }

  return res.status(200).json({ message: "User deleted successfully" });
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUser,
  updatePassword,
  deleteUser,
};
