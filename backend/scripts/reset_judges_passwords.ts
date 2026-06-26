import { pool } from "../src/db/pool.js";
import { hashPassword } from "../src/utils/password.js";

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function main() {
  console.log("Resetting passwords for judges (will print generated passwords)");

  const result = await pool.query<{ id: string; login: string | null; email: string | null }>(
    `SELECT id, login, email FROM judges WHERE status = 'active'`
  );

  const output: Array<{ id: string; login: string | null; email: string | null; password: string }> = [];

  for (const row of result.rows) {
    const password = generatePassword(12);
    const hash = await hashPassword(password);

    await pool.query(
      `UPDATE judges SET password_hash = $1, must_change_password = true, updated_at = now() WHERE id = $2`,
      [hash, row.id]
    );

    output.push({ id: row.id, login: row.login, email: row.email, password });
  }

  console.log("=== Generated passwords ===");
  console.log(JSON.stringify(output, null, 2));

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
