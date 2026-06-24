import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

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

export { createClass };
