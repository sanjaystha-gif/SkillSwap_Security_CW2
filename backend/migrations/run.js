import fs from 'fs';
import path from 'path';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function runMigrations() {
  try {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));

    files.sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info({ file }, 'running migration');
      await pool.query(sql);
    }

    logger.info('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'migration failed');
    process.exit(1);
  }
}

runMigrations();
