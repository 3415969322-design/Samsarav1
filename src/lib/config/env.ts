import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("Samsara"),
  APP_URL: z.url().default("http://localhost:3000"),
  AUTH_PASSWORD: z.string().min(1).optional(),
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.url().default("https://api.openai.com/v1"),
  AI_MODEL: z.string().default("gpt-4.1-mini"),
  AI_PROVIDER: z.enum(["local", "openai-compatible"]).default("local"),
  DATABASE_URL: z.string().min(1).optional(),
  INVITE_CODE: z.string().min(1).optional(),
  LOCAL_STORAGE_ROOT: z.string().default("./storage/local"),
  SESSION_SECRET: z.string().min(32).optional(),
  STORAGE_PROVIDER: z.enum(["local", "r2", "s3", "supabase"]).default("local"),
});

export const env = envSchema.parse({
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  AUTH_PASSWORD: process.env.AUTH_PASSWORD,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_MODEL: process.env.AI_MODEL,
  AI_PROVIDER: process.env.AI_PROVIDER,
  DATABASE_URL: process.env.DATABASE_URL,
  INVITE_CODE: process.env.INVITE_CODE,
  LOCAL_STORAGE_ROOT: process.env.LOCAL_STORAGE_ROOT,
  SESSION_SECRET: process.env.SESSION_SECRET,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
});

export type AppEnv = typeof env;
