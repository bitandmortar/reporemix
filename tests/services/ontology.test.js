/* eslint-env jest */

const OntologyService = require('../../server/services/ontology');

describe('OntologyService', () => {
  describe('categorizeRepository', () => {
    test('picks Agent when keywords match', () => {
      const repo = {
        name: 'Multi-Agent Orchestrator',
        description: 'Autonomous workflow automation',
        primary_language: 'JavaScript',
        topics: ['automation'],
      };
      const result = OntologyService.categorizeRepository(repo);
      expect(result.category).toBe('Agent');
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('falls back to Other when no keywords', () => {
      const repo = {
        name: 'Plain Repo',
        description: 'Nothing special here',
        topics: [],
      };
      const result = OntologyService.categorizeRepository(repo);
      expect(result.category).toBe('Other');
    });
  });

  describe('vibe and complexity scores', () => {
    const repo = {
      stars: 1000,
      forks_count: 100,
      watchers: 250,
      pushed_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    };

    test('calculateVibeScore clamps between 0 and 100', () => {
      const value = OntologyService.calculateVibeScore(repo);
      expect(Number(value)).toBeGreaterThanOrEqual(0);
      expect(Number(value)).toBeLessThanOrEqual(100);
    });

    test('calculateComplexityScore handles language heuristics', () => {
      const complexRepo = {
        size_kb: 120000,
        primary_language: 'Rust',
        description: 'Distributed architecture',
      };
      const value = OntologyService.calculateComplexityScore(complexRepo);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    });
  });

  test('analyzeRepository returns full metrics object', () => {
    const repo = {
      name: 'Toolkit',
      description: 'Utility toolkit',
      topics: ['cli'],
      stars: 10,
      forks_count: 2,
      watchers: 5,
      pushed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      size_kb: 2048,
      language: 'JavaScript',
    };

    const result = OntologyService.analyzeRepository(repo);
    expect(result).toMatchObject({
      category: expect.any(String),
      vibe_score: expect.any(Number),
      complexity_score: expect.any(Number),
      install_difficulty: expect.any(Number),
      debug_time_hours: expect.any(Number),
      learning_curve: expect.any(Number),
      maintenance_load: expect.any(Number),
      confidence: expect.any(Number),
      reasoning: expect.any(String),
    });
  });
});
