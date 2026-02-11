const { Octokit } = require('@octokit/rest');
const logger = require('../config/logger');

class GitHubService {
  constructor(accessToken) {
    this.octokit = new Octokit({
      auth: accessToken,
      baseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
      timeout: parseInt(process.env.GITHUB_API_TIMEOUT, 10) || 10000,
      log: {
        debug: () => {},
        info: () => {},
        warn: (msg) => logger.warn(msg),
        error: (msg) => logger.error(msg),
      },
    });
  }

  /**
   * Fetch all repositories for the authenticated user
   */
  async getUserRepositories(options = {}) {
    try {
      const {
        type = 'all', // 'all', 'owner', 'member', 'public', 'private', 'forks'
        sort = 'updated',
        direction = 'desc',
        perPage = 100,
      } = options;

      const repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        // eslint-disable-next-line no-await-in-loop
        const response = await this.octokit.repos.listForAuthenticatedUser({
          type,
          sort,
          direction,
          per_page: perPage,
          page,
        });

        repos.push(...response.data);

        if (response.data.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }

      logger.info(`Fetched ${repos.length} repositories from GitHub`);
      return repos;
    } catch (error) {
      logger.error('Error fetching user repositories:', error);
      throw error;
    }
  }

  /**
   * Get language statistics for a repository
   */
  async getRepositoryLanguages(owner, repo) {
    try {
      const response = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });

      const languages = response.data;
      const total = Object.values(languages).reduce(
        (sum, bytes) => sum + bytes,
        0,
      );

      return Object.entries(languages).map(([name, bytes]) => ({
        name,
        bytes,
        percentage: total > 0 ? ((bytes / total) * 100).toFixed(2) : 0,
      }));
    } catch (error) {
      logger.error(
        `Error fetching languages for ${owner}/${repo}:`,
        error.message,
      );
      return [];
    }
  }

  /**
   * Get clone statistics for a repository (requires repo scope)
   */
  async getCloneStats(owner, repo) {
    try {
      const response = await this.octokit.repos.getClones({
        owner,
        repo,
        per: 'week',
      });

      return {
        total_clones: response.data.count,
        unique_clones: response.data.uniques,
        clones: response.data.clones,
      };
    } catch (error) {
      // Not all repos have clone stats (e.g., forks, private repos you don't own)
      logger.debug(`Clone stats not available for ${owner}/${repo}`);
      return null;
    }
  }

  /**
   * Get repository traffic stats
   */
  async getTrafficStats(owner, repo) {
    try {
      const [views, clones, referrers, paths] = await Promise.all([
        this.octokit.repos
          .getViews({ owner, repo, per: 'week' })
          .catch(() => null),
        this.octokit.repos
          .getClones({ owner, repo, per: 'week' })
          .catch(() => null),
        this.octokit.repos.getTopReferrers({ owner, repo }).catch(() => null),
        this.octokit.repos.getTopPaths({ owner, repo }).catch(() => null),
      ]);

      return {
        views: views?.data,
        clones: clones?.data,
        referrers: referrers?.data,
        paths: paths?.data,
      };
    } catch (error) {
      logger.debug(`Traffic stats not available for ${owner}/${repo}`);
      return null;
    }
  }

  /**
   * Get repository topics
   */
  async getRepositoryTopics(owner, repo) {
    try {
      const response = await this.octokit.repos.getAllTopics({
        owner,
        repo,
      });
      return response.data.names || [];
    } catch (error) {
      logger.debug(`Topics not available for ${owner}/${repo}`);
      return [];
    }
  }

  /**
   * Get repository README
   */
  async getRepositoryReadme(owner, repo) {
    try {
      const response = await this.octokit.repos.getReadme({
        owner,
        repo,
      });

      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString(
        'utf-8',
      );
      return content;
    } catch (error) {
      logger.debug(`README not available for ${owner}/${repo}`);
      return null;
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimit() {
    try {
      const response = await this.octokit.rateLimit.get();
      return {
        limit: response.data.rate.limit,
        remaining: response.data.rate.remaining,
        reset: new Date(response.data.rate.reset * 1000),
        used: response.data.rate.used,
      };
    } catch (error) {
      logger.error('Error fetching rate limit:', error);
      return null;
    }
  }

  /**
   * Fetch complete repository data including languages and stats
   */
  async getCompleteRepositoryData(repo) {
    try {
      const owner = repo.owner.login;
      const repoName = repo.name;

      const [languages, topics] = await Promise.all([
        this.getRepositoryLanguages(owner, repoName),
        this.getRepositoryTopics(owner, repoName),
      ]);

      // Only fetch traffic stats for repos you own
      let traffic = null;
      if (repo.permissions && repo.permissions.push) {
        traffic = await this.getTrafficStats(owner, repoName);
      }

      return {
        repository: repo,
        languages,
        topics,
        traffic,
      };
    } catch (error) {
      logger.error(
        `Error fetching complete data for ${repo.full_name}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Batch fetch repository data with rate limiting
   */
  async batchFetchRepositories(repos, batchSize = 10) {
    const results = [];

    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      // eslint-disable-next-line no-await-in-loop
      const batchResults = await Promise.allSettled(
        batch.map((repo) => this.getCompleteRepositoryData(repo)),
      );

      results.push(
        ...batchResults.map((result, idx) => ({
          repo: batch[idx],
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null,
        })),
      );

      // Check rate limit after each batch
      // eslint-disable-next-line no-await-in-loop
      const rateLimit = await this.getRateLimit();
      if (rateLimit && rateLimit.remaining < 100) {
        logger.warn(
          `GitHub API rate limit low: ${rateLimit.remaining} remaining`,
        );
        // Wait if needed
        if (rateLimit.remaining < 10) {
          const waitTime = rateLimit.reset - new Date() + 1000;
          logger.info(`Waiting ${waitTime}ms for rate limit reset`);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => {
            setTimeout(resolve, waitTime);
          });
        }
      }
    }

    return results;
  }
}

module.exports = GitHubService;
