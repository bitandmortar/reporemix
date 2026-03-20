import React, {
  useState, useEffect, useRef, useMemo, useCallback
} from 'react';
import axios from 'axios';
import clsx from 'clsx';
import ForceGraph from 'force-graph';
/* eslint-disable import/no-unresolved */
import { EmbeddingAtlas, createUMAP } from 'embedding-atlas/react';
import { Coordinator, wasmConnector } from '@uwdata/mosaic-core';
/* eslint-enable import/no-unresolved */
import {
  GitFork,
  Star,
  Code,
  Database,
  Grid,
  Layers,
  Download,
  RefreshCw,
  Search,
  Activity,
  Zap,
  Shuffle,
  Map,
} from 'lucide-react';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

const AESTHETIC_THEMES = [
  {
    name: 'Renaissance',
    colors: {
      primary: '#8b5c42',
      secondary: '#cfa064',
      bg: '#1d120d',
      surface: '#291b13',
    },
    font: 'Crimson Text',
  },
  {
    name: 'Baroque',
    colors: {
      primary: '#7c3213',
      secondary: '#e5c26e',
      bg: '#120b05',
      surface: '#1f1307',
    },
    font: 'Playfair Display',
  },
  {
    name: 'Rococo',
    colors: {
      primary: '#c38fbd',
      secondary: '#ffe3e0',
      bg: '#1c1016',
      surface: '#271a23',
    },
    font: 'Libre Baskerville',
  },
  {
    name: 'Neoclassical',
    colors: {
      primary: '#213c4f',
      secondary: '#c2b291',
      bg: '#101820',
      surface: '#1f2a30',
    },
    font: 'Merriweather',
  },
  {
    name: 'Impressionism',
    colors: {
      primary: '#6ea4a8',
      secondary: '#ffbe7c',
      bg: '#0a1c1c',
      surface: '#162525',
    },
    font: 'Cormorant Garamond',
  },
  {
    name: 'Expressionism',
    colors: {
      primary: '#d93829',
      secondary: '#ffcd57',
      bg: '#120d0f',
      surface: '#241416',
    },
    font: 'Fjalla One',
  },
  {
    name: 'Fauvism',
    colors: {
      primary: '#f05d36',
      secondary: '#ffdd1b',
      bg: '#191412',
      surface: '#2c1e1c',
    },
    font: 'Anton',
  },
  {
    name: 'Cubism',
    colors: {
      primary: '#5d6fa8',
      secondary: '#d5c64f',
      bg: '#131521',
      surface: '#262b32',
    },
    font: 'Space Grotesk',
  },
  {
    name: 'Futurism',
    colors: {
      primary: '#00d9ff',
      secondary: '#f7f3ea',
      bg: '#050a14',
      surface: '#0c1220',
    },
    font: 'Outfit',
  },
  {
    name: 'Constructivism',
    colors: {
      primary: '#b1121a',
      secondary: '#e4d300',
      bg: '#090909',
      surface: '#1a1a1a',
    },
    font: 'Bebas Neue',
  },
  {
    name: 'Suprematism',
    colors: {
      primary: '#1d68f2',
      secondary: '#f22e2c',
      bg: '#f9f9f9',
      surface: '#ededed',
    },
    font: 'Montserrat',
  },
  {
    name: 'Surrealism',
    colors: {
      primary: '#e02e8f',
      secondary: '#81c0c0',
      bg: '#0c0710',
      surface: '#201529',
    },
    font: 'Merriweather',
  },
  {
    name: 'Dada',
    colors: {
      primary: '#f5f5f5',
      secondary: '#000000',
      bg: '#111111',
      surface: '#1b1b1b',
    },
    font: 'Courier Prime',
  },
  {
    name: 'Abstract Expressionism',
    colors: {
      primary: '#f2494a',
      secondary: '#001f3f',
      bg: '#05070c',
      surface: '#121626',
    },
    font: 'Chivo',
  },
  {
    name: 'Pop Art',
    colors: {
      primary: '#ff007f',
      secondary: '#fff700',
      bg: '#040404',
      surface: '#121212',
    },
    font: 'Archivo Black',
  },
  {
    name: 'Op Art',
    colors: {
      primary: '#ffffff',
      secondary: '#000000',
      bg: '#0c0c0c',
      surface: '#1c1c1c',
    },
    font: 'Alegreya Sans',
  },
  {
    name: 'Minimalism',
    colors: {
      primary: '#ffffff',
      secondary: '#f1f1f1',
      bg: '#0f0f0f',
      surface: '#1f1f1f',
    },
    font: 'Helvetica Neue',
  },
  {
    name: 'Brutalism',
    colors: {
      primary: '#2e2e2e',
      secondary: '#d6d6d6',
      bg: '#090909',
      surface: '#161616',
    },
    font: 'IBM Plex Mono',
  },
  {
    name: 'De Stijl',
    colors: {
      primary: '#e60012',
      secondary: '#0063b2',
      bg: '#f6f4f0',
      surface: '#ffffff',
    },
    font: 'Neue Haas Grotesk',
  },
  {
    name: 'Bauhaus',
    colors: {
      primary: '#f23b0c',
      secondary: '#0a59a1',
      bg: '#121212',
      surface: '#1c1c1c',
    },
    font: 'Futura',
  },
  {
    name: 'Conceptual Art',
    colors: {
      primary: '#3f3f46',
      secondary: '#a1a1aa',
      bg: '#0b0b0b',
      surface: '#1c1c1c',
    },
    font: 'Times New Roman',
  },
  {
    name: 'Kinetic Art',
    colors: {
      primary: '#49d6ff',
      secondary: '#ff8c42',
      bg: '#050d13',
      surface: '#132a2c',
    },
    font: 'Rajdhani',
  },
  {
    name: 'Color Field',
    colors: {
      primary: '#ff6fa3',
      secondary: '#6bc0ff',
      bg: '#0c0c0c',
      surface: '#1a1a1a',
    },
    font: 'Playfair Display',
  },
  {
    name: 'Art Nouveau',
    colors: {
      primary: '#2c5f2d',
      secondary: '#c6a57b',
      bg: '#0e160b',
      surface: '#1f291e',
    },
    font: 'Lora',
  },
  {
    name: 'Arts and Crafts Movement',
    colors: {
      primary: '#7d4427',
      secondary: '#d1b07c',
      bg: '#0f0b08',
      surface: '#21160d',
    },
    font: 'Georgia',
  },
  {
    name: 'Symbolism',
    colors: {
      primary: '#6c2366',
      secondary: '#fedc5a',
      bg: '#100909',
      surface: '#1e111c',
    },
    font: 'Cormorant Garamond',
  },
];

