# 🎨 REPOREMIX FRONTEND REFACTOR PLAN

**Date**: March 15, 2026  
**Status**: 📋 **PLANNING**  
**Source**: `/Volumes/OMNI_01/70_CLONED_REPOS/reporemix/`  

---

## 📊 CURRENT STATE

### Issues:
- ❌ **1,521 lines** in single `App.jsx` file
- ❌ **No component structure** (no `/components` folder)
- ❌ **No custom hooks** (all logic in App)
- ❌ **No type safety** (plain JSX, no TypeScript)
- ❌ **No state management** (useState spaghetti)
- ❌ **No separation of concerns** (UI + logic + API mixed)

### What Exists:
- ✅ Vite + React setup
- ✅ Tailwind CSS configured
- ✅ Force-graph integration
- ✅ EmbeddingAtlas integration
- ✅ Mosaic (uwdata) for visualization
- ✅ Axios for API calls
- ✅ Lucide React icons

---

## 🎯 REFACTOR GOALS

### Phase 1: Component Architecture (Week 1)
1. **Extract Components** - Break 1,521 lines into 20+ focused components
2. **Create Hooks** - Custom hooks for state management
3. **Add Context** - React Context for global state
4. **Improve Types** - JSDoc + PropTypes or migrate to TypeScript

### Phase 2: State Management (Week 2)
1. **Zustand Store** - Lightweight global state
2. **React Query** - Server state + caching
3. **Optimistic Updates** - Better UX
4. **Error Boundaries** - Graceful error handling

### Phase 3: Performance (Week 3)
1. **Code Splitting** - Route-based lazy loading
2. **Memoization** - useMemo/useCallback optimization
3. **Virtual Scrolling** - Large list performance
4. **Web Workers** - Heavy computation off main thread

### Phase 4: Polish (Week 4)
1. **Animations** - Framer Motion
2. **Responsive Design** - Mobile-first
3. **Accessibility** - WCAG 2.1 AA
4. **Testing** - Vitest + React Testing Library

---

## 📁 PROPOSED STRUCTURE

```
client/
├── src/
│   ├── components/           # UI Components
│   │   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── index.js
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── index.js
│   │   ├── graph/            # Graph visualization
│   │   │   ├── ForceGraph.jsx
│   │   │   ├── GraphNode.jsx
│   │   │   ├── GraphControls.jsx
│   │   │   └── index.js
│   │   ├── repo/             # Repository components
│   │   │   ├── RepoCard.jsx
│   │   │   ├── RepoList.jsx
│   │   │   ├── RepoFilters.jsx
│   │   │   └── index.js
│   │   ├── kanban/           # Kanban board
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── KanbanCard.jsx
│   │   │   └── index.js
│   │   ├── analytics/        # Analytics components
│   │   │   ├── TimeSeries.jsx
│   │   │   ├── ComplexityChart.jsx
│   │   │   └── index.js
│   │   └── search/           # Search components
│   │       ├── SearchBar.jsx
│   │       ├── SearchResults.jsx
│   │       ├── EmbeddingView.jsx
│   │       └── index.js
│   │
│   ├── hooks/                # Custom React Hooks
│   │   ├── useRepos.js
│   │   ├── useGraph.js
│   │   ├── useSearch.js
│   │   ├── useKanban.js
│   │   ├── useEmbeddings.js
│   │   └── index.js
│   │
│   ├── context/              # React Context
│   │   ├── RepoContext.jsx
│   │   ├── GraphContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── index.js
│   │
│   ├── store/                # Zustand Store
│   │   ├── repoStore.js
│   │   ├── graphStore.js
│   │   ├── uiStore.js
│   │   └── index.js
│   │
│   ├── services/             # API Services
│   │   ├── api.js            # Axios instance
│   │   ├── repos.js          # Repo API calls
│   │   ├── graph.js          # Graph API calls
│   │   ├── search.js         # Search API calls
│   │   └── index.js
│   │
│   ├── utils/                # Utility Functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── index.js
│   │
│   ├── styles/               # Styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── themes.css
│   │
│   ├── App.jsx               # Main App (now <200 lines)
│   └── main.jsx              # Entry point
│
├── public/
│   └── assets/
│
├── tests/                    # Tests
│   ├── components/
│   ├── hooks/
│   └── utils/
│
└── package.json
```

