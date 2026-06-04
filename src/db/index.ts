import { env } from "./../configs/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema/app";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
