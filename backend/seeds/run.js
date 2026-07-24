import fs from 'fs';
import path from 'path';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function runSeeds() {
  try {
    const seedsDir = path.join(process.cwd(), 'seeds');
    const files = fs.readdirSync(seedsDir).filter((file) => file.endsWith('.sql'));

    files.sort();

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`Running seed: ${file}`);
      await pool.query(sql);
    }

    console.log('✓ All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

runSeeds();
