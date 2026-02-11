const { query } = require("../server/config/database");
const logger = require("../server/config/logger");

async function seed() {
  try {
    logger.info("Starting database seeding...");

    // This is a placeholder - in production, data comes from GitHub
    logger.info("Seed complete! Use GitHub OAuth to populate real data.");
    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
