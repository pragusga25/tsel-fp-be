import { config as c } from 'dotenv';
import {
  object,
  parse,
  optional,
  string,
  minLength,
  picklist,
  email,
  url,
} from 'valibot';
c();

const envVarsSchema = object({
  JWT_SECRET: string('JWT secret must be a string', [
    minLength(8, 'JWT secret must be at least 8 characters long'),
  ]),
  AWS_ACCESS_KEY_ID: string('AWS access key id must be a string'),
  AWS_SECRET_ACCESS_KEY: string('AWS secret access key must be a string'),
  DATABASE_URL: string('Database url must be a string'),
  API_KEY: string('API key must be a string', [
    minLength(8, 'API key must be at least 8 characters long'),
  ]),
  FE_REQUEST_PAGE_URL: string('FE request page url must be a string', [
    url('FE request page url must be a valid url'),
  ]),
  CORS_ORIGINS: string('CORS origins must be a string of comma-separated URLs'),

  PORT: optional(string('Port must be a string'), '8080'),
  JWT_EXPIRES_IN: optional(picklist(['1h', '1d', '7d', '30d']), '1d'),
  AWS_REGION: optional(string(), 'ap-southeast-3'),
  AWS_SESSION_TOKEN: optional(string()),
  NODE_ENV: optional(picklist(['development', 'production']), 'development'),
  AWS_SES_SENDER_EMAIL: optional(string([email()])),
  SENDGRID_API_KEY: optional(string()),
  SENDGRID_SENDER_EMAIL: optional(string()),
  PROTOCOL: optional(picklist(['http', 'https']), 'http'),
});

export const config = parse(envVarsSchema, process.env);
