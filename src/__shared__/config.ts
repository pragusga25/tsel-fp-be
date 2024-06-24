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
  PORT: optional(string(), '8080'),
  JWT_SECRET: string([minLength(8)]),
  JWT_EXPIRES_IN: optional(picklist(['1h', '1d', '7d', '30d']), '1d'),
  AWS_REGION: optional(string(), 'ap-southeast-3'),
  AWS_ACCESS_KEY_ID: string(),
  AWS_SECRET_ACCESS_KEY: string(),
  AWS_SESSION_TOKEN: optional(string()),
  DATABASE_URL: string(),
  NODE_ENV: optional(picklist(['development', 'production']), 'development'),
  API_KEY: string('API key must be a string', [
    minLength(8, 'API key must be at least 8 characters long'),
  ]),
  CORS_ORIGINS: optional(string(), 'http://localhost:5173'),
  AWS_SES_SENDER_EMAIL: string([email()]),
  FE_REQUEST_PAGE_URL: string(),
  SENDGRID_API_KEY: optional(string()),
  SENDGRID_SENDER_EMAIL: optional(string()),
});

export const config = parse(envVarsSchema, process.env);
