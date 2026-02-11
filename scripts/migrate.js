const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost/reporemix",
});

async function runMigration(direction = "up") {
  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Running migrations ${direction}...`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    try {
      console.log(`Executing ${file}...`);
      await pool.query(sql);
      console.log(`✓ ${file} completed`);
    } catch (error) {
      console.error(`✗ Error in ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log("All migrations completed successfully!");
  await pool.end();
}

async function createMigration(name) {
  if (!name) {
    console.error("Please provide a migration name");
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  const nextNumber = String(files.length + 1).padStart(3, "0");

  const filename = `${nextNumber}_${name.replace(/\s+/g, "_")}.sql`;
  const filepath = path.join(migrationsDir, filename);

  const template = `-- Migration: ${filename}
-- Description: ${name}
-- Created: ${new Date().toISOString().split("T")[0]}

-- Add your migration SQL here
`;

  fs.writeFileSync(filepath, template);
  console.log(`Created migration: ${filename}`);
}

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "up":
    runMigration("up");
    break;
  case "down":
    console.log(
      "Down migrations not implemented. Use psql to rollback manually.",
    );
    break;
  case "create":
    createMigration(arg);
    break;
  default:
    console.log("Usage: node migrate.js [up|down|create] [name]");
    process.exit(1);
}
