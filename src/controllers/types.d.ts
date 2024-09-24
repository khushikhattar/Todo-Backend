// types.d.ts or within your main file
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string;
    };
  }
}
