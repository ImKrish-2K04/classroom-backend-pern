import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Hello there!",
  });
});

export default app;
