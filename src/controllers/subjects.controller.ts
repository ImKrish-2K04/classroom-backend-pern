import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const getAllSubjects = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const MAX_LIMIT = 100;
  const { search, department, page = 1, limit } = req.query;
  const noPagination = !limit;
  const currentPage = Math.max(1, parseInt(page as string) || 1);
  const limitPerPage = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limit as string) || 10),
  );
  const offset = (currentPage - 1) * limitPerPage;

  const filterConditions = [];

  if (search) {
    filterConditions.push(
      or(
        ilike(subjects.name, `%${search}%`),
        ilike(subjects.code, `%${search}%`),
      ),
    );
  }

  if (department) {
    filterConditions.push(ilike(departments.code, `${department}`));
  }

  const whereClause =
    filterConditions.length > 0 ? and(...filterConditions) : undefined;

  const subjectsQuery = db
    .select({
      ...getTableColumns(subjects),
      department: { ...getTableColumns(departments) },
    })
    .from(subjects)
    .leftJoin(departments, eq(subjects.deptId, departments.id))
    .where(whereClause)
    .orderBy(desc(subjects.createdAt));

  if (noPagination) {
    const subjectsList = await subjectsQuery;

    return res.status(200).json({
      data: subjectsList,
      pagination: null,
    });
  }

  const [countResult, subjectsList] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.deptId, departments.id))
      .where(whereClause),

    subjectsQuery.limit(limitPerPage).offset(offset),
  ]);

  const totalCount = Number(countResult[0]?.count ?? 0);

  return res.status(200).json({
    data: subjectsList,
    pagination: {
      page: currentPage,
      limit: limitPerPage,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitPerPage),
    },
  });
};

export { getAllSubjects };
