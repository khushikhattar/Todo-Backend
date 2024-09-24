"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usermodel_1 = require("../models/usermodel");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
});
// Schemas for updating user and password
const UpdateUserSchema = zod_1.z.object({
    newusername: zod_1.z.string().min(1, "New username is required").optional(),
    newemail: zod_1.z.string().email("Invalid email address").optional(),
});
const UpdatePasswordSchema = zod_1.z.object({
    oldpassword: zod_1.z
        .string()
        .min(6, "Old password must be at least 6 characters long"),
    newpassword: zod_1.z
        .string()
        .min(6, "New password must be at least 6 characters long"),
});
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await usermodel_1.User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = user.genAccessToken();
        const refreshToken = user.genRefreshToken();
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new Error(`Error generating tokens: ${error.message}`);
    }
};
// Register user
const registerUser = async (req, res) => {
    const parseResult = UserSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res
            .status(400)
            .json({ message: "Validation errors", errors: parseResult.error.errors });
    }
    const { username, email, password } = parseResult.data;
    const existedUser = await usermodel_1.User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        return res
            .status(409)
            .json({ message: "User with email or username already exists" });
    }
    const createdUser = await usermodel_1.User.create({ username, password, email });
    if (!createdUser) {
        return res.status(500).json({ message: "Error creating the user" });
    }
    return res.status(201).json({ message: "User registered successfully" });
};
// Login user
const loginUser = async (req, res) => {
    const parseResult = UserSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res
            .status(400)
            .json({ message: "Validation errors", errors: parseResult.error.errors });
    }
    const { username, password, email } = parseResult.data;
    const user = await usermodel_1.User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
        return res.status(404).json({ message: "User does not exist" });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid Password" });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());
    const loggedInUser = await usermodel_1.User.findById(user._id).select("-password -refreshtoken");
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: "User Logged In Successfully", user: loggedInUser });
};
// Logout user
// Logout user
const logoutUser = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(400).json({ message: "User not found" });
    }
    await usermodel_1.User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "User Logged Out Successfully" });
};
// Refresh access token
const refreshAccessToken = async (req, res) => {
    const incomingreftoken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingreftoken) {
        return res.status(400).json({ message: "Unauthorized request" });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingreftoken, process.env.REFRESH_TOKEN_SECRET);
        const user = await usermodel_1.User.findById(decodedToken._id);
        if (!user || incomingreftoken !== user.refreshtoken) {
            return res
                .status(401)
                .json({ message: "Invalid or expired refresh token" });
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());
        const options = { httpOnly: true, secure: true };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ message: "Access token refreshed successfully" });
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid refresh token",
            error: error.message,
        });
    }
};
