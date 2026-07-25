import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

// Fail fast when required DB config is missing
const missingDbVars = [];
if (!process.env.DB_HOST) missingDbVars.push('DB_HOST');
if (!process.env.DB_NAME) missingDbVars.push('DB_NAME');
if (!process.env.DB_USER) missingDbVars.push('DB_USER');

if (missingDbVars.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingDbVars.join(', ')}. ` +
      'Set them in your environment or backend/.env before starting the app.',
  );
}

// Validate environment values to avoid confusing pg errors
const rawPassword = process.env.DB_PASSWORD;
if (rawPassword !== undefined && typeof rawPassword !== 'string') {
  console.warn('Warning: DB_PASSWORD is not a string, coercing to string for pg client');
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  // If password is provided, ensure it's a string to satisfy pg client's checks
  password: rawPassword === undefined ? undefined : String(rawPassword),
});

// Quick sanity check to help debugging when migrations fail due to auth issues
if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER) {
  console.warn('DB config incomplete. Ensure DB_HOST DB_NAME and DB_USER are set in your environment.');
}

export default pool;
