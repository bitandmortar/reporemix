/* eslint-env jest */

const GitHubService = require('../../server/services/github');

const mockOctokit = {
  repos: {
    listForAuthenticatedUser: jest.fn(),
    listLanguages: jest.fn(),
    getClones: jest.fn(),
    getViews: jest.fn(),
    getTopReferrers: jest.fn(),
    getTopPaths: jest.fn(),
    getAllTopics: jest.fn(),
    getReadme: jest.fn(),
  },
  rateLimit: {
    get: jest.fn(),
  },
};

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => mockOctokit),
}));

describe('GitHubService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOctokit.repos.listLanguages.mockResolvedValue({
      data: { JavaScript: 100 },
    });
    mockOctokit.repos.getAllTopics.mockResolvedValue({
      data: { names: ['tool'] },
    });
    mockOctokit.repos.getReadme.mockResolvedValue({
      data: { content: Buffer.from('readme').toString('base64') },
    });
    mockOctokit.repos.getViews.mockResolvedValue({
      data: { count: 0 },
    });
    mockOctokit.repos.getClones.mockResolvedValue({
      data: { count: 0, uniques: 0, clones: [] },
    });
    mockOctokit.repos.getTopReferrers.mockResolvedValue({
      data: [],
    });
    mockOctokit.repos.getTopPaths.mockResolvedValue({
      data: [],
    });
    mockOctokit.rateLimit.get.mockResolvedValue({
      data: {
        rate: {
          limit: 5000,
          remaining: 5000,
          reset: 999999999,
          used: 0,
        },
      },
    });
  });

  it('fetches user repositories across pages', async () => {
    mockOctokit.repos.listForAuthenticatedUser
      .mockResolvedValueOnce({
        data: [{ name: 'a' }, { name: 'b' }],
      })
      .mockResolvedValueOnce({ data: [] });

    const service = new GitHubService('token');
    const repos = await service.getUserRepositories({ perPage: 2 });

    expect(repos.length).toBe(2);
    expect(mockOctokit.repos.listForAuthenticatedUser).toHaveBeenCalledTimes(2);
  });

  it('calculates language percentages', async () => {
    const service = new GitHubService('token');
    const langs = await service.getRepositoryLanguages('owner', 'repo');
    expect(langs).toEqual([
      { name: 'JavaScript', bytes: 100, percentage: '100.00' },
    ]);
  });

  it('gathers complete repository data', async () => {
    mockOctokit.repos.getViews.mockResolvedValue({
      data: { count: 1 },
    });
    mockOctokit.repos.getClones.mockResolvedValue({
      data: { count: 2, uniques: 1, clones: [] },
    });
    mockOctokit.repos.getTopReferrers.mockResolvedValue({
      data: [],
    });
    mockOctokit.repos.getTopPaths.mockResolvedValue({
      data: [],
    });
    mockOctokit.rateLimit.get.mockResolvedValue({
      data: {
        rate: {
          limit: 5000,
          remaining: 4999,
          reset: 999999999,
          used: 1,
        },
      },
    });

    const repo = {
      owner: { login: 'owner' },
      name: 'repo',
      full_name: 'owner/repo',
    };
    const data = await new GitHubService('token').getCompleteRepositoryData(
      repo,
    );
    expect(data.repository.full_name).toBe('owner/repo');
    expect(data.languages.length).toBeGreaterThan(0);
  });
});
