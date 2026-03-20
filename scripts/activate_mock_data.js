const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://juju:admin@127.0.0.1:5434/pastyche',
});

async function activate() {
  try {
    console.log('🚀 Activating RepoRemix with Consilience Sample Data...');

    // 1. Ensure User 'juju' exists (already done, but let's be safe)
    const userRes = await pool.query("SELECT id FROM users WHERE username = 'juju'");
    if (userRes.rows.length === 0) {
      console.log('Creating user juju...');
      await pool.query("INSERT INTO users (username, github_id, role) VALUES ('juju', 12345, 'admin')");
    }
    const userId = (await pool.query("SELECT id FROM users WHERE username = 'juju'")).rows[0].id;

    // 2. Create Owner
    console.log('Creating owner bitandmortar...');
    const ownerRes = await pool.query(`
      INSERT INTO owners (type, github_id, login, avatar_url, html_url)
      VALUES ('organization', 999001, 'bitandmortar', 'https://github.com/bitandmortar.png', 'https://github.com/bitandmortar')
      ON CONFLICT (github_id) DO UPDATE SET login = EXCLUDED.login
      RETURNING id
    `);
    const ownerId = ownerRes.rows[0].id;

    // 3. Create Repositories
    const repos = [
      {
        github_id: 101,
        name: 'Apollo',
        full_name: 'bitandmortar/apollo',
        description: 'The central nervous system and ingress bridge for the Consilience Lattice.',
        primary_language: 'Python',
        topics: ['fastapi', 'proxy', 'auth']
      },
      {
        github_id: 102,
        name: 'RepoRemix',
        full_name: 'bitandmortar/reporemix',
        description: 'Vortex Engine for repository visualization and aesthetic management.',
        primary_language: 'JavaScript',
        topics: ['react', 'node', 'atlas']
      },
      {
        github_id: 103,
        name: 'Consilience-Core',
        full_name: 'bitandmortar/consilience-core',
        description: 'The epistemic integration layer for multi-agent semantic alignment.',
        primary_language: 'Python',
        topics: ['ai', 'nlp', 'knowledge-graph']
      }
    ];

    for (const repo of repos) {
      console.log(`Injecting repository: ${repo.name}...`);
      await pool.query(`
        INSERT INTO repositories (user_id, owner_id, github_id, name, full_name, description, primary_language, topics, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (github_id) DO UPDATE SET description = EXCLUDED.description
      `, [userId, ownerId, repo.github_id, repo.name, repo.full_name, repo.description, repo.primary_language, repo.topics]);
    }

    console.log('✅ Activation Complete. RepoRemix is now seeded.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Activation Failed:', err);
    process.exit(1);
  }
}

activate();