const CATEGORY_COLORS = {
  Agent: '#a855f7',
  Engine: '#3b82f6',
  Utility: '#10b981',
  Research: '#f59e0b',
  Infrastructure: '#ef4444',
  UI: '#ec4899',
  Data: '#06b6d4',
  Foundation: '#3b82f6',
  Tool: '#10b981',
  Knowledge: '#f59e0b',
  Other: '#6b7280',
};

const CATEGORY_ORDER = [
  'Agent',
  'Engine',
  'Utility',
  'Research',
  'UI',
  'Infrastructure',
  'Data',
  'Other',
];

const CATEGORY_NORMALIZATION = {
  Foundation: 'Engine',
  Tool: 'Utility',
  Knowledge: 'Research',
};

const normalizeCategory = (category) => {
  if (!category) {
    return 'Other';
  }
  return CATEGORY_NORMALIZATION[category] || category;
};

const MASTER_TABLE = 'reporemix_master';
const FILTER_TABLE = 'reporemix_filtered';

const escapeSqlLiteral = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  const str = String(value);
  return `'${str.replace(/'/g, "''")}'`;
};

const numericLiteral = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 'NULL';
};

const hexToRgba = (hex, alpha = 0.2) => {
  if (!hex || !hex.startsWith('#')) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((char) => `${char}${char}`).join('');
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const computeEmbeddingCoordinates = (repo, index, categoryIndex = 0) => {
  const stars = Number.isFinite(Number(repo.stars)) ? Number(repo.stars) : 0;
  const forks = Number.isFinite(Number(repo.forks)) ? Number(repo.forks) : 0;
  const vibe = Number.isFinite(Number(repo.vibe_score)) ? Number(repo.vibe_score) : 0;
  const complexity = Number.isFinite(Number(repo.complexity_score)) ? Number(repo.complexity_score) : 0;
  const install = Number.isFinite(Number(repo.install_difficulty)) ? Number(repo.install_difficulty) : 0;
  let priorityBoost = 0;
  if (repo.priority === 'High') {
    priorityBoost = 3;
  } else if (repo.priority === 'Low') {
    priorityBoost = -2;
  }
  const base = Math.log(stars + 1);
  const categoryOffset = ((categoryIndex % 5) - 2) * 0.35;
  const radial = (index % 7) * 0.2;
  const x = base * 1.2 + vibe * 0.8 + categoryOffset + radial;
  const y = complexity * 0.6 - install * 0.5 + forks * 0.12 + priorityBoost + (Math.sin(index) * 0.4);
  return { x, y };
};

const buildAtlasChartTheme = (theme) => {
  const bg = theme.colors.bg?.toLowerCase?.() ?? '';
  const isDark = !['#ffffff', '#f6f6f6', '#f9f9f9'].includes(bg);
  return {
    scheme: isDark ? 'dark' : 'light',
    interpolate: isDark ? 'inferno' : 'pubu',
    categoryColors: Object.values(CATEGORY_COLORS),
    otherColor: '#9ca3af',
    nullColor: '#aaaaaa',
    markColor: theme.colors.secondary,
    markColorFade: hexToRgba(theme.colors.secondary, 0.2),
    markColorGray: theme.colors.surface,
    markColorGrayFade: theme.colors.bg,
    embeddingColor: theme.colors.primary,
    ruleColor: theme.colors.secondary,
    gridColor: theme.colors.surface,
    labelColor: theme.colors.secondary,
    labelFontFamily: theme.font,
    labelFontSize: 12,
    labelMaxWidth: 140,
    brushBorder: theme.colors.primary,
    brushBorderBack: theme.colors.surface,
    brushFill: hexToRgba(theme.colors.primary, 0.25),
    statusBarTextColor: theme.colors.secondary,
    statusBarBackgroundColor: theme.colors.surface,
    clusterLabelColor: theme.colors.secondary,
    clusterLabelOutlineColor: theme.colors.primary,
    clusterLabelOpacity: 0.9,
  };
};

const buildFilterPredicate = (category, language) => {
  const clauses = [];
  if (category && category !== 'all') {
    clauses.push(`category = ${escapeSqlLiteral(category)}`);
  }
  if (language && language !== 'all') {
    clauses.push(`language = ${escapeSqlLiteral(language)}`);
  }
  return clauses.length ? clauses.join(' AND ') : '';
};

const rebuildFilteredTable = async (coordinator, category, language) => {
  const predicate = buildFilterPredicate(category, language);
  await coordinator.exec(`DROP TABLE IF EXISTS ${FILTER_TABLE}`);
  await coordinator.exec(`
    CREATE TABLE ${FILTER_TABLE} AS (
      SELECT * FROM ${MASTER_TABLE}
      ${predicate ? `WHERE ${predicate}` : ''}
      ORDER BY stars DESC NULLS LAST
    );
  `);
  return FILTER_TABLE;
};

function App() {
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeView, setActiveView] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [currentTheme, setCurrentTheme] = useState(AESTHETIC_THEMES[8]);
  const [analytics, setAnalytics] = useState(null);
  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });
  const [atlasProjectionMap, setAtlasProjectionMap] = useState({});
  const [atlasProjectionReady, setAtlasProjectionReady] = useState(false);
  const [atlasProjectionVersion, setAtlasProjectionVersion] = useState(0);
  const [atlasStatus, setAtlasStatus] = useState('Waiting for repository data...');
  const [atlasReady, setAtlasReady] = useState(false);
  const [atlasTable, setAtlasTable] = useState(FILTER_TABLE);
  const [atlasSeedVersion, setAtlasSeedVersion] = useState(0);
  const coordinatorRef = useRef(null);

  const ensureCoordinator = useCallback(async () => {
    if (coordinatorRef.current) {
      return coordinatorRef.current;
    }
    const coordinator = new Coordinator();
    const connector = await wasmConnector();
    coordinator.databaseConnector(connector);
    coordinatorRef.current = coordinator;
    return coordinator;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let context = null;
    const vectorEntries = repositories
      .map((repo) => (Array.isArray(repo.embedding_vector) ? {
        id: repo.id,
        vector: repo.embedding_vector,
      } : null))
      .filter(Boolean);

    if (!vectorEntries.length) {
      setAtlasProjectionMap({});
      setAtlasProjectionReady(true);
      setAtlasProjectionVersion((prev) => prev + 1);
      setAtlasStatus('Atlas projection ready (no embeddings)');
      return () => {
        cancelled = true;
      };
    }

    if (vectorEntries.length < 3) {
      setAtlasProjectionMap({});
      setAtlasProjectionReady(true);
      setAtlasProjectionVersion((prev) => prev + 1);
      setAtlasStatus('Atlas projection ready (not enough embeddings)');
      return () => {
        cancelled = true;
      };
    }

    const runProjection = async () => {
      setAtlasProjectionReady(false);
      setAtlasStatus('Computing Atlas projection...');
      const inputDim = vectorEntries[0].vector.length;
      const flatData = new Float32Array(vectorEntries.length * inputDim);
      vectorEntries.forEach((entry, idx) => {
        entry.vector.forEach((value, dim) => {
          flatData[idx * inputDim + dim] = Number(value);
        });
      });

      try {
        const neighbors = Math.max(2, Math.min(30, vectorEntries.length - 1));
        context = await createUMAP(vectorEntries.length, inputDim, 2, flatData, {
          nNeighbors: neighbors,
          minDist: 0.1,
          nEpochs: 400,
        });
        context.run(400);

        if (cancelled) {
          context.destroy();
          return;
        }

        const { embedding } = context;
        const nextMap = {};
        for (let i = 0; i < vectorEntries.length; i += 1) {
          nextMap[vectorEntries[i].id] = {
            x: embedding[i * 2],
            y: embedding[i * 2 + 1],
          };
        }
        context.destroy();

        if (!cancelled) {
          setAtlasProjectionMap(nextMap);
          setAtlasProjectionReady(true);
          setAtlasProjectionVersion((prev) => prev + 1);
          setAtlasStatus('Atlas projection ready');
        }
      } catch (error) {
        console.error('UMAP projection failed', error);
        if (context) {
          context.destroy();
        }
        if (!cancelled) {
          setAtlasProjectionMap({});
          setAtlasProjectionReady(true);
          setAtlasStatus('Atlas projection failed; using metric projection');
          setAtlasProjectionVersion((prev) => prev + 1);
        }
      }
    };

    runProjection();

    return () => {
      cancelled = true;
      if (context) {
        context.destroy();
      }
    };
  }, [repositories]);

  // 1. All hooks (useMemo, hooks) should be early
  const filteredRepos = useMemo(
    () => repositories.filter((repo) => {
      const matchesSearch = !searchTerm
          || repo.name.toLowerCase().includes(searchTerm.toLowerCase())
          || (repo.description || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || repo.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'all' || repo.language === selectedLanguage;

      return matchesSearch && matchesCategory && matchesLanguage;
    }),
    [repositories, searchTerm, selectedCategory, selectedLanguage],
  );

  const categories = useMemo(() => {
    const catSet = new Set(repositories.map((r) => r.category).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((cat) => catSet.has(cat));
    const extras = [...catSet]
      .filter((cat) => !CATEGORY_ORDER.includes(cat))
      .sort();
    return [...ordered, ...extras];
  }, [repositories]);

  const languages = useMemo(() => {
    const langs = [
      ...new Set(repositories.map((r) => r.language).filter(Boolean)),
    ];
    return langs.sort();
  }, [repositories]);

  // 2. Helper functions
  const generateCSV = (repos) => {
    const headers = [
      'Name',
      'Category',
      'Language',
      'Stars',
      'Forks',
      'Vibe Score',
      'Complexity',
      'Priority',
      'Description',
    ];
    const rows = repos.map((repo) => [
      repo.name,
      repo.category,
      repo.language || '-',
      repo.stars,
      repo.forks || 0,
      repo.vibe_score?.toFixed(1) || '-',
      repo.complexity_score || '-',
      repo.priority || '-',
      `"${(repo.description || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const fetchRepositories = async () => {
    try {
      const params = { limit: 1000 };
      const { data } = await api.get('/api/repositories', { params });
      const normalizedRepositories = (data.repositories || []).map((repo) => ({
        ...repo,
        category: normalizeCategory(repo.category),
        language: repo.primary_language || repo.language || null,
        forks: Number.isFinite(Number(repo.forks_count))
          ? Number(repo.forks_count)
          : Number(repo.forks || 0),
        description: repo.description || null,
      }));
      setRepositories(normalizedRepositories);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/api/analytics/overview');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchNetwork = async () => {
    try {
      const { data } = await api.get('/api/analytics/network');
      setNetworkData({
        nodes: data?.nodes || [],
        edges: data?.edges || [],
      });
    } catch (error) {
      console.error('Failed to fetch network data:', error);
      setNetworkData({ nodes: [], edges: [] });
    }
  };

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/status');
      if (data.authenticated) {
        setUser(data.user);
        await Promise.all([
          fetchRepositories(),
          fetchAnalytics(),
          fetchNetwork(),
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!repositories.length) {
      setAtlasStatus('Waiting for repository data...');
      setAtlasReady(false);
      return undefined;
    }

    if (!atlasProjectionReady) {
      setAtlasStatus('Waiting for Atlas projection...');
      setAtlasReady(false);
      return undefined;
    }

    const seedAtlas = async () => {
      setAtlasReady(false);
      setAtlasStatus('Seeding Atlas dataset...');
      try {
        const coordinator = await ensureCoordinator();
        if (cancelled) {
          return;
        }
        await coordinator.exec(`DROP TABLE IF EXISTS ${MASTER_TABLE}`);
        await coordinator.exec(`
          CREATE TABLE ${MASTER_TABLE} (
            repo_id TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            language TEXT,
            description TEXT,
            stars DOUBLE,
            forks DOUBLE,
            vibe_score DOUBLE,
            complexity_score DOUBLE,
            install_difficulty DOUBLE,
            priority TEXT,
            is_fork BOOLEAN,
            category_index INTEGER,
            x DOUBLE,
            y DOUBLE
          );
        `);

        const uniqueCategories = [
          ...new Set(repositories.map((repo) => repo.category).filter(Boolean)),
        ];
        const categoryIndex = {};
        uniqueCategories.forEach((cat, idx) => {
          categoryIndex[cat] = idx;
        });

        const rows = repositories.map((repo, idx) => {
          const projection = atlasProjectionMap[repo.id];
          const fallback = computeEmbeddingCoordinates(repo, idx, categoryIndex[repo.category] ?? 0);
          const x = projection?.x ?? fallback.x;
          const y = projection?.y ?? fallback.y;
          const values = [
            escapeSqlLiteral(repo.id),
            escapeSqlLiteral(repo.name),
            escapeSqlLiteral(repo.category),
            escapeSqlLiteral(repo.language),
            escapeSqlLiteral(repo.description),
            numericLiteral(repo.stars),
            numericLiteral(repo.forks),
            numericLiteral(repo.vibe_score),
            numericLiteral(repo.complexity_score),
            numericLiteral(repo.install_difficulty),
            escapeSqlLiteral(repo.priority),
            repo.is_fork ? 'TRUE' : 'FALSE',
            categoryIndex[repo.category] ?? 0,
            numericLiteral(x),
            numericLiteral(y),
          ];
          return `(${values.join(', ')})`;
        }).filter(Boolean);

        const chunkSize = 200;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize).join(',');
          // eslint-disable-next-line no-await-in-loop
          await coordinator.exec(`INSERT INTO ${MASTER_TABLE} VALUES ${chunk}`);
          if (cancelled) {
            return;
          }
        }

        if (!cancelled) {
          setAtlasSeedVersion((prev) => prev + 1);
        }
      } catch (error) {
        console.error('Atlas seeding failed', error);
        if (!cancelled) {
          setAtlasStatus('Atlas seeding failed');
        }
      }
    };

    seedAtlas();

    return () => {
      cancelled = true;
    };
  }, [repositories, atlasProjectionReady, atlasProjectionVersion, atlasProjectionMap, ensureCoordinator]);

  useEffect(() => {
    let cancelled = false;
    if (atlasSeedVersion === 0 || !coordinatorRef.current) {
      return undefined;
    }

    const refreshFilters = async () => {
      setAtlasReady(false);
      setAtlasStatus('Applying Atlas filters...');
      try {
        await rebuildFilteredTable(coordinatorRef.current, selectedCategory, selectedLanguage);
        if (cancelled) {
          return;
        }
        setAtlasTable(FILTER_TABLE);
        setAtlasReady(true);
        const categoryStatus = selectedCategory === 'all' ? 'All categories' : selectedCategory;
        const languageStatus = selectedLanguage === 'all' ? 'All languages' : selectedLanguage;
        setAtlasStatus(`Atlas ready · ${categoryStatus} · ${languageStatus}`);
      } catch (error) {
        console.error('Atlas filter update failed', error);
        if (!cancelled) {
          setAtlasStatus('Atlas filter update failed');
        }
      }
    };

    refreshFilters();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, selectedLanguage, atlasSeedVersion]);

  // 3. Event handlers
  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/sync/repositories');
      setTimeout(() => {
        Promise.all([
          fetchRepositories(),
          fetchAnalytics(),
          fetchNetwork(),
        ]).finally(() => {
          setSyncing(false);
        });
      }, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncing(false);
    }
  };

  const handleExport = (format) => {
    const dataStr = format === 'json'
      ? JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          user: user.username,
          repositories: filteredRepos,
        },
        null,
        2,
      )
      : generateCSV(filteredRepos);

    const blob = new Blob([dataStr], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `repositories.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const shuffleTheme = () => {
    const randomTheme = AESTHETIC_THEMES[Math.floor(Math.random() * AESTHETIC_THEMES.length)];
    setCurrentTheme(randomTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-scanner"></div>
          <div className="text-2xl neon-text font-display">
            Loading RepoRemix...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.colors.bg} 0%, ${currentTheme.colors.surface} 100%)`,
        fontFamily: currentTheme.font,
      }}
    >
      <section className="remix-hero" aria-label="RepoRemix landing hero">
        <img
          src="/assets/repo-hero.png"
          alt="Vintage slot machine with Repo on its reels"
          className="remix-hero-image"
        />
        <div className="remix-hero-overlay" />
        <div className="remix-hero-content pb-16">
          <div className="flex flex-col">
            <div className="remix-wordmark animate-fade-in-up" data-text="REMIX" style={{ animationDelay: '0.1s' }}>
              REMIX
            </div>
            <div className="remix-kicker animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <span className="opacity-50 tracking-[0.3em]">Consilience Ascendant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="subdomain-badge">
                reporemix
              </div>
            </div>
          </div>
        </div>
      </section>

      <header
        className="sticky top-0 z-50 glass-dark border-b"
        style={{ borderColor: `${currentTheme.colors.primary}20` }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tight text-white uppercase font-display">
                  Repo<span style={{ color: currentTheme.colors.primary }}>Remix</span>
                </h1>
                <div className="text-[10px] tracking-[0.4em] uppercase opacity-30 font-bold -mt-1">
                  Vortex Engine v2.0
                </div>
              </div>
              
              <div className="h-8 w-[1px] bg-white/10 mx-2" />

              <div className="flex items-center space-x-3">
                <button
                  onClick={shuffleTheme}
                  className="p-2 rounded-xl glass hover:bg-white/10 transition-all active:scale-95 group"
                  style={{ color: currentTheme.colors.primary }}
                  title={`Current: ${currentTheme.name} - Click to shuffle!`}
                >
                  <Shuffle size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Aesthetic</span>
                  <span className="text-sm font-medium leading-none">{currentTheme.name}</span>
                </div>
              </div>
              
              <SystemPulse theme={currentTheme} />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 glass px-4 py-2 rounded-2xl">
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-9 h-9 rounded-full ring-2 ring-white/5 shadow-xl"
                  style={{ borderColor: currentTheme.colors.primary }}
                />
                <div className="flex flex-col">
                  <div className="text-sm font-bold text-white leading-none mb-1">{user.username}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-50 font-medium">
                    {repositories.length} Active Nodes
                  </div>
                </div>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-6 py-2.5 rounded-2xl glass hover:bg-white/5 transition-all active:scale-95 flex items-center gap-2 group font-bold text-xs uppercase tracking-widest border border-white/5"
                style={{ color: currentTheme.colors.primary }}
              >
                <RefreshCw
                  size={14}
                  className={syncing ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}
                />
                {syncing ? 'Syncing...' : 'Sync Data'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {analytics && <StatsBar analytics={analytics} theme={currentTheme} />}

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-6 flex-1 min-w-[300px]">
            {/* Search */}
            <div className="relative flex-1 group">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity"
                size={18}
                style={{ color: currentTheme.colors.primary }}
              />
              <input
                type="text"
                placeholder="Search repository index..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl glass bg-black/20 focus:bg-black/40 outline-none transition-all placeholder:text-white/20 font-medium border border-white/5 focus:border-white/10"
                style={{ color: currentTheme.colors.primary }}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-3 rounded-2xl glass bg-black/20 outline-none cursor-pointer appearance-none hover:bg-black/40 transition-all font-bold text-[10px] uppercase tracking-widest border border-white/5"
                style={{ color: currentTheme.colors.primary }}
              >
                <option value="all" style={{ background: currentTheme.colors.bg }}>Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} style={{ background: currentTheme.colors.bg }}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-6 py-3 rounded-2xl glass bg-black/20 outline-none cursor-pointer appearance-none hover:bg-black/40 transition-all font-bold text-[10px] uppercase tracking-widest border border-white/5"
                style={{ color: currentTheme.colors.primary }}
              >
                <option value="all" style={{ background: currentTheme.colors.bg }}>Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang} style={{ background: currentTheme.colors.bg }}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* View Switcher */}
            <div className="flex p-1 rounded-2xl glass bg-black/20 border border-white/5">
              {[
                { id: 'kanban', icon: Layers, label: 'Board' },
                { id: 'graph', icon: Activity, label: 'Network' },
                { id: 'grid', icon: Grid, label: 'Table' },
                { id: 'atlas', icon: Map, label: 'Atlas' },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={clsx(
                    'p-3 rounded-xl transition-all flex items-center gap-2 group',
                    activeView === view.id ? 'glass bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-40 hover:opacity-100'
                  )}
                  style={{
                    color: activeView === view.id ? currentTheme.colors.primary : 'white',
                  }}
                  title={view.label}
                >
                  <view.icon size={18} className={activeView === view.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                </button>
              ))}
            </div>

            {/* Export */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="p-3 rounded-xl glass hover:bg-white/5 transition-all text-white/50 hover:text-white border border-white/5"
                title="Export CSV"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-6 mb-4 text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-white/5" />
        <span>Showing {filteredRepos.length} / {repositories.length} Nodes</span>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 py-4">
        {activeView === 'kanban' && (
          <KanbanView
            repos={filteredRepos}
            theme={currentTheme}
            categories={categories}
          />
        )}
        {activeView === 'graph' && (
          <GraphView
            repos={filteredRepos}
            theme={currentTheme}
            networkData={networkData}
          />
        )}
        {activeView === 'grid' && (
          <GridView repos={filteredRepos} theme={currentTheme} />
        )}
        {activeView === 'atlas' && (
          <AtlasView
            coordinator={coordinatorRef.current}
            table={atlasTable}
            theme={currentTheme}
            status={atlasStatus}
            ready={atlasReady && !!coordinatorRef.current}
          />
        )}
      </div>
    </div>
  );
}

function StatsBar({ analytics, theme }) {
  const stats = [
    { label: 'Intelligence', value: analytics.overview.total_repos, icon: Database, unit: 'Nodes' },
    { label: 'Reputation', value: analytics.overview.total_stars?.toLocaleString() || 0, icon: Star, unit: 'Stars' },
    { label: 'Branching', value: analytics.overview.total_forks, icon: GitFork, unit: 'Forks' },
    { label: 'Resonance', value: analytics.overview.avg_vibe_score?.toFixed(1) || 0, icon: Zap, unit: 'Vibe' },
    { label: 'Syntax', value: analytics.overview.languages_count, icon: Code, unit: 'Langs' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-2">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative flex items-center gap-4 glass p-4 rounded-2xl hover:bg-white/5 transition-all duration-500"
          >
            <div 
              className="p-3 rounded-xl glass bg-black/20 group-hover:scale-110 transition-transform duration-500"
              style={{ color: theme.colors.primary }}
            >
              <stat.icon size={20} />
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold leading-none mb-1 group-hover:opacity-60 transition-opacity">
                {stat.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white leading-none">
                  {stat.value}
                </span>
                <span className="text-[9px] uppercase tracking-widest opacity-20 font-bold">
                  {stat.unit}
                </span>
              </div>
            </div>
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ boxShadow: `inset 0 0 30px ${theme.colors.primary}10` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView({ repos, theme, categories }) {
  const laneCategories = useMemo(() => {
    const available = new Set(repos.map((repo) => repo.category || 'Other'));
    const ordered = categories.filter((category) => available.has(category));
    if (ordered.length) {
      return ordered;
    }
    return ['Other'];
  }, [repos, categories]);

  const reposByCategory = useMemo(() => {
    const grouped = {};
    laneCategories.forEach((cat) => {
      grouped[cat] = repos.filter((r) => r.category === cat);
    });
    if (!grouped.Other && repos.some((repo) => !repo.category)) {
      grouped.Other = repos.filter((repo) => !repo.category);
    }
    return grouped;
  }, [repos, laneCategories]);

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <div className="flex gap-4 min-w-max">
        {laneCategories.map((category) => (
          // Keep unknown categories visible with a neutral color instead of dropping the lane.
          <div
            key={category}
            className="kanban-column"
            style={{ borderColor: `${CATEGORY_COLORS[category] || CATEGORY_COLORS.Other}50` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-lg"
                style={{ color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other }}
              >
                {category}
              </h3>
              <span className="text-sm opacity-70 bg-black bg-opacity-30 px-2 py-1 rounded">
                {reposByCategory[category]?.length || 0}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {reposByCategory[category]?.map((repo) => (
                <RepoCard key={repo.id} repo={repo} theme={theme} />
              ))}
              {reposByCategory[category]?.length === 0 && (
                <div className="text-center py-8 opacity-50 text-sm">
                  No repositories
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemPulse({ theme }) {
  const [metrics, setMetrics] = useState(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Connect to the central Pastyche telemetry stream
    const es = new EventSource('/api/telemetry/stream');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.metrics) {
          setMetrics(data.metrics);
          setPulse(true);
          setTimeout(() => setPulse(false), 300);
        }
      } catch (err) {
        console.error('Telemetry parse error', err);
      }
    };
    es.onerror = () => {
      es.close();
      setTimeout(() => {
        // Simple reconnect logic
      }, 5000);
    };
    return () => es.close();
  }, []);

  if (!metrics) return null;

  return (
    <div
      className="flex items-center gap-4 px-3 py-1 rounded-full bg-black bg-opacity-30 border"
      style={{ borderColor: `${theme.colors.primary}20` }}
    >
      <div
        className={clsx(
          'w-2 h-2 rounded-full transition-all duration-300',
          pulse ? 'bg-green-400 scale-125' : 'bg-green-800',
        )}
        style={{ boxShadow: pulse ? '0 0 10px #4ade80' : 'none' }}
      />
      <div className="flex gap-3 text-[10px] font-mono tracking-tighter uppercase opacity-70">
        <span title="Total System Concepts">
          CONCEPTS: {metrics.concepts?.toLocaleString()}
        </span>
        <span title="Neural Edges">EDGES: {metrics.edges?.toLocaleString()}</span>
        <span title="Memory Items">ITEMS: {metrics.items?.toLocaleString()}</span>
      </div>
    </div>
  );
}

function RepoCard({ repo, theme }) {
  return (
    <div
      className="group flex flex-col min-h-[160px] glass p-5 rounded-2xl hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
      style={{
        borderColor: `${theme.colors.primary}20`,
      }}
    >
      <div className="flex items-start justify-between mb-3 relative z-10">
        <h4
          className="font-black text-[13px] leading-tight line-clamp-2 uppercase tracking-tight group-hover:translate-x-1 transition-transform"
          style={{ color: theme.colors.primary }}
          title={repo.name}
        >
          {repo.name}
        </h4>
        <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
          {repo.is_fork && <GitFork size={12} />}
          <Star size={12} className="fill-current" />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed opacity-40 font-medium line-clamp-3 mb-auto group-hover:opacity-70 transition-opacity relative z-10">
        {repo.description || 'No conceptual metadata available for this node.'}
      </p>

      <div
        className="flex justify-between items-end mt-4 pt-4 border-t border-white/5 relative z-10"
      >
        <div className="flex gap-3">
          {repo.language && (
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-widest opacity-30 font-bold mb-1">Stack</span>
              <span className="text-[10px] font-mono text-white/50">{repo.language}</span>
            </div>
          )}
          {repo.stars > 0 && (
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-widest opacity-30 font-bold mb-1">Trust</span>
              <span className="text-[10px] font-mono text-white/50">{repo.stars}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
             <div className="opacity-20 uppercase text-[8px] font-bold tracking-widest mb-1">Entropy</div>
             <div className="text-[10px] font-black" style={{ color: theme.colors.primary }}>{repo.complexity_score || 1}</div>
          </div>
          <div className="flex flex-col items-end">
             <div className="opacity-20 uppercase text-[8px] font-bold tracking-widest mb-1">Density</div>
             <div className="text-[10px] font-black" style={{ color: theme.colors.primary }}>{repo.install_difficulty || 1}</div>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div 
        className="absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ background: theme.colors.primary }}
      />
    </div>
  );
}

function GraphView({ repos, theme, networkData }) {
  const graphRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!repos.length || !containerRef.current) {
      return undefined;
    }

    const nodes = repos.map((repo) => {
      const stars = Number.isFinite(Number(repo.stars)) ? Number(repo.stars) : 0;
      return {
        id: repo.id,
        name: repo.name,
        category: repo.category,
        stars,
        vibe_score: repo.vibe_score,
        val: Math.log(stars + 1) * 5,
      };
    });

    const links = [];
    const visibleIds = new Set(nodes.map((node) => node.id));
    const edgeKeys = new Set();

    const addLink = (source, target, relationshipType = 'related', value = 1) => {
      if (!source || !target || source === target) {
        return;
      }
      if (!visibleIds.has(source) || !visibleIds.has(target)) {
        return;
      }
      const [a, b] = [String(source), String(target)].sort();
      const key = `${a}|${b}|${relationshipType}`;
      if (edgeKeys.has(key)) {
        return;
      }
      edgeKeys.add(key);
      links.push({
        source,
        target,
        relationship_type: relationshipType,
        value,
      });
    };

    if (Array.isArray(networkData?.edges)) {
      networkData.edges.forEach((edge) => {
        addLink(
          edge.source_repo_id || edge.source,
          edge.target_repo_id || edge.target,
          edge.relationship_type || 'related',
          Number(edge.strength) || 1,
        );
      });
    }

    if (!links.length) {
      const repoByFullName = new Map(
        repos
          .filter((repo) => repo.full_name)
          .map((repo) => [repo.full_name, repo.id]),
      );

      repos.forEach((repo) => {
        if (repo.is_fork && repo.parent_repo) {
          addLink(repoByFullName.get(repo.parent_repo), repo.id, 'fork', 1);
        }
      });
    }

    if (!links.length) {
      const categoryGroups = new Map();
      repos.forEach((repo) => {
        const key = repo.category || 'Other';
        if (!categoryGroups.has(key)) {
          categoryGroups.set(key, []);
        }
        categoryGroups.get(key).push(repo);
      });

      categoryGroups.forEach((group) => {
        const sortedGroup = [...group].sort((a, b) => {
          const starsDiff = Number(b.stars || 0) - Number(a.stars || 0);
          if (starsDiff !== 0) {
            return starsDiff;
          }
          return String(a.id).localeCompare(String(b.id));
        });
        const anchor = sortedGroup[0];
        sortedGroup.slice(1).forEach((repo) => {
          addLink(anchor.id, repo.id, 'category', 0.5);
        });
      });
    }

    const graph = ForceGraph()(containerRef.current)
      .graphData({ nodes, links })
      .nodeLabel('name')
      .nodeColor((node) => CATEGORY_COLORS[node.category] || '#6b7280')
      .nodeVal('val')
      .linkWidth((link) => (link.relationship_type === 'fork' ? 1.8 : 1.1))
      .linkColor(() => `${theme.colors.primary}30`)
      .backgroundColor(theme.colors.bg)
      .width(containerRef.current.clientWidth)
      .height(600);

    graphRef.current = graph;

    return () => {
      if (graphRef.current) {
        // eslint-disable-next-line no-underscore-dangle
        graphRef.current._destructor();
      }
    };
  }, [repos, theme, networkData]);

  return (
    <div
      ref={containerRef}
      className="force-graph-container"
      style={{ borderColor: `${theme.colors.primary}50` }}
    />
  );
}

function GridView({ repos, theme }) {
  return (
    <div className="cyber-grid rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="cyber-grid-header">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Language</th>
              <th className="px-4 py-3 text-right">Stars</th>
              <th className="px-4 py-3 text-right">Vibe</th>
              <th className="px-4 py-3 text-right">Complexity</th>
              <th className="px-4 py-3 text-right">Install</th>
              <th className="px-4 py-3 text-left">Priority</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((repo) => (
              <tr key={repo.id} className="cyber-grid-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {repo.is_fork && (
                      <GitFork size={14} className="opacity-50" />
                    )}
                    <span
                      className="font-medium"
                      style={{ color: theme.colors.primary }}
                    >
                      {repo.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="cyber-badge"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[repo.category] || CATEGORY_COLORS.Other}20`,
                      borderColor: `${CATEGORY_COLORS[repo.category] || CATEGORY_COLORS.Other}50`,
                      color: CATEGORY_COLORS[repo.category] || CATEGORY_COLORS.Other,
                    }}
                  >
                    {repo.category || 'Other'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{repo.language || '-'}</td>
                <td className="px-4 py-3 text-right">
                  {repo.stars?.toLocaleString() || 0}
                </td>
                <td className="px-4 py-3 text-right">
                  {repo.vibe_score?.toFixed(0) || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  {repo.complexity_score || '-'}/10
                </td>
                <td className="px-4 py-3 text-right">
                  {repo.install_difficulty || '-'}/10
                </td>
                <td className="px-4 py-3">
                  {repo.priority && (
                    <span
                      className="cyber-badge"
                      style={{
                        backgroundColor: `${theme.colors.secondary}20`,
                        borderColor: `${theme.colors.secondary}50`,
                        color: theme.colors.secondary,
                      }}
                    >
                      {repo.priority}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AtlasView({
  coordinator, table, theme, status, ready,
}) {
  const chartTheme = useMemo(() => buildAtlasChartTheme(theme), [theme]);
  return (
    <div className="atlas-shell">
      {!ready && (
        <div className="atlas-loading-overlay">
          <span className="text-sm font-semibold">{status}</span>
        </div>
      )}
      <div className="atlas-view-container">
        {ready && coordinator && (
          <EmbeddingAtlas
            coordinator={coordinator}
            data={{
              table,
              id: 'repo_id',
              projection: { x: 'x', y: 'y' },
              text: 'description',
            }}
            colorScheme={chartTheme.scheme ?? 'dark'}
            chartTheme={chartTheme}
            embeddingViewConfig={{
              mode: 'points',
              pointSize: 4,
              minimumDensity: 0.2,
            }}
            defaultChartsConfig={{ exclude: ['repo_id', 'x', 'y'] }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
