import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.url(),
  FRONTEND_URL: z.url(),
});

let config = EnvSchema.safeParse(process.env);

if (!config.success) {
  console.error(`Invalid env vars:\n${z.prettifyError(config.error)}`);
  process.exit(1);
}

export const env = config.data;
