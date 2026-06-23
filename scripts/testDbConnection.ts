import { env } from "../src/configs/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(env.DATABASE_URL);

async function main() {
  try {
    console.log("Testing DB connection to:", env.DATABASE_URL.split("@")[1]);
    const res = await sql`SELECT 1 as ok`;
    console.log("Query result:", res);
    process.exit(0);
  } catch (err: any) {
    console.error("DB test failed:", err?.message ?? err);
    if (err?.cause) console.error("Cause:", err.cause);
    console.error(err?.stack ?? err);
    process.exit(1);
  }
}

main();
