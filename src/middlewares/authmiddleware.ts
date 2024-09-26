import jwt from "jsonwebtoken";
import { User } from "../models/usermodel";
import { Request, Response, NextFunction } from "express";
interface UserPayload {
  _id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(400).json({ message: "Unauthorized Request" });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserPayload;

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid Access Token" });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
    };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: (error as Error)?.message || "Invalid access token" });
  }
};
