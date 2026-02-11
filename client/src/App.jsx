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
      primary: '#00a9ad',
      secondary: '#fcd77f',
      bg: '#02060a',
      surface: '#0c131a',
    },
    font: 'Orbitron',
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
  {
    name: 'Realism',
    colors: {
      primary: '#4a3b2b',
      secondary: '#bd9b7c',
      bg: '#0b0b0b',
      surface: '#1c1714',
    },
    font: 'EB Garamond',
  },
  {
    name: 'Romanticism',
    colors: {
      primary: '#7b1e23',
      secondary: '#f4bf76',
      bg: '#0c0404',
      surface: '#1c0e0f',
    },
    font: 'Charter',
  },
  {
    name: 'Tonalism',
    colors: {
      primary: '#3c2f2a',
      secondary: '#a79d92',
      bg: '#060504',
      surface: '#1a1814',
    },
    font: 'Source Sans Pro',
  },
  {
    name: 'Pre-Raphaelite',
    colors: {
      primary: '#275543',
      secondary: '#d7c491',
      bg: '#0b1511',
      surface: '#182c25',
    },
    font: 'Gentium Book Basic',
  },
  {
    name: 'Swiss/International Typographic Style',
    colors: {
      primary: '#0d0d0d',
      secondary: '#fafafa',
      bg: '#f6f6f6',
      surface: '#ffffff',
    },
    font: 'Helvetica',
  },
];

