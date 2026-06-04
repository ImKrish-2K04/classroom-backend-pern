import { z } from "zod";
import type { Config } from "drizzle-kit";

const DATABASE_URL = z.string().min(1).safeParse(process.env.DATABASE_URL);

if (!DATABASE_URL.success)
  throw new Error("DATABASE_URL is missing or invalid");

export default {
  schema: "./src/db/schema/app.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL.data,
  },
} satisfies Config;
