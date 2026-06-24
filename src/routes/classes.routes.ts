import { Router } from "express";
import catchAsync from "../lib/catchAsync";
import { createClass } from "../controllers/classes.controller";

const router = Router();

router.post("/", catchAsync(createClass));

export default router;
