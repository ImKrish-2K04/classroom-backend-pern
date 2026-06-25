import { Router } from "express";
import catchAsync from "../lib/catchAsync.js";
import { createClass } from "../controllers/classes.controller.js";

const router = Router();

router.post("/", catchAsync(createClass));

export default router;
