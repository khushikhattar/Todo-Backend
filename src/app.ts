import cookieParser from "cookie-parser";
import express from "express";
import userrouter from "./routes/userroutes";
import todorouter from "./routes/todoroutes";

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/users", userrouter);
app.use("/api/v1/todos", todorouter);

export { app }; // Exporting the app for use in other files