---

## 🔧 REFACTOR STEPS

### Step 1: Extract UI Components (Day 1-2)

**From App.jsx**:
```jsx
// Current: All inline
<button className="px-4 py-2 bg-primary text-white rounded">Click</button>

// To: Reusable component
import { Button } from '@/components/ui';
<Button variant="primary">Click</Button>
```

**Components to Extract**:
- Button (5 variants)
- Card (3 variants)
- Input (with validation)
- Modal (with portal)
- Tooltip
- Dropdown
- Tabs
- Badge
- Avatar
- Skeleton (loading states)

---

### Step 2: Extract Layout Components (Day 3)

**Create**:
- `Header` - Logo, nav, user menu
- `Sidebar` - Navigation, filters
- `Footer` - Links, credits
- `PageLayout` - Standard page wrapper
- `DashboardLayout` - Dashboard with sidebar

---

### Step 3: Extract Feature Components (Day 4-7)

**Graph Components**:
```jsx
// Before: 400 lines in App.jsx
const renderGraph = () => { /* ... */ }

// After: Dedicated component
<ForceGraph
  data={graphData}
  onNodeClick={handleNodeClick}
  controls={true}
/>
```

**Repo Components**:
```jsx
<RepoList repos={repos} filters={filters} />
<RepoCard repo={repo} onSelect={handleSelect} />
<RepoFilters filters={filters} onChange={setFilters} />
```

**Kanban Components**:
```jsx
<KanbanBoard columns={columns} onDragEnd={handleDragEnd} />
<KanbanColumn column={column} cards={cards} />
<KanbanCard card={card} />
```

---

### Step 4: Create Custom Hooks (Day 8-10)

**useRepos**:
```jsx
export function useRepos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/repos');
      setRepos(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { repos, loading, error, fetchRepos };
}
```

**useGraph**:
```jsx
export function useGraph() {
  const graphRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const initGraph = useCallback((container) => {
    graphRef.current = ForceGraph()(container)
      .graphData(graphData)
      .nodeLabel('name')
      .linkDirectionalParticles(2);
  }, [graphData]);

  return { graphRef, graphData, initGraph, setGraphData };
}
```

---

### Step 5: Add State Management (Day 11-14)

**Zustand Store**:
```jsx
// store/repoStore.js
import { create } from 'zustand';

export const useRepoStore = create((set) => ({
  repos: [],
  filters: {},
  searchQuery: '',
  
  setRepos: (repos) => set({ repos }),
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Actions
  fetchRepos: async () => {
    const { data } = await api.get('/repos');
    set({ repos: data });
  },
}));
```

**Usage**:
```jsx
function RepoList() {
  const { repos, filters, fetchRepos } = useRepoStore();
  
  useEffect(() => {
    fetchRepos();
  }, []);

  return <div>...</div>;
}
```

---

### Step 6: Add React Query (Day 15-17)

**Replace**:
```jsx
// Before: Manual fetching
const [repos, setRepos] = useState([]);
useEffect(() => {
  api.get('/repos').then(({ data }) => setRepos(data));
}, []);

// After: React Query
const { data: repos, isLoading, error } = useQuery({
  queryKey: ['repos'],
  queryFn: () => api.get('/repos').then(r => r.data),
});
```

**Benefits**:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Retry logic

---

### Step 7: Performance Optimization (Day 18-21)

**Code Splitting**:
```jsx
// Before: Everything loaded at once
import GraphView from './GraphView';

// After: Lazy loading
const GraphView = lazy(() => import('./GraphView'));

<Suspense fallback={<Loading />}>
  <GraphView />
</Suspense>
```

**Memoization**:
```jsx
// Before: Recalculates every render
const filteredRepos = repos.filter(r => r.stars > 100);

// After: Only recalculates when deps change
const filteredRepos = useMemo(
  () => repos.filter(r => r.stars > 100),
  [repos]
);
```

