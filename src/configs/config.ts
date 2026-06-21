import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z
    .string()
    .min(1, { error: "DATABASE_URL env variable is required" }),
  FRONTEND_URL: z.url(),
  ARCJET_KEY: z
    .string()
    .min(1, { error: "ARCJET_KEY env variable is required" }),
  ARCJET_ENV: z
    .enum(["development", "production", "test"], {
      error: "ARCJET_ENV env variable is required",
    })
    .default("development"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(1, { error: "BETTER_AUTH_SECRET env variable is required" }),
  BETTER_AUTH_URL: z.url(),
});

let config = EnvSchema.safeParse(process.env);

if (!config.success) {
  console.error(`Invalid env vars:\n${z.prettifyError(config.error)}`);
  process.exit(1);
}

export const env = config.data;
