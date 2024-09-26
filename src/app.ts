import express from "express";
import cookieParser from "cookie-parser";

import rootRouter from "./routes/index.routes";
import loggerMiddleware from "./middlewares/logging.middleware";

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware)

// Routes
app.use("/api/v1", rootRouter)

export { app }; // Exporting the app for use in other files
