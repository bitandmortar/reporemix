const GitHubService = require('./github');
const OntologyService = require('./ontology');
const EmbeddingService = require('./embeddings');
const logger = require('../config/logger');
const { query, transaction } = require('../config/database');

async function syncSingleRepository(userId, repo, github, options = {}) {
  const transactionFn = options.transactionFn || transaction;

  return transactionFn(async (client) => {
    const [languages, topics] = await Promise.all([
      github.getRepositoryLanguages(repo.owner.login, repo.name),
      github.getRepositoryTopics(repo.owner.login, repo.name),
    ]);

    const repoResult = await client.query(
      `INSERT INTO repositories (
        user_id, github_id, name, full_name, description, owner,
        is_fork, is_private, parent_repo, source_repo,
        stars, forks_count, watchers, open_issues, size_kb,
        primary_language, default_branch, license, homepage_url,
        clone_url, ssh_url, topics, has_issues, has_wiki, has_pages,
        archived, disabled, created_at, updated_at, pushed_at, last_synced_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, CURRENT_TIMESTAMP
      )
      ON CONFLICT (github_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        stars = EXCLUDED.stars,
        forks_count = EXCLUDED.forks_count,
        watchers = EXCLUDED.watchers,
        open_issues = EXCLUDED.open_issues,
        size_kb = EXCLUDED.size_kb,
        primary_language = EXCLUDED.primary_language,
        topics = EXCLUDED.topics,
        updated_at = EXCLUDED.updated_at,
        pushed_at = EXCLUDED.pushed_at,
        last_synced_at = CURRENT_TIMESTAMP
      RETURNING id`,
      [
        userId,
        repo.id,
        repo.name,
        repo.full_name,
        repo.description,
        repo.owner.login,
        repo.fork,
        repo.private,
        repo.parent?.full_name,
        repo.source?.full_name,
        repo.stargazers_count,
        repo.forks_count,
        repo.watchers_count,
        repo.open_issues_count,
        repo.size,
        repo.language,
        repo.default_branch,
        repo.license?.name,
        repo.homepage,
        repo.clone_url,
        repo.ssh_url,
        topics,
        repo.has_issues,
        repo.has_wiki,
        repo.has_pages,
        repo.archived,
        repo.disabled,
        repo.created_at,
        repo.updated_at,
        repo.pushed_at,
      ],
    );

    const repositoryId = repoResult.rows[0].id;

    await client.query('DELETE FROM languages WHERE repository_id = $1', [
      repositoryId,
    ]);

    if (languages.length > 0) {
      const values = languages
        .map(
          (lang, idx) => `($1, $${idx * 3 + 2}, $${idx * 3 + 3}, $${idx * 3 + 4})`,
        )
        .join(',');
      const params = [repositoryId];
      languages.forEach((lang) => {
        params.push(lang.name, lang.bytes, lang.percentage);
      });

      await client.query(
        `INSERT INTO languages (repository_id, name, bytes, percentage) VALUES ${values}`,
        params,
      );
    }

    const repoData = {
      ...repo,
      primary_language: repo.language,
      topics,
      size_kb: repo.size,
      homepage_url: repo.homepage,
    };

    const analysis = OntologyService.analyzeRepository(repoData);

    await client.query(
      `INSERT INTO repository_categories (
        repository_id, category, vibe_score, complexity_score,
        install_difficulty, debug_time_hours, learning_curve,
        maintenance_load, confidence, reasoning
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (repository_id) DO UPDATE SET
        category = EXCLUDED.category,
        vibe_score = EXCLUDED.vibe_score,
        complexity_score = EXCLUDED.complexity_score,
        install_difficulty = EXCLUDED.install_difficulty,
        debug_time_hours = EXCLUDED.debug_time_hours,
        learning_curve = EXCLUDED.learning_curve,
        maintenance_load = EXCLUDED.maintenance_load,
        confidence = EXCLUDED.confidence,
        reasoning = EXCLUDED.reasoning,
        updated_at = CURRENT_TIMESTAMP`,
      [
        repositoryId,
        analysis.category,
        analysis.vibe_score,
        analysis.complexity_score,
        analysis.install_difficulty,
        analysis.debug_time_hours,
        analysis.learning_curve,
        analysis.maintenance_load,
        analysis.confidence,
        analysis.reasoning,
      ],
    );

    const embeddingVector = EmbeddingService.computeEmbeddingVector(repoData, analysis);
    const formattedVector = `[${embeddingVector.map((value) => {
      const safe = Number.isFinite(value) ? value : 0;
      return safe.toFixed(6);
    }).join(',')}]`;

    await client.query(
      `
      INSERT INTO repository_embeddings (repository_id, model, embedding_vector)
      VALUES ($1, $2, $3::vector)
      ON CONFLICT (repository_id) DO UPDATE SET
        model = EXCLUDED.model,
        embedding_vector = EXCLUDED.embedding_vector,
        created_at = CURRENT_TIMESTAMP
      `,
      [repositoryId, EmbeddingService.EMBEDDING_MODEL, formattedVector],
    );

    await client.query(
      'INSERT INTO star_history (repository_id, star_count, timestamp) VALUES ($1, $2, CURRENT_TIMESTAMP)',
      [repositoryId, repo.stargazers_count],
    );
  });
}

async function syncRepositoriesBackground(
  userId,
  accessToken,
  jobId,
  options = {},
) {
  const github = options.github || new GitHubService(accessToken);
  const queryFn = options.queryFn || query;
  const syncSingleFn = options.syncSingleRepositoryFn || syncSingleRepository;

  try {
    logger.info(`Starting repository sync for user ${userId}`);

    const repos = await github.getUserRepositories({
      type: 'all',
      sort: 'updated',
    });

    await queryFn('UPDATE sync_jobs SET total_repos = $1 WHERE id = $2', [
      repos.length,
      jobId,
    ]);

    let synced = 0;
    for (let i = 0; i < repos.length; i += 1) {
      const repo = repos[i];
      try {
        // Allow sequential repository sync updates while keeping the loop readable
        /* eslint-disable-next-line no-await-in-loop */
        await syncSingleFn(userId, repo, github, options);
        synced += 1;

        if (synced % 10 === 0) {
          /* eslint-disable-next-line no-await-in-loop */
          await queryFn(
            'UPDATE sync_jobs SET repos_synced = $1 WHERE id = $2',
            [synced, jobId],
          );
        }
      } catch (err) {
        logger.error(`Error syncing repository ${repo.full_name}:`, err);
      }
    }

    await queryFn(
      `UPDATE sync_jobs 
       SET status = 'completed', 
           repos_synced = $1, 
           completed_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [synced, jobId],
    );

    await queryFn(
      'UPDATE users SET last_synced_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId],
    );

    logger.info(
      `Completed sync for user ${userId}: ${synced}/${repos.length} repositories`,
    );
  } catch (error) {
    logger.error(`Sync failed for user ${userId}:`, error);
    await queryFn(
      `UPDATE sync_jobs 
       SET status = 'failed', 
           error_message = $1, 
           completed_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [error.message, jobId],
    );
  }
}

module.exports = {
  syncRepositoriesBackground,
  syncSingleRepository,
};
