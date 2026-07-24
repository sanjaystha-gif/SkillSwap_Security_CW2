import fs from 'fs';
import path from 'path';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  try {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));

    files.sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`Running migration: ${file}`);
      await pool.query(sql);
    }

    console.log('✓ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
