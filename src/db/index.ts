import { env } from "./../configs/config.js";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema/app.js";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
