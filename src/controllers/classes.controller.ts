import { and, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { date, e164, z } from "zod";

import { db } from "../db/index.js";
import {
  classes,
  subjects,
  user,
  type ClassSchedule,
  type NewClass,
} from "../db/schema/index.js";
import AppError from "../lib/appError.js";
import { createClassSchema } from "../validations/class-schema.js";
import createUniqueInviteCode from "../lib/generateInviteCode.js";

const createClass = async (req: Request, res: Response, next: NextFunction) => {
  const parsedBody = createClassSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(new AppError(400, z.prettifyError(parsedBody.error)));
  }

  const {
    subjectId,
    teacherId,
    name,
    description,
    capacity,
    bannerCldPubId,
    bannerUrl,
    schedules,
  } = parsedBody.data;

  const [[subject], [teacher], inviteCode] = await Promise.all([
    db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1),

    db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, teacherId))
      .limit(1),

    createUniqueInviteCode(),
  ]);

  if (!subject) {
    return next(new AppError(404, "Subject not found"));
  }

  if (!teacher || teacher.role !== "teacher") {
    return next(new AppError(400, "Teacher must be a valid teacher user"));
  }

  const normalizedSchedules: ClassSchedule[] = schedules.map(
    ({ day, startTime, endTime, room }) => {
      const normalizedSchedule: ClassSchedule = {
        day,
        startTime,
        endTime,
      };

      if (room) normalizedSchedule.room = room;

      return normalizedSchedule;
    },
  );

  const newClass: NewClass = {
    subjectId,
    teacherId,
    inviteCode,
    name,
    description,
    capacity,
    bannerCldPubId,
    bannerUrl,
    schedules: normalizedSchedules,
  };

  const [createdClass] = await db.insert(classes).values(newClass).returning({
    id: classes.id,
    inviteCode: classes.inviteCode,
    schedules: classes.schedules,
  });

  if (!createdClass) {
    return next(new AppError(500, "Failed to create class", false));
  }

  return res.status(201).json({
    data: createdClass,
  });
};

const getAllClasses = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const MAX_LIMIT = 100;
  const { search, teacherId, subjectId } = req.query as Record<
    string,
    string | undefined
  >;
  const page = (req.query.page as string | undefined) ?? "1";
  const limit = (req.query.limit as string | undefined) ?? "10";
  const noPagination = !limit;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const limitPerPage = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || 10));
  const offset = (currentPage - 1) * limitPerPage;

  const filterConditions = [];

  if (search) {
    filterConditions.push(ilike(classes.name, `%${search}%`));
  }

  if (teacherId) {
    filterConditions.push(eq(user.id, teacherId));
  }

  if (subjectId) {
    filterConditions.push(eq(subjects.id, subjectId));
  }

  const whereClause =
    filterConditions.length > 0 ? and(...filterConditions) : undefined;

  const classesQuery = db
    .select({
      ...getTableColumns(classes),
      subject: {
        ...getTableColumns(subjects),
      },
      teacher: {
        ...getTableColumns(user),
      },
    })
    .from(classes)
    .leftJoin(subjects, eq(classes.subjectId, subjects.id))
    .leftJoin(user, eq(classes.teacherId, user.id))
    .where(whereClause)
    .orderBy(desc(classes.createdAt));

  if (!noPagination) {
    const classesList = await classesQuery;

    return res.status(200).json({
      data: classesList,
      pagination: null,
    });
  }

  const [countResult, classesList] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(classes)
      .leftJoin(subjects, eq(classes.subjectId, subjects.id))
      .leftJoin(user, eq(classes.teacherId, user.id))
      .where(whereClause),

    classesQuery.limit(limitPerPage).offset(offset),
  ]);

  const totalCount = Number(countResult[0]?.count ?? 0);

  res.status(200).json({
    data: classesList,
    pagination: {
      page: currentPage,
      limit: limitPerPage,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitPerPage),
    },
  });
};

export { createClass, getAllClasses };
