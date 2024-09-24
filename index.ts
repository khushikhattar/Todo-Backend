import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express, { Request, Response, NextFunction } from "express";

import userrouter from "./routes/userroutes";
import todorouter from "./routes/todoroutes";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/users", userrouter);
app.use("/api/v1/todos", todorouter);

// Error handling middleware (optional, but useful for catching errors)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).send({
		message: "An error occurred",
		error: process.env.NODE_ENV === "development" ? err.message : {},
	});
});

// Start the server
const PORT = process.env.PORT || 3100;

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
