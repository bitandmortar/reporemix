/* eslint-env jest */

const request = require('supertest');

const authRoutes = require('../../server/routes/auth');
const { createTestServer } = require('../setup/createTestApp');

describe('Auth routes', () => {
  it('reports status when authenticated', async () => {
    const server = await createTestServer(authRoutes);
    try {
      const response = await request(server).get('/status');
      expect(response.body.authenticated).toBe(true);
    } finally {
      server.close();
    }
  });

  it('returns user info when authenticated', async () => {
    const server = await createTestServer(authRoutes);
    try {
      const response = await request(server).get('/user');
      expect(response.status).toBe(200);
      expect(response.body.username).toBe('tester');
    } finally {
      server.close();
    }
  });
});
