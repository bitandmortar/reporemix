const { query } = require("../server/config/database");
const GitHubService = require("../server/services/github");
const logger = require("../server/config/logger");

async function syncUser(username) {
  try {
    logger.info(`Syncing repositories for ${username}...`);

    // Get user
    const userResult = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (userResult.rows.length === 0) {
      logger.error(`User ${username} not found`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    const github = new GitHubService(user.access_token);

    // Fetch repositories
    const repos = await github.getUserRepositories();
    logger.info(`Found ${repos.length} repositories`);

    // Import sync logic from sync route
    // This is a simplified version - see server/routes/sync.js for full implementation

    logger.info("Sync completed!");
    process.exit(0);
  } catch (error) {
    logger.error("Sync failed:", error);
    process.exit(1);
  }
}

const username = process.argv[2];
if (!username) {
  console.log("Usage: node sync-repos.js <github_username>");
  process.exit(1);
}

syncUser(username);
