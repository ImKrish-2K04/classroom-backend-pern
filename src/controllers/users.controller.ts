import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { user } from "../db/schema/index.js";
import { db } from "../db/index.js";

const getAllUsers = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const MAX_LIMIT = 100;
  const { search, role, page = 1, limit } = req.query;
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
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)),
    );
  }

  if (role) {
    filterConditions.push(
      eq(user.role, role as "student" | "teacher" | "admin"),
    );
  }

  const whereClause =
    filterConditions.length > 0 ? and(...filterConditions) : undefined;

  const usersQuery = db
    .select({
      ...getTableColumns(user),
    })
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt));

  if (noPagination) {
    const usersList = await usersQuery;

    return res.status(200).json({
      data: usersList,
      pagination: null,
    });
  }

  const [countResult, usersList] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause),

    usersQuery.limit(limitPerPage).offset(offset),
  ]);

  const totalCount = Number(countResult[0]?.count ?? 0);

  return res.status(200).json({
    data: usersList,
    pagination: {
      page: currentPage,
      limit: limitPerPage,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitPerPage),
    },
  });
};

export { getAllUsers };
