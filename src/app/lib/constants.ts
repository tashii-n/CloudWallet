import { AppConfig } from "./config.interface";

export const CONFIG: AppConfig = {
  AUTH_BASE_API_URL: process.env.NEXT_PUBLIC_AUTH_BASE_API_URL,
  IDENTIFIER: process.env.NEXT_PUBLIC_IDENTIFIER,
  ENV: process.env.NEXT_PUBLIC_ENV,
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
  BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
};

