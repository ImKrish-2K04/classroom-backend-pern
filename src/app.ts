import express, { Request, Response, NextFunction } from "express";
import subjectsRouter from "./routes/subjects.routes";
import AppError from "./lib/appError";
import cors from "cors";
import { env } from "./configs/config";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/subjects", subjectsRouter);

app.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Hello there!",
  });
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("💥 UNHANDLED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
});

export default app;
