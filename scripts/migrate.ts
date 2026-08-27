import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnv } from "@bnbagent/sdk";
import { Pool } from "pg";

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

async function main() {
  const pool = new Pool({ connectionString });
  try {
    const sql = await readFile(resolve("drizzle/0001_phase_one.sql"), "utf8");
    await pool.query(sql);
    console.log("Phase 1 schema is ready");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Database migration failed");
  process.exitCode = 1;
});
