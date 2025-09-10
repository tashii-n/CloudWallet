import { AppConfig } from "./config.interface";

export const CONFIG: AppConfig = {
  AUTH_BASE_API_URL: process.env.NEXT_PUBLIC_AUTH_BASE_API_URL,
  IDENTIFIER: process.env.NEXT_PUBLIC_IDENTIFIER,
  ENV: process.env.NEXT_PUBLIC_ENV,
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
  BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL,
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  REGULA_URL: process.env.NEXT_PUBLIC_REGULA_URL,
};

export const CONNECTION_TYPES = {
  REVOCATION_CREDENTIAL: "Revocation Credential",
  // Add other types here
} as const;


export const REVOCATION_EXCLUDED_LABELS = {
  REVOCATION: "Revocation",
  REVOCATION_SP: "Revocation SP",
  RSP: "RSP",
  // Add other excluded labels here
} as const;


