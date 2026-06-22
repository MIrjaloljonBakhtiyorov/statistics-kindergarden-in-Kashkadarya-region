import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

export async function checkDatabase() {
  const result = await pool.query<{ now: Date }>("SELECT now()");
  return result.rows[0]?.now;
}
