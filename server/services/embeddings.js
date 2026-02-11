const VECTOR_DIMENSION = 1536;
const EMBEDDING_MODEL = 'ontology-hybrid/1';

const clamp = (value, min = 0, max = 1) => (
  Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : min
);

const logNormalize = (value, maxExp = 6) => {
  const normalized = Math.log10(Math.max(value + 1, 1));
  return normalized / maxExp;
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const hashString = (value = '') => (
  value
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    / 1000
);

const buildFeaturePalette = (repo, analysis = {}) => {
  const stars = safeNumber(repo.stargazers_count || repo.stars);
  const forks = safeNumber(repo.forks_count || repo.forks);
  const watchers = safeNumber(repo.watchers_count || repo.watchers);
  const size = safeNumber(repo.size || repo.size_kb);
  const category = repo.category || analysis.category || 'other';
  const language = repo.language || 'unknown';
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const priorityMap = {
    high: 1,
    medium: 0.5,
    low: 0.2,
  };
  const priority = typeof repo.priority === 'string'
    ? (priorityMap[repo.priority.toLowerCase()] ?? 0.4)
    : 0.4;

  const baseFeatures = [
    {
      label: 'stars',
      value: clamp(logNormalize(stars)),
      weight: 1.1,
    },
    {
      label: 'forks',
      value: clamp(logNormalize(forks)),
      weight: 0.95,
    },
    {
      label: 'watchers',
      value: clamp(logNormalize(watchers)),
      weight: 0.8,
    },
    {
      label: 'size',
      value: clamp(logNormalize(size)),
      weight: 0.7,
    },
    {
      label: 'vibe',
      value: clamp(safeNumber(analysis.vibe_score) / 100),
      weight: 1.0,
    },
    {
      label: 'complexity',
      value: clamp(safeNumber(analysis.complexity_score) / 10),
      weight: 0.9,
    },
    {
      label: 'install',
      value: clamp(safeNumber(analysis.install_difficulty) / 10),
      weight: 0.6,
    },
    {
      label: 'debug',
      value: clamp(safeNumber(analysis.debug_time_hours) / 40),
      weight: 0.45,
    },
    {
      label: 'learning',
      value: clamp(safeNumber(analysis.learning_curve) / 10),
      weight: 0.5,
    },
    {
      label: 'maintenance',
      value: clamp(safeNumber(analysis.maintenance_load) / 10),
      weight: 0.5,
    },
    {
      label: 'confidence',
      value: clamp(safeNumber(analysis.confidence) / 100),
      weight: 0.35,
    },
    {
      label: 'priority',
      value: clamp(priority),
      weight: 0.4,
    },
    {
      label: 'topic_count',
      value: clamp(topics.length / 20),
      weight: 0.35,
    },
    {
      label: 'category_hash',
      value: clamp(hashString(category)),
      weight: 0.3,
    },
    {
      label: 'language_hash',
      value: clamp(hashString(language)),
      weight: 0.3,
    },
    {
      label: 'is_fork',
      value: repo.is_fork ? 1 : 0,
      weight: 0.2,
    },
  ];

  const categoryWeights = analysis.weights || {};
  const weightedFeatures = Object.entries(categoryWeights).map(
    ([cat, weight]) => ({
      label: `cat_${cat}`,
      value: clamp(weight / 5),
      weight: 0.25,
    }),
  );

  return [...baseFeatures, ...weightedFeatures]
    .map((feature, idx) => ({
      ...feature,
      phase: ((feature.label
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360)
        * (Math.PI / 180)),
      index: idx,
    }))
    .filter((feature) => Number.isFinite(feature.value));
};

const mixSignals = (features, index) => {
  const feature = features[index % features.length];
  const angle = (index / VECTOR_DIMENSION) * Math.PI * 4;
  const drift = feature.index * 0.01;
  const sine = Math.sin(angle + feature.phase + drift);
  const cosine = Math.cos((angle * 0.5) + feature.phase * 0.5 + drift);
  const amplitude = 0.05 + feature.value * (0.7 + feature.weight * 0.3);
  return ((sine + cosine) * 0.5) * amplitude * (1 + feature.value * 0.2);
};

const computeEmbeddingVector = (repo = {}, analysis = {}) => {
  const features = buildFeaturePalette(repo, analysis);
  if (!features.length) {
    return new Array(VECTOR_DIMENSION).fill(0);
  }

  const vector = new Array(VECTOR_DIMENSION);
  for (let i = 0; i < VECTOR_DIMENSION; i += 1) {
    vector[i] = mixSignals(features, i);
  }
  return vector;
};

module.exports = {
  EMBEDDING_MODEL,
  VECTOR_DIMENSION,
  computeEmbeddingVector,
};
