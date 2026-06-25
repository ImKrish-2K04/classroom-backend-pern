import { randomBytes } from "crypto";
import { db } from "../db/index.js";
import { classes } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import AppError from "./appError.js";

const generateInviteCode = () => randomBytes(5).toString("base64url");

const createUniqueInviteCode = async () => {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const inviteCode = generateInviteCode();
    const [existingClass] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.inviteCode, inviteCode))
      .limit(1);

    if (!existingClass) return inviteCode;
  }

  throw new AppError(500, "Failed to generate invite code", false);
};

export default createUniqueInviteCode;
