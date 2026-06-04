import { env } from "./src/configs/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/app.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
