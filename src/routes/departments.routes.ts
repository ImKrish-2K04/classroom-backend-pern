import { Router } from "express";
import catchAsync from "../lib/catchAsync";
import { getAllDepartments } from "../controllers/departments.controller";

const router = Router();

router.get("/", catchAsync(getAllDepartments));

export default router;
