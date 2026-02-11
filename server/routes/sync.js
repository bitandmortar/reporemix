const express = require('express');
const { query } = require('../config/database');
const logger = require('../config/logger');
const { syncRepositoriesBackground } = require('../services/syncWorker');

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
};

router.post('/repositories', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const accessToken = req.user.access_token;

  try {
    const jobResult = await query(
      `INSERT INTO sync_jobs (user_id, status, started_at) 
       VALUES ($1, 'running', CURRENT_TIMESTAMP) 
       RETURNING id`,
      [userId],
    );
    const jobId = jobResult.rows[0].id;
    const payload = {
      message: 'Sync started',
      job_id: jobId,
      status: 'running',
    };

    res.json(payload);
    syncRepositoriesBackground(userId, accessToken, jobId);
    return payload;
  } catch (error) {
    logger.error('Error starting repository sync:', error);
    return res.status(500).json({ error: 'Failed to start sync' });
  }
});

router.get('/status/:jobId', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM sync_jobs WHERE id = $1 AND user_id = $2',
      [req.params.jobId, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sync job not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching sync status:', error);
    return res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM sync_jobs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching sync history:', error);
    return res.status(500).json({ error: 'Failed to fetch sync history' });
  }
});

module.exports = router;
