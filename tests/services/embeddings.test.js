const {
  computeEmbeddingVector,
  VECTOR_DIMENSION,
} = require('../../server/services/embeddings');

describe('Embedding service', () => {
  const repo = {
    stargazers_count: 256,
    forks_count: 64,
    watchers_count: 128,
    size: 20480,
    category: 'Tool',
    language: 'JavaScript',
    topics: ['cli', 'automation'],
    priority: 'High',
    is_fork: false,
  };

  const analysis = {
    category: 'Tool',
    vibe_score: 79.2,
    complexity_score: 6.5,
    install_difficulty: 4.2,
    debug_time_hours: 7,
    learning_curve: 3,
    maintenance_load: 5,
    confidence: 68,
    weights: {
      Tool: 3,
      Infrastructure: 1,
      Agent: 1,
    },
  };

  test('produces a 1536-dimension vector with finite values', () => {
    const vector = computeEmbeddingVector(repo, analysis);
    expect(vector).toHaveLength(VECTOR_DIMENSION);
    expect(vector.every((value) => Number.isFinite(value))).toBe(true);
    expect(vector.some((value) => Math.abs(value) > 0.00001)).toBe(true);
  });

  test('is deterministic across repeated calls', () => {
    const first = computeEmbeddingVector(repo, analysis);
    const second = computeEmbeddingVector(repo, analysis);
    expect(first).toEqual(second);
  });
});
