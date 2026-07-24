import fs from 'fs';
import path from 'path';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function runSeeds() {
  try {
    const seedsDir = path.join(process.cwd(), 'seeds');
    const files = fs.readdirSync(seedsDir).filter((file) => file.endsWith('.sql'));

    files.sort();

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info({ file }, 'running seed');
      await pool.query(sql);
    }

    logger.info('All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'seed failed');
    process.exit(1);
  }
}

runSeeds();
