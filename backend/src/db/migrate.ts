import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import db from '../modules/shared/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

const splitSqlStatements = (sql: string) => {
  const statements: string[] = [];
  let current = '';
  let quote: "'" | '"' | null = null;
  let dollarTag: string | null = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql.slice(index);

    if (!quote && !dollarTag && next.startsWith('--')) {
      const end = sql.indexOf('\n', index);
      if (end === -1) break;
      index = end;
      continue;
    }

    if (!quote && !dollarTag && next.startsWith('/*')) {
      const end = sql.indexOf('*/', index + 2);
      if (end === -1) break;
      index = end + 1;
      continue;
    }

    if (!quote && char === '$') {
      const match = next.match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];
        if (dollarTag === tag) {
          dollarTag = null;
        } else if (!dollarTag) {
          dollarTag = tag;
        }
        current += tag;
        index += tag.length - 1;
        continue;
      }
    }

    if (!dollarTag && (char === "'" || char === '"') && sql[index - 1] !== '\\') {
      quote = quote === char ? null : quote || char;
    }

    if (!quote && !dollarTag && char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);
  return statements;
};

const ensureMigrationsTable = async () => {
  await db.pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getAppliedMigrationIds = async () => {
  const result = await db.pool.query('SELECT id FROM schema_migrations');
  return new Set(result.rows.map((row: { id: string }) => row.id));
};

const readMigrationFiles = async () => {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

const applyMigration = async (fileName: string) => {
  const id = fileName.replace(/\.sql$/i, '');
  const sql = await fs.readFile(path.join(migrationsDir, fileName), 'utf8');
  const statements = splitSqlStatements(sql);
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    for (const statement of statements) {
      await client.query(statement);
    }
    await client.query(
      'INSERT INTO schema_migrations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [id, fileName]
    );
    await client.query('COMMIT');
    console.log(`Applied migration: ${fileName}`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
};

export const runMigrations = async () => {
  await ensureMigrationsTable();
  const appliedIds = await getAppliedMigrationIds();
  const files = await readMigrationFiles();

  for (const fileName of files) {
    const id = fileName.replace(/\.sql$/i, '');
    if (!appliedIds.has(id)) {
      await applyMigration(fileName);
      appliedIds.add(id);
    }
  }

  console.log('Database migrations are up to date.');
};

runMigrations()
  .then(() => db.pool.end())
  .catch((error: Error) => {
    console.error('Migration failed:', error.message);
    db.pool.end().finally(() => process.exit(1));
  });
