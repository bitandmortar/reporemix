/* eslint-env jest */

const request = require('supertest');

jest.mock('../../server/config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));
jest.mock('../../server/config/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

const { query } = require('../../server/config/database');
const apiRoutes = require('../../server/routes/api');
const { createTestServer } = require('../setup/createTestApp');

describe('API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns repositories list when authenticated', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'repo-1', name: 'Repo' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const server = await createTestServer(apiRoutes);
    try {
      const response = await request(server).get('/repositories');

      expect(response.status).toBe(200);
      expect(response.body.repositories).toHaveLength(1);
    } finally {
      server.close();
    }
  });

  it('guards endpoints when unauthenticated', async () => {
    const server = await createTestServer(apiRoutes, { authenticated: false });
    try {
      await request(server).get('/repositories').expect(401);
    } finally {
      server.close();
    }
  });

  it('exports CSV data', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          name: 'Repo',
          full_name: 'user/repo',
          description: 'desc',
          primary_language: 'JS',
          stars: 1,
          forks_count: 0,
          is_fork: false,
          category: 'Tool',
          vibe_score: 10,
          complexity_score: 5,
          install_difficulty: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });
    const server = await createTestServer(apiRoutes);
    try {
      const response = await request(server).get('/export/csv');

      expect(response.headers['content-type']).toMatch(/text\/csv/);
      expect(response.text).toContain('Repo');
    } finally {
      server.close();
    }
  });
});
