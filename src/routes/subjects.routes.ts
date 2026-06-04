import { Router } from "express";
import catchAsync from "../lib/catchAsync";
import { getAllSubjects } from "../controllers/subjects.controller";

const router = Router();

// ! Get all subjects with optional search, filtering, pagination and sorting
router.get("/", catchAsync(getAllSubjects));

export default router;
