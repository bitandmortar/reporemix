const express = require('express');
const { query } = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// Middleware to ensure authentication
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
};

/**
 * Get all repositories for the authenticated user
 */
router.get('/repositories', requireAuth, async (req, res) => {
  try {
    const {
      category,
      language,
      is_fork: isFork,
      sort = 'updated',
      order = 'desc',
      search,
      limit = 100,
      offset = 0,
    } = req.query;

    let queryText = `
    SELECT 
      r.*,
      rc.category,
      rc.vibe_score,
      rc.complexity_score,
      rc.install_difficulty,
      rc.debug_time_hours,
      rc.learning_curve,
      rc.maintenance_load,
      rc.confidence,
      emb.embedding_model,
      emb.embedding_vector,
      json_agg(DISTINCT jsonb_build_object('name', l.name, 'percentage', l.percentage)) 
        FILTER (WHERE l.id IS NOT NULL) as languages
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      LEFT JOIN languages l ON r.id = l.repository_id
      LEFT JOIN LATERAL (
        SELECT model AS embedding_model,
               array_to_json(embedding_vector) AS embedding_vector
        FROM repository_embeddings re
        WHERE re.repository_id = r.id
        ORDER BY created_at DESC
        LIMIT 1
      ) emb ON true
      WHERE r.user_id = $1
    `;

    const params = [req.user.id];
    let paramIndex = 2;

    // Apply filters
    if (category) {
      queryText += ` AND rc.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (language) {
      queryText += ` AND r.primary_language = $${paramIndex}`;
      params.push(language);
      paramIndex++;
    }

    if (isFork !== undefined) {
      queryText += ` AND r.is_fork = $${paramIndex}`;
      params.push(isFork === 'true');
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (
        r.name ILIKE $${paramIndex} OR 
        r.description ILIKE $${paramIndex} OR 
        $${paramIndex} = ANY(r.topics)
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText
      += ' GROUP BY r.id, rc.category, rc.vibe_score, rc.complexity_score, rc.install_difficulty, rc.debug_time_hours, rc.learning_curve, rc.maintenance_load, rc.confidence';

    // Apply sorting
    const sortColumn = {
      name: 'r.name',
      stars: 'r.stars',
      updated: 'r.updated_at',
      created: 'r.created_at',
      vibe: 'rc.vibe_score',
    }[sort] || 'r.updated_at';

    queryText += ` ORDER BY ${sortColumn} ${order.toUpperCase()}`;
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM repositories WHERE user_id = $1', [req.user.id]);

    const parseEmbeddingVector = (value) => {
      if (!value) {
        return null;
      }
      if (Array.isArray(value)) {
        return value.map((n) => Number(n));
      }
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((n) => Number(n));
        }
      } catch (error) {
        // Ignore malformed JSON
      }
      return null;
    };

    const repositories = result.rows.map((row) => ({
      ...row,
      embedding_vector: parseEmbeddingVector(row.embedding_vector),
    }));

    return res.json({
      repositories,
      total: parseInt(countResult.rows[0].count, 10),
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    return res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

/**
 * Get a single repository by ID
 */
router.get('/repositories/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        r.*,
        rc.category,
        rc.vibe_score,
        rc.complexity_score,
        rc.install_difficulty,
        rc.debug_time_hours,
        rc.learning_curve,
        rc.maintenance_load,
        rc.confidence,
        rc.reasoning,
        json_agg(DISTINCT jsonb_build_object('name', l.name, 'bytes', l.bytes, 'percentage', l.percentage)) 
          FILTER (WHERE l.id IS NOT NULL) as languages
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      LEFT JOIN languages l ON r.id = l.repository_id
      WHERE r.id = $1 AND r.user_id = $2
      GROUP BY r.id, rc.category, rc.vibe_score, rc.complexity_score, 
               rc.install_difficulty, rc.debug_time_hours, rc.learning_curve, 
               rc.maintenance_load, rc.confidence, rc.reasoning`,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching repository:', error);
    return res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

/**
 * Search repositories with full-text search
 */
router.get('/repositories/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await query(
      `SELECT 
        r.*,
        rc.category,
        rc.vibe_score,
        ts_rank(
          to_tsvector('english', COALESCE(r.name, '') || ' ' || COALESCE(r.description, '')),
          plainto_tsquery('english', $2)
        ) as rank
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      WHERE r.user_id = $1
        AND to_tsvector('english', COALESCE(r.name, '') || ' ' || COALESCE(r.description, '')) 
            @@ plainto_tsquery('english', $2)
      ORDER BY rank DESC
      LIMIT 50`,
      [req.user.id, q],
    );

    return res.json(result.rows);
  } catch (error) {
    logger.error('Error searching repositories:', error);
    return res.status(500).json({ error: 'Failed to search repositories' });
  }
});

/**
 * Get analytics overview
 */
router.get('/analytics/overview', requireAuth, async (req, res) => {
  try {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_repos,
        COUNT(*) FILTER (WHERE is_fork = true) as total_forks,
        SUM(stars) as total_stars,
        SUM(forks_count) as total_repo_forks,
        AVG(rc.vibe_score) as avg_vibe_score,
        COUNT(DISTINCT primary_language) as languages_count
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      WHERE r.user_id = $1`,
      [req.user.id],
    );

    const categoryDistribution = await query(
      `SELECT 
        rc.category,
        COUNT(*) as count,
        AVG(rc.vibe_score) as avg_vibe_score
      FROM repositories r
      JOIN repository_categories rc ON r.id = rc.repository_id
      WHERE r.user_id = $1
      GROUP BY rc.category
      ORDER BY count DESC`,
      [req.user.id],
    );

    return res.json({
      overview: stats.rows[0],
      categories: categoryDistribution.rows,
    });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get language distribution
 */
router.get('/analytics/languages', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        l.name,
        COUNT(DISTINCT r.id) as repo_count,
        SUM(l.bytes) as total_bytes,
        AVG(l.percentage) as avg_percentage
      FROM languages l
      JOIN repositories r ON l.repository_id = r.id
      WHERE r.user_id = $1
      GROUP BY l.name
      ORDER BY repo_count DESC, total_bytes DESC
      LIMIT 20`,
      [req.user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching language stats:', error);
    return res.status(500).json({ error: 'Failed to fetch language statistics' });
  }
});

/**
 * Get star history trends
 */
router.get('/analytics/trends', requireAuth, async (req, res) => {
  try {
    const { repo_id: repoId } = req.query;

    let queryText = `
      SELECT 
        DATE(sh.timestamp) as date,
        SUM(sh.star_count) as total_stars,
        COUNT(DISTINCT sh.repository_id) as repos_tracked
      FROM star_history sh
      JOIN repositories r ON sh.repository_id = r.id
      WHERE r.user_id = $1
    `;

    const params = [req.user.id];

    if (repoId) {
      queryText += ' AND sh.repository_id = $2';
      params.push(repoId);
    }

    queryText += `
      GROUP BY DATE(sh.timestamp)
      ORDER BY date DESC
      LIMIT 30
    `;

    const result = await query(queryText, params);

    return res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching trends:', error);
    return res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

/**
 * Get repository network graph data
 */
router.get('/analytics/network', requireAuth, async (req, res) => {
  try {
    // Get repositories as nodes
    const repos = await query(
      `SELECT 
        r.id,
        r.name,
        r.full_name,
        r.stars,
        r.is_fork,
        r.parent_repo,
        rc.category,
        rc.vibe_score
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      WHERE r.user_id = $1`,
      [req.user.id],
    );

    // Get relationships as edges
    const relationships = await query(
      `SELECT 
        rr.source_repo_id,
        rr.target_repo_id,
        rr.relationship_type,
        rr.strength
      FROM repository_relationships rr
      JOIN repositories r ON rr.source_repo_id = r.id
      WHERE r.user_id = $1`,
      [req.user.id],
    );

    // Build fork relationships from parent_repo field
    const forkEdges = repos.rows
      .filter((r) => r.is_fork && r.parent_repo)
      .map((r) => {
        const parent = repos.rows.find((p) => p.full_name === r.parent_repo);
        if (parent) {
          return {
            source_repo_id: parent.id,
            target_repo_id: r.id,
            relationship_type: 'fork',
            strength: 1.0,
          };
        }
        return null;
      })
      .filter(Boolean);

    return res.json({
      nodes: repos.rows,
      edges: [...relationships.rows, ...forkEdges],
    });
  } catch (error) {
    logger.error('Error fetching network data:', error);
    return res.status(500).json({ error: 'Failed to fetch network data' });
  }
});

/**
 * Export data as CSV
 */
router.get('/export/csv', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        r.name,
        r.full_name,
        r.description,
        r.primary_language,
        r.stars,
        r.forks_count,
        r.is_fork,
        rc.category,
        rc.vibe_score,
        rc.complexity_score,
        rc.install_difficulty,
        r.created_at,
        r.updated_at
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      WHERE r.user_id = $1
      ORDER BY r.stars DESC`,
      [req.user.id],
    );

    // Generate CSV
    const headers = Object.keys(result.rows[0] || {});
    const csv = [
      headers.join(','),
      ...result.rows.map((row) => headers
        .map((h) => {
          const val = row[h];
          return typeof val === 'string' && val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=repositories.csv');
    return res.send(csv);
  } catch (error) {
    logger.error('Error exporting CSV:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
});

/**
 * Export data as JSON
 */
router.get('/export/json', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        r.*,
        rc.category,
        rc.vibe_score,
        rc.complexity_score,
        rc.install_difficulty,
        rc.debug_time_hours,
        rc.learning_curve,
        rc.maintenance_load,
        json_agg(DISTINCT jsonb_build_object('name', l.name, 'percentage', l.percentage)) 
          FILTER (WHERE l.id IS NOT NULL) as languages
      FROM repositories r
      LEFT JOIN repository_categories rc ON r.id = rc.repository_id
      LEFT JOIN languages l ON r.id = l.repository_id
      WHERE r.user_id = $1
      GROUP BY r.id, rc.category, rc.vibe_score, rc.complexity_score, 
               rc.install_difficulty, rc.debug_time_hours, rc.learning_curve, rc.maintenance_load
      ORDER BY r.stars DESC`,
      [req.user.id],
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=repositories.json');
    return res.json({
      exported_at: new Date().toISOString(),
      user: req.user.username,
      repositories: result.rows,
    });
  } catch (error) {
    logger.error('Error exporting JSON:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
