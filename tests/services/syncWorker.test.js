/* eslint-env jest */

const {
  syncRepositoriesBackground,
} = require('../../server/services/syncWorker');

describe('syncWorker', () => {
  it('marks job completed when sync finishes', async () => {
    const sampleRepo = {
      owner: { login: 'o' },
      name: 'repo',
      full_name: 'o/repo',
      id: 1,
      stargazers_count: 0,
      forks_count: 0,
      watchers_count: 0,
      open_issues_count: 0,
      size: 10,
      language: 'JavaScript',
      default_branch: 'main',
      license: null,
      homepage: null,
      clone_url: '',
      ssh_url: '',
      has_issues: true,
      has_wiki: true,
      has_pages: false,
      archived: false,
      disabled: false,
      created_at: new Date(),
      updated_at: new Date(),
      pushed_at: new Date(),
    };
    const github = {
      getUserRepositories: jest.fn().mockResolvedValue([sampleRepo]),
    };
    const queryLog = [];
    const queryFn = jest.fn(async (text, params) => {
      queryLog.push({ text, params });
      if (text.includes('UPDATE sync_jobs SET total_repos')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO sync_jobs')) {
        return { rows: [{ id: 'job-1' }] };
      }
      return { rows: [] };
    });
    const syncSingleRepositoryFn = jest.fn().mockResolvedValue();

    await syncRepositoriesBackground('user-1', 'token', 'job-1', {
      github,
      queryFn,
      syncSingleRepositoryFn,
    });

    expect(syncSingleRepositoryFn).toHaveBeenCalled();
    expect(queryFn).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'completed'"),
      expect.any(Array),
    );
  });

  it('marks job failed when sync throws', async () => {
    const github = {
      getUserRepositories: jest.fn().mockRejectedValue(new Error('boom')),
    };
    const queryFn = jest.fn();

    await syncRepositoriesBackground('user-1', 'token', 'job-2', {
      github,
      queryFn,
    });

    expect(queryFn).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'failed'"),
      expect.arrayContaining([expect.any(String), 'job-2']),
    );
  });
});
