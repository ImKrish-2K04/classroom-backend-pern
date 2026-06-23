import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { departments } from "../db/schema/index.js";

const getAllDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const departmentsList = await db
    .select({
      code: departments.code,
      name: departments.name,
    })
    .from(departments)
    .orderBy(departments.name);

  return res.status(200).json({
    data: departmentsList,
  });
};

export { getAllDepartments };
