import { config as c } from 'dotenv';
import {
  object,
  parse,
  optional,
  string,
  minLength,
  picklist,
  email,
} from 'valibot';
c();

const envVarsSchema = object({
  JWT_SECRET: string([minLength(8)]),
  AWS_ACCESS_KEY_ID: string(),
  AWS_SECRET_ACCESS_KEY: string(),
  DATABASE_URL: string(),
  API_KEY: string('API key must be a string', [
    minLength(8, 'API key must be at least 8 characters long'),
  ]),
  FE_REQUEST_PAGE_URL: string(),

  PORT: optional(string(), '8080'),
  JWT_EXPIRES_IN: optional(picklist(['1h', '1d', '7d', '30d']), '1d'),
  AWS_REGION: optional(string(), 'ap-southeast-3'),
  AWS_SESSION_TOKEN: optional(string()),
  NODE_ENV: optional(picklist(['development', 'production']), 'development'),
  CORS_ORIGINS: optional(string(), 'http://localhost:5173'),
  AWS_SES_SENDER_EMAIL: optional(string([email()])),
  SENDGRID_API_KEY: optional(string()),
  SENDGRID_SENDER_EMAIL: optional(string()),
});

export const config = parse(envVarsSchema, process.env);
