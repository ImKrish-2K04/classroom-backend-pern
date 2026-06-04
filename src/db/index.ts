import { env } from "./../configs/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql as unknown as any);
