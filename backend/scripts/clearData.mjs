import db from '../src/modules/shared/database.js';

(async () => {
  console.log('Starting data truncation (this will permanently delete data)...');
  try {
    await db.pool.query('BEGIN');
    // Truncate kindergartens and cascade to all dependent tables
    await db.pool.query('TRUNCATE TABLE kindergartens RESTART IDENTITY CASCADE');
    await db.pool.query('COMMIT');
    console.log('Successfully truncated kindergartens and related data.');
  } catch (err) {
    await db.pool.query('ROLLBACK');
    console.error('Error truncating data:', err.message || err);
    process.exit(1);
  }
  process.exit(0);
})();
