import { z } from "zod";

const classScheduleSchema = z.object({
  day: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z
    .string()
    .trim()
    .optional()
    .transform((room) => room ?? ""),
});

const createClassSchema = z.object({
  subjectId: z.uuid(),
  teacherId: z.uuid(),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  capacity: z.coerce.number().int().min(1).max(500).optional(),
  bannerCldPubId: z.string().trim().optional(),
  bannerUrl: z.url().optional(),
  schedules: z.array(classScheduleSchema),
});

export { classScheduleSchema, createClassSchema };
