import { Router } from "express";
import catchAsync from "../lib/catchAsync.js";
import { getAllDepartments } from "../controllers/departments.controller.js";

const router = Router();

router.get("/", catchAsync(getAllDepartments));

export default router;
