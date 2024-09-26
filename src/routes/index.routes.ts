import { Router } from "express";

import userRouter from "./user.routes";
import todoRouter from "./todo.routes";

const router = Router()

router.use("/users", userRouter);
router.use("/todos", todoRouter);

export default router