**Virtual Scrolling**:
```jsx
// Before: Renders all 1000 items
{repos.map(repo => <RepoCard key={repo.id} repo={repo} />)}

// After: Only renders visible items
<VirtualList
  items={repos}
  itemHeight={100}
  renderItem={(repo) => <RepoCard repo={repo} />}
/>
```

---

## 📊 METRICS

### Before:
- **1 file**: App.jsx (1,521 lines)
- **0 components**
- **0 hooks**
- **0 context**
- **0 tests**
- **Bundle size**: ~500 KB

### After (Target):
- **30+ files**: Organized structure
- **20+ components**: Reusable, tested
- **10+ hooks**: Composable logic
- **3 context**: Global state
- **50+ tests**: 80% coverage
- **Bundle size**: ~300 KB (with code splitting)

---

## 🎯 QUICK WINS (First 2 Days)

### Day 1: Extract UI Components
1. Create `/components/ui` folder
2. Extract Button, Card, Input, Modal
3. Replace inline usage in App.jsx
4. **Result**: -200 lines from App.jsx

### Day 2: Extract Layout
1. Create `/components/layout` folder
2. Extract Header, Sidebar, Footer
3. Create PageLayout wrapper
4. **Result**: -300 lines from App.jsx

**Total Reduction**: 500 lines (33% reduction) on Day 1-2!

---

## 🧪 TESTING STRATEGY

### Unit Tests (Vitest):
```jsx
// tests/components/Button.test.jsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Tests:
```jsx
// tests/features/repo-search.test.jsx
test('searches repos on input', async () => {
  render(<SearchBar />);
  await user.type(screen.getByRole('searchbox'), 'react');
  expect(await screen.findByText(/results/i)).toBeInTheDocument();
});
```

### E2E Tests (Playwright):
```jsx
// tests/e2e/graph.spec.js
test('displays force graph', async ({ page }) => {
  await page.goto('/graph');
  await expect(page.locator('canvas')).toBeVisible();
});
```

---

## 📋 MIGRATION CHECKLIST

### Phase 1: Component Extraction
- [ ] Create folder structure
- [ ] Extract UI components (Button, Card, Input, Modal)
- [ ] Extract layout components (Header, Sidebar, Footer)
- [ ] Extract graph components (ForceGraph, Controls)
- [ ] Extract repo components (Card, List, Filters)
- [ ] Extract kanban components (Board, Column, Card)
- [ ] Update App.jsx imports

### Phase 2: State Management
- [ ] Install Zustand + React Query
- [ ] Create repo store
- [ ] Create graph store
- [ ] Create UI store
- [ ] Replace useState with store
- [ ] Add React Query for API calls

### Phase 3: Custom Hooks
- [ ] Create useRepos hook
- [ ] Create useGraph hook
- [ ] Create useSearch hook
- [ ] Create useKanban hook
- [ ] Create useEmbeddings hook
- [ ] Replace inline logic with hooks

### Phase 4: Performance
- [ ] Add code splitting
- [ ] Add memoization
- [ ] Add virtual scrolling
- [ ] Optimize bundle size
- [ ] Add loading states

### Phase 5: Polish
- [ ] Add animations (Framer Motion)
- [ ] Improve responsive design
- [ ] Add accessibility (ARIA)
- [ ] Write tests (80% coverage)
- [ ] Documentation

---

## 🚀 GETTING STARTED

### 1. Install Dependencies:
```bash
cd /Volumes/OMNI_01/70_CLONED_REPOS/reporemix/client
npm install zustand @tanstack/react-query framer-motion
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

### 2. Create Folder Structure:
```bash
mkdir -p src/components/{ui,layout,graph,repo,kanban,analytics,search}
mkdir -p src/{hooks,context,store,services,utils,styles}
mkdir -p tests/{components,hooks,utils}
```

### 3. Start Refactoring:
```bash
# Day 1: Extract UI components
# Day 2: Extract layout
# Day 3-7: Extract feature components
# ...
```

---

**Ready to build a proper frontend!** 🚀

**Godspeed! 🚀**
