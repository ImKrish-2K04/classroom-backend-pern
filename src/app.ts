import AgentAPI from "apminsight";
AgentAPI.config();

import express, { Request, Response, NextFunction } from "express";
import subjectsRouter from "./routes/subjects.routes.js";
import departmentsRouter from "./routes/departments.routes.js";
import AppError from "./lib/appError.js";
import cors from "cors";
import { env } from "./configs/config.js";
import { securityMiddleware } from "./middlewares/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter);

app.use("/api/departments", departmentsRouter);

app.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Hello there!",
  });
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const status = isAppError ? err.status : "error";
  const message = isAppError ? err.message : "Something went wrong";
  const isOperational = isAppError ? err.isOperational : false;

  if (isOperational) {
    return res.status(statusCode).json({
      status,
      message,
    });
  }

  console.error("💥 UNHANDLED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
});

export default app;
