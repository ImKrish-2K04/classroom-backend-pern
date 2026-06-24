import { Router } from "express";
import catchAsync from "../lib/catchAsync.js";
import { getAllUsers } from "../controllers/users.controller.js";

const router = Router();

router.get("/", catchAsync(getAllUsers));

export default router;
