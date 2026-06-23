import { Router } from "express";
import catchAsync from "../lib/catchAsync.js";
import { getAllSubjects } from "../controllers/subjects.controller.js";

const router = Router();

// ! Get all subjects with optional search, filtering, pagination and sorting
router.get("/", catchAsync(getAllSubjects));

export default router;
