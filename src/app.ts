import express from "express";
import cookieParser from "cookie-parser";
import rootRouter from "./routes/index.routes";
import loggerMiddleware from "./middlewares/logging.middleware";
import cors from "cors";
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(
  cors({
    origin: "http://localhost:5173", // Specify the allowed origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allows cookies to be sent with requests
  })
);

// Routes
app.use("/api/v1", rootRouter);

export { app }; // Exporting the app for use in other files
