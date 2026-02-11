const express = require('express');

const createDefaultUser = () => ({
  id: 'user-id',
  username: 'tester',
  email: 'tester@example.com',
  avatar_url: 'https://example.com/avatar.png',
  bio: 'bio',
  location: 'planet earth',
  blog: 'https://example.com',
  public_repos: 1,
  public_gists: 0,
  followers: 0,
  following: 0,
  created_at: new Date(),
  last_synced_at: new Date(),
  access_token: 'token',
});

function createAppWithAuth(router, { authenticated = true, user = null } = {}) {
  const app = express();
  app.use((req, res, next) => {
    req.isAuthenticated = () => authenticated;
    req.user = authenticated ? user || createDefaultUser() : null;
    req.logout = (cb) => cb && cb();
    next();
  });
  app.use(express.json());
  app.use(router);
  return app;
}

async function createTestServer(router, options) {
  const app = createAppWithAuth(router, options);
  app.close = (cb) => {
    if (typeof cb === 'function') {
      cb();
    }
  };
  return app;
}

module.exports = {
  createAppWithAuth,
  createTestServer,
};
