const express = require('express');
const passport = require('passport');
const logger = require('../config/logger');

const router = express.Router();

// Initiate GitHub OAuth flow
router.get('/github', passport.authenticate('github', { scope: ['user', 'repo', 'read:org'] }));

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login?error=auth_failed',
  }),
  (req, res) => {
    logger.info(`User ${req.user.username} authenticated successfully`);

    // Redirect to frontend with success
    if (process.env.NODE_ENV === 'production') {
      return res.redirect('/dashboard');
    }
    return res.redirect('http://localhost:5173/dashboard');
  },
);

// Logout
router.get('/logout', (req, res) => {
  const username = req.user ? req.user.username : 'unknown';

  return req.logout((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    return req.session.destroy((sessionErr) => {
      if (sessionErr) {
        logger.error('Session destruction error:', sessionErr);
      }
      logger.info(`User ${username} logged out`);
      return res.json({ message: 'Logged out successfully' });
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        avatar_url: req.user.avatar_url,
        email: req.user.email,
        bio: req.user.bio,
        location: req.user.location,
        public_repos: req.user.public_repos,
        followers: req.user.followers,
        following: req.user.following,
      },
    });
  }
  return res.json({ authenticated: false });
});

// Get current user details
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    avatar_url: req.user.avatar_url,
    bio: req.user.bio,
    location: req.user.location,
    blog: req.user.blog,
    public_repos: req.user.public_repos,
    public_gists: req.user.public_gists,
    followers: req.user.followers,
    following: req.user.following,
    created_at: req.user.created_at,
    last_synced_at: req.user.last_synced_at,
  });
});

module.exports = router;
