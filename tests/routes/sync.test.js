/* eslint-env jest */

const request = require('supertest');

jest.mock('../../server/config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));
const { query } = require('../../server/config/database');

jest.mock('../../server/services/syncWorker', () => ({
  syncRepositoriesBackground: jest.fn(),
}));
const syncWorker = require('../../server/services/syncWorker');

const syncRoutes = require('../../server/routes/sync');
const { createTestServer } = require('../setup/createTestApp');

describe('Sync routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts a sync job and fires background worker', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'job-1' }] });
    const server = await createTestServer(syncRoutes);
    try {
      const response = await request(server).post('/repositories');

      expect(response.status).toBe(200);
      expect(response.body.job_id).toBe('job-1');
      expect(syncWorker.syncRepositoriesBackground).toHaveBeenCalledWith(
        'user-id',
        'token',
        'job-1',
      );
    } finally {
      server.close();
    }
  });

  it('returns 404 when job missing', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const server = await createTestServer(syncRoutes);
    try {
      await request(server).get('/status/job-unknown').expect(404);
    } finally {
      server.close();
    }
  });
});
