import { Router } from "express";
import catchAsync from "../lib/catchAsync.js";
import {
  createClass,
  getAllClasses,
} from "../controllers/classes.controller.js";

const router = Router();

router.get("/", catchAsync(getAllClasses));
router.post("/", catchAsync(createClass));

export default router;
