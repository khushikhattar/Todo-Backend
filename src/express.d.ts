// src/types/express.d.ts
import { User } from "../models/usermodel"; // Adjust the path as necessary

declare global {
  namespace Express {
    interface Request {
      user?: User; // Make sure to replace `User` with the actual type if necessary
    }
  }
}