const CATEGORY_COLORS = {
  Agent: '#a855f7',
  Foundation: '#3b82f6',
  Tool: '#10b981',
  Knowledge: '#f59e0b',
  Infrastructure: '#ef4444',
  UI: '#ec4899',
  Data: '#06b6d4',
  Other: '#6b7280',
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
  const [currentTheme, setCurrentTheme] = useState(AESTHETIC_THEMES[0]);
  const [analytics, setAnalytics] = useState(null);
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
          setAtlasStatus('Atlas projection failed; using fallback projection');
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
    const cats = [
      ...new Set(repositories.map((r) => r.category).filter(Boolean)),
    ];
    return cats.sort();
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
      setRepositories(data.repositories);
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

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/status');
      if (data.authenticated) {
        setUser(data.user);
        fetchRepositories();
        fetchAnalytics();
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
        fetchRepositories();
        fetchAnalytics();
        setSyncing(false);
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
      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: `${currentTheme.colors.primary}30` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold font-display neon-text">
                RepoRemix
              </h1>
              <button
                onClick={shuffleTheme}
                className="p-2 rounded-lg border transition-all hover:scale-110"
                style={{
                  borderColor: currentTheme.colors.primary,
                  color: currentTheme.colors.primary,
                }}
                title={`Current: ${currentTheme.name} - Click to shuffle!`}
              >
                <Shuffle size={20} />
              </button>
              <span className="text-sm opacity-70">{currentTheme.name}</span>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: currentTheme.colors.primary }}
              />
              <div>
                <div className="font-semibold">{user.username}</div>
                <div className="text-sm opacity-70">
                  {repositories.length} repos
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 flex items-center gap-2"
                style={{
                  borderColor: currentTheme.colors.primary,
                  color: currentTheme.colors.primary,
                }}
                title="Refresh data"
              >
                <RefreshCw
                  size={16}
                  className={syncing ? 'animate-spin' : ''}
                />
                {syncing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {analytics && <StatsBar analytics={analytics} theme={currentTheme} />}

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{ color: currentTheme.colors.primary }}
              />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-transparent"
                style={{
                  borderColor: `${currentTheme.colors.primary}50`,
                  color: currentTheme.colors.primary,
                }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-transparent"
              style={{
                borderColor: `${currentTheme.colors.primary}50`,
                color: currentTheme.colors.primary,
              }}
            >
              <option
                value="all"
                style={{ background: currentTheme.colors.bg }}
              >
                All Categories
              </option>
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  style={{ background: currentTheme.colors.bg }}
                >
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-transparent"
              style={{
                borderColor: `${currentTheme.colors.primary}50`,
                color: currentTheme.colors.primary,
              }}
            >
              <option
                value="all"
                style={{ background: currentTheme.colors.bg }}
              >
                All Languages
              </option>
              {languages.map((lang) => (
                <option
                  key={lang}
                  value={lang}
                  style={{ background: currentTheme.colors.bg }}
                >
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2">
            {[
              { id: 'kanban', icon: Layers },
              { id: 'graph', icon: Activity },
              { id: 'grid', icon: Grid },
              { id: 'atlas', icon: Map },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={clsx(
                  'px-4 py-2 rounded-lg border-2 transition-all hover:scale-105',
                  activeView === view.id && 'bg-opacity-20',
                )}
                style={{
                  borderColor: currentTheme.colors.primary,
                  color: currentTheme.colors.primary,
                  backgroundColor:
                    activeView === view.id
                      ? `${currentTheme.colors.primary}30`
                      : 'transparent',
                }}
                title={`${view.id.charAt(0).toUpperCase() + view.id.slice(1)} View`}
              >
                <view.icon size={18} />
              </button>
            ))}
          </div>

          {/* Export */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 flex items-center gap-2"
              style={{
                borderColor: currentTheme.colors.secondary,
                color: currentTheme.colors.secondary,
              }}
              title="Export as CSV"
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 flex items-center gap-2"
              style={{
                borderColor: currentTheme.colors.secondary,
                color: currentTheme.colors.secondary,
              }}
              title="Export as JSON"
            >
              <Download size={16} /> JSON
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-2 text-sm opacity-70">
          Showing {filteredRepos.length} of {repositories.length} repositories
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 py-4">
        {activeView === 'kanban' && (
          <KanbanView repos={filteredRepos} theme={currentTheme} />
        )}
        {activeView === 'graph' && (
          <GraphView repos={filteredRepos} theme={currentTheme} />
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
    {
      label: 'Total Repos',
      value: analytics.overview.total_repos,
      icon: Database,
    },
    {
      label: 'Total Stars',
      value: analytics.overview.total_stars?.toLocaleString() || 0,
      icon: Star,
    },
    {
      label: 'Total Forks',
      value: analytics.overview.total_forks,
      icon: GitFork,
    },
    {
      label: 'Avg Vibe Score',
      value: analytics.overview.avg_vibe_score?.toFixed(1) || 0,
      icon: Zap,
    },
    {
      label: 'Languages',
      value: analytics.overview.languages_count,
      icon: Code,
    },
  ];

  return (
    <div
      className="border-b"
      style={{ borderColor: `${theme.colors.primary}30` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-4 rounded-lg border transition-all hover:scale-105"
              style={{ borderColor: `${theme.colors.primary}30` }}
            >
              <stat.icon
                size={24}
                className="mx-auto mb-2"
                style={{ color: theme.colors.primary }}
              />
              <div
                className="text-2xl font-bold"
                style={{ color: theme.colors.primary }}
              >
                {stat.value}
              </div>
              <div className="text-sm opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const KANBAN_CATEGORIES = [
  'Agent',
  'Foundation',
  'Tool',
  'Knowledge',
  'Infrastructure',
  'UI',
  'Data',
  'Other',
];

function KanbanView({ repos, theme }) {
  const reposByCategory = useMemo(() => {
    const grouped = {};
    KANBAN_CATEGORIES.forEach((cat) => {
      grouped[cat] = repos.filter((r) => r.category === cat);
    });
    return grouped;
  }, [repos]);

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <div className="flex gap-4 min-w-max">
        {KANBAN_CATEGORIES.map((category) => (
          <div
            key={category}
            className="kanban-column"
            style={{ borderColor: `${CATEGORY_COLORS[category]}50` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-lg"
                style={{ color: CATEGORY_COLORS[category] }}
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

function RepoCard({ repo, theme }) {
  return (
    <div
      className="kanban-card group"
      style={{ borderColor: `${theme.colors.primary}30` }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4
          className="font-semibold truncate flex-1"
          style={{ color: theme.colors.primary }}
        >
          {repo.name}
        </h4>
        <div className="flex items-center gap-1 ml-2">
          {repo.is_fork && <GitFork size={14} className="opacity-50" />}
          {repo.priority && (
            <span
              className="text-xs px-1 py-0.5 rounded"
              style={{
                backgroundColor: `${theme.colors.secondary}30`,
                color: theme.colors.secondary,
              }}
            >
              {repo.priority}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm opacity-70 line-clamp-2 mb-3">
        {repo.description || 'No description'}
      </p>

      <div className="flex items-center gap-3 text-xs mb-2 flex-wrap">
        {repo.language && (
          <span className="flex items-center gap-1">
            <Code size={12} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={12} />
          {repo.stars?.toLocaleString()}
        </span>
        {repo.vibe_score && (
          <span className="flex items-center gap-1">
            <Zap size={12} />
            {repo.vibe_score.toFixed(0)}
          </span>
        )}
      </div>

      {repo.complexity_score && (
        <div
          className="mt-2 pt-2 border-t"
          style={{ borderColor: `${theme.colors.primary}20` }}
        >
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="opacity-70">Complexity:</span>
              <span style={{ color: theme.colors.secondary }}>
                {repo.complexity_score}/10
              </span>
            </div>
            {repo.install_difficulty && (
              <div className="flex justify-between">
                <span className="opacity-70">Install:</span>
                <span style={{ color: theme.colors.secondary }}>
                  {repo.install_difficulty}/10
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GraphView({ repos, theme }) {
  const graphRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!repos.length || !containerRef.current) {
      return undefined;
    }

    const nodes = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      category: repo.category,
      stars: repo.stars,
      vibe_score: repo.vibe_score,
      val: Math.log(repo.stars + 1) * 5,
    }));

    // Create some links based on categories and languages
    const links = [];
    repos.forEach((repo, i) => {
      // Link repos in same category occasionally
      if (Math.random() > 0.7) {
        const sameCategory = repos.find(
          (r, j) => j > i && r.category === repo.category,
        );
        if (sameCategory) {
          links.push({ source: repo.id, target: sameCategory.id });
        }
      }
    });

    const graph = ForceGraph()(containerRef.current)
      .graphData({ nodes, links })
      .nodeLabel('name')
      .nodeColor((node) => CATEGORY_COLORS[node.category] || '#6b7280')
      .nodeVal('val')
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
  }, [repos, theme]);

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
                      backgroundColor: `${CATEGORY_COLORS[repo.category]}20`,
                      borderColor: `${CATEGORY_COLORS[repo.category]}50`,
                      color: CATEGORY_COLORS[repo.category],
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
