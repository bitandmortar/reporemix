class OntologyService {
  /**
   * Categorize a repository based on its metadata
   */
  static categorizeRepository(repo) {
    const {
      name,
      description = '',
      topics = [],
    } = repo;

    const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();

    // Define category patterns and keywords
    const patterns = {
      Agent: {
        keywords: [
          'agent',
          'autonomous',
          'ai assistant',
          'chatbot',
          'llm',
          'gpt',
          'claude',
          'multi-agent',
          'jarvis',
          'automation',
          'workflow',
          'orchestration',
        ],
        weight: 0,
      },
      Foundation: {
        keywords: [
          'framework',
          'library',
          'sdk',
          'core',
          'base',
          'platform',
          'engine',
          'toolkit',
          'foundation',
          'infrastructure',
        ],
        weight: 0,
      },
      Tool: {
        keywords: [
          'tool',
          'cli',
          'utility',
          'helper',
          'converter',
          'downloader',
          'scraper',
          'parser',
          'generator',
          'optimizer',
        ],
        weight: 0,
      },
      Knowledge: {
        keywords: [
          'awesome',
          'guide',
          'tutorial',
          'documentation',
          'docs',
          'learning',
          'resources',
          'book',
          'course',
          'cheatsheet',
          'examples',
        ],
        weight: 0,
      },
      Infrastructure: {
        keywords: [
          'docker',
          'kubernetes',
          'devops',
          'deployment',
          'server',
          'database',
          'monitoring',
          'logging',
          'backup',
          'terraform',
          'ansible',
        ],
        weight: 0,
      },
      UI: {
        keywords: [
          'ui',
          'frontend',
          'react',
          'vue',
          'component',
          'design system',
          'visualization',
          'dashboard',
          'interface',
          'theme',
        ],
        weight: 0,
      },
      Data: {
        keywords: [
          'data',
          'analytics',
          'ml',
          'machine learning',
          'deep learning',
          'neural',
          'dataset',
          'pipeline',
          'etl',
          'processing',
        ],
        weight: 0,
      },
      Other: {
        keywords: [],
        weight: 0,
      },
    };

    // Calculate weights for each category
    Object.keys(patterns).forEach((category) => {
      patterns[category].keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          patterns[category].weight += 1;
        }
      });
    });

    // Find category with highest weight
    let maxWeight = 0;
    let bestCategory = 'Other';
    let confidence = 0;

    Object.entries(patterns).forEach(([category, data]) => {
      if (data.weight > maxWeight) {
        maxWeight = data.weight;
        bestCategory = category;
      }
    });

    // Calculate confidence (0-100)
    const totalWeight = Object.values(patterns).reduce(
      (sum, p) => sum + p.weight,
      0,
    );
    if (totalWeight > 0) {
      confidence = ((maxWeight / totalWeight) * 100).toFixed(2);
    }

    // Generate reasoning
    const reasoning = this.generateReasoning(
      bestCategory,
      repo,
      patterns[bestCategory],
    );

    return {
      category: bestCategory,
      confidence: parseFloat(confidence),
      reasoning,
      weights: Object.fromEntries(
        Object.entries(patterns).map(([cat, data]) => [cat, data.weight]),
      ),
    };
  }

  /**
   * Calculate vibe score (0-100) based on popularity and activity
   */
  static calculateVibeScore(repo) {
    const {
      stars = 0,
      forks_count = 0,
      pushed_at,
    } = repo;

    // Popularity component (0-50 points)
    const popularity = Math.min(50, Math.log10(stars + 1) * 10);

    // Activity component (0-30 points)
    const daysSinceUpdate = pushed_at
      ? (Date.now() - new Date(pushed_at).getTime()) / (1000 * 60 * 60 * 24)
      : 365;
    const activityScore = Math.max(0, 30 - daysSinceUpdate / 10);

    // Engagement component (0-20 points)
    const engagementRatio = stars > 0 ? forks_count / stars : 0;
    const engagementScore = Math.min(20, engagementRatio * 100);

    const vibeScore = popularity + activityScore + engagementScore;

    return Math.min(100, Math.max(0, vibeScore)).toFixed(2);
  }

  /**
   * Calculate complexity score (1-10)
   */
  static calculateComplexityScore(repo) {
    const {
      size_kb = 0,
      primary_language,
      description = '',
    } = repo;

    let complexity = 1;

    // Size factor
    if (size_kb > 100000) complexity += 3;
    else if (size_kb > 50000) complexity += 2;
    else if (size_kb > 10000) complexity += 1;

    // Language complexity
    const complexLanguages = ['C++', 'Rust', 'Go', 'Java', 'Scala', 'Haskell'];
    if (complexLanguages.includes(primary_language)) {
      complexity += 2;
    }

    // Architecture keywords
    const complexKeywords = [
      'distributed',
      'microservice',
      'architecture',
      'enterprise',
      'kubernetes',
      'cluster',
    ];
    if (complexKeywords.some((kw) => description.toLowerCase().includes(kw))) {
      complexity += 2;
    }

    return Math.min(10, Math.max(1, complexity));
  }

  /**
   * Estimate install difficulty (1-10)
   */
  static estimateInstallDifficulty(repo) {
    const { primary_language, topics = [], description = '' } = repo;

    let difficulty = 3; // Base difficulty

    // Language-based difficulty
    const languageDifficulty = {
      JavaScript: 2,
      TypeScript: 2,
      Python: 2,
      Go: 4,
      Rust: 7,
      'C++': 8,
      C: 8,
      Java: 5,
      Swift: 4,
      Kotlin: 4,
    };

    difficulty = languageDifficulty[primary_language] || difficulty;

    // Increase for system dependencies
    const systemDeps = ['docker', 'kubernetes', 'postgres', 'mongodb', 'redis'];
    if (systemDeps.some((dep) => description.toLowerCase().includes(dep))) {
      difficulty += 2;
    }

    // Increase for build complexity
    if (topics.includes('build-tool') || topics.includes('compiler')) {
      difficulty += 1;
    }

    return Math.min(10, Math.max(1, difficulty));
  }

  /**
   * Estimate debug time in hours
   */
  static estimateDebugTime(repo) {
    const complexity = this.calculateComplexityScore(repo);
    const installDifficulty = this.estimateInstallDifficulty(repo);

    // Base estimate: 1-5 hours for simple, 5-20 hours for complex
    const baseHours = complexity * 2;
    const difficultyMultiplier = installDifficulty / 5;

    return Math.round(baseHours * difficultyMultiplier);
  }

  /**
   * Estimate learning curve (1-10)
   */
  static estimateLearningCurve(repo) {
    const { description = '', topics = [], size_kb = 0 } = repo;

    let curve = 3; // Base learning curve

    // Size factor
    if (size_kb > 50000) curve += 2;
    else if (size_kb > 10000) curve += 1;

    // Documentation presence
    if (description.length < 50) curve += 1;

    // Domain complexity
    const advancedTopics = [
      'machine-learning',
      'deep-learning',
      'blockchain',
      'cryptography',
      'distributed-systems',
    ];
    if (topics.some((topic) => advancedTopics.includes(topic))) {
      curve += 3;
    }

    return Math.min(10, Math.max(1, curve));
  }

  /**
   * Estimate maintenance load (1-10)
   */
  static estimateMaintenanceLoad(repo) {
    const {
      open_issues = 0, watchers = 0, pushed_at
    } = repo;

    let load = 2; // Base maintenance load

    // Issue count factor
    if (open_issues > 100) load += 3;
    else if (open_issues > 50) load += 2;
    else if (open_issues > 10) load += 1;

    // Community size (more watchers = more maintenance)
    if (watchers > 1000) load += 2;
    else if (watchers > 100) load += 1;

    // Activity factor
    const daysSinceUpdate = pushed_at
      ? (Date.now() - new Date(pushed_at).getTime()) / (1000 * 60 * 60 * 24)
      : 365;

    if (daysSinceUpdate < 7) load += 2; // Very active
    else if (daysSinceUpdate < 30) load += 1;

    return Math.min(10, Math.max(1, load));
  }

  /**
   * Generate reasoning text for categorization
   */
  static generateReasoning(category, repo, patternData) {
    const matchedKeywords = patternData.keywords.filter((kw) => `${repo.name} ${repo.description || ''} ${repo.topics?.join(' ') || ''}`
      .toLowerCase()
      .includes(kw));

    const reasons = [];

    if (matchedKeywords.length > 0) {
      reasons.push(
        `Contains keywords: ${matchedKeywords.slice(0, 3).join(', ')}`,
      );
    }

    if (repo.primary_language) {
      reasons.push(`Primary language: ${repo.primary_language}`);
    }

    if (repo.topics && repo.topics.length > 0) {
      reasons.push(`Topics: ${repo.topics.slice(0, 3).join(', ')}`);
    }

    return reasons.join('. ');
  }

  /**
   * Complete ontological analysis
   */
  static analyzeRepository(repo) {
    const categorization = this.categorizeRepository(repo);
    const vibeScore = this.calculateVibeScore(repo);
    const complexityScore = this.calculateComplexityScore(repo);
    const installDifficulty = this.estimateInstallDifficulty(repo);
    const debugTime = this.estimateDebugTime(repo);
    const learningCurve = this.estimateLearningCurve(repo);
    const maintenanceLoad = this.estimateMaintenanceLoad(repo);

    return {
      category: categorization.category,
      vibe_score: parseFloat(vibeScore),
      complexity_score: complexityScore,
      install_difficulty: installDifficulty,
      debug_time_hours: debugTime,
      learning_curve: learningCurve,
      maintenance_load: maintenanceLoad,
      confidence: categorization.confidence,
      reasoning: categorization.reasoning,
    };
  }
}

module.exports = OntologyService;
