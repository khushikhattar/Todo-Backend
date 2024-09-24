"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usermodel_1 = require("../models/usermodel");
const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ message: "Unauthorized Request" });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await usermodel_1.User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ message: "Invalid Access Token" });
        }
        req.user = user; // Type assertion since `user` is a custom property
        next();
    }
    catch (error) {
        return res
            .status(401)
            .json({ message: error?.message || "Invalid access token" });
    }
};
exports.verifyJWT = verifyJWT;
