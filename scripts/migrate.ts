import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString });
try {
  const sql = await readFile(resolve("drizzle/0001_phase_one.sql"), "utf8");
  await pool.query(sql);
  console.log("Phase 1 schema is ready");
} finally {
  await pool.end();
}
