import jwt from "jsonwebtoken";
import { User } from "../models/usermodel";
import { Request, Response, NextFunction } from "express"; // Import types

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
      process.env.ACCESS_TOKEN_SECRET as string
    );

    const user = await User.findById((decodedToken as any)?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid Access Token" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: (error as Error)?.message || "Invalid access token" });
  }
};
