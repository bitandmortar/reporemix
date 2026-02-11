# RepoRemix 🎯

> **"When in doubt, fork."**

RepoRemix is a production-grade semantic engine for tracking and governing your GitHub repository network. It transforms flat fork lists into a **deterministic ontology lattice** with interactive dashboards, temporal analytics, and shuffleable aesthetics.

![License](https://img.shields.io/badge/license-MIT-ffd166.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-ffd166.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14.0-ffd166.svg)
![macOS](https://img.shields.io/badge/OS-macOS--ARM64-000.svg)

---

## ✨ System Highlights

### 🔐 Deterministic Provenance

- **OAuth 2.0 Ingress**: Secure sessions via GitHub with encrypted token persistence.
- **Immutable Ledger**: Every push, star, and fork event is captured in the event spine.
- **Fork Status tracking**: Real-time diffing between your network and upstream sources.

### 📊 The Visualization Matrix

- **Force-Directed Graph**: A physics-based network topology of your repository relationships.
- **Vibe-Kanban Board**: Drag-and-drop ontological management (Agent / Engine / Utility / Research).
- **Temporal Analytics**: Time-series tracking of clones, stars, and contribution velocity.
- **Metric Abacus**: Complexity, install difficulty, and maintenance load scores.

---

## 🚀 Native macOS (ARM64) Setup

RepoRemix is designed for native execution on Apple Silicon. Skip Docker; stay close to the metal.

### Prerequisites

- **Node.js 20+** (via Homebrew or pkg)
- **PostgreSQL 14+** (`brew install postgresql@14`)
- **pgvector** (for semantic search rankings)

### Installation

```bash
# 1. Clone & Install
git clone https://github.com/bitandmortar/reporemix.git
cd reporemix
npm install

# 2. Database Core
createdb reporemix
npm run migrate

# 3. Secure Ingress
cp .env.example .env
# Populated .env with GitHub OAuth keys, Database URL, and Session Secret.
```

### Start Development

```bash
npm run dev
```

Explore the lattice at `http://localhost:3000`.

---

## 🏗️ The Data Spine (Schema)

RepoRemix is structured around a **normalized, expandable lattice** of tables that capture identity, coverage, metrics, intelligence, AI context, and event history:

1. **Identity**: `users` plus `auth_accounts` keep authentication multi-provider ready.
2. **Core**: `repositories`, `owners`, and `licenses` describe the canonical GitHub footprint.
3. **Metrics**: `repository_metrics` and `clone_activity` store time-series telemetry.
4. **Intelligence**: `languages`, `dependencies`, and `code_quality` layer domain insights.
5. **AI Layer**: `repository_classifications` and high-dimensional `repository_embeddings` drive semantic reasoning.
6. **Lattice Events**: `repository_events` and `repository_scores` chronicle the evolving "Good Juju" index.

---

## 🎨 The Ontology Lattice

Repos are mapped to human-curated tracks that are boosted by AI inference:

- **🤖 Agent**: Large-scale autonomous systems and multi-agent orchestrators.
- **🏗️ Engine**: Foundational frameworks, platforms, and infrastructure tooling.
- **🔧 Utility**: Developer-facing tools, CLIs, and automation helpers.
- **📚 Research**: Data sets, experiments, documentation, and learning resources.
- **🎨 UI**: Visualization engines, design systems, and interactive frontend surfaces.

---

## 🧭 Atlas Embeddings Export

- `GET /api/repositories` now returns `embedding_vector` (pgvector -> float array) plus the `embedding_model` tag for each row; those vectors come from `server/services/embeddings.js`, which normalizes repo metadata plus ontology signals into a deterministic 1536-dim array and writes it to `repository_embeddings` every sync in `services/syncWorker.js`, so the Atlas tab always mirrors the latest Apple-grade projection data.
- The Atlas tab (Map icon in the view switcher) uses the same `AESTHETIC_THEMES` palettes and language/category filters as the kanban/graph/grid views; filters rebuild the `reporemix_filtered` DuckDB table so the embedding dataset mirrors whatever subset the user has selected, and the overlay status ensures you can hook the same palette/filter state into other UI/settings exports.
- The overlay in the Atlas view reports projection status and falls back to the synthetic projection when no embeddings exist yet. Theme palettes and filter hooks live in `client/src/App.jsx` so you can extend settings/exports to expose them elsewhere.
- Palette presets capture the same `primary`, `secondary`, `bg`, and `surface` colors used across the UI, so style shuffles ripple through the Atlas viewer without extra wiring.

## 🔌 API Endpoints (REST)

**Auth**: `GET /auth/github`, `GET /auth/status`, `GET /auth/logout`  
**Data**: `GET /api/repositories`, `POST /api/repositories/sync`  
**Insights**: `GET /api/analytics/overview`, `GET /api/analytics/network`  
**Export**: `GET /api/export/csv`, `GET /api/export/json`, `GET /api/export/md`

---

## 🤝 Contributing

We value human judgment and repeatable intention.

1. **Fork** (When in doubt).
2. **Branch** (`feat/your-contribution`).
3. **Commit** (Conventional Commits).
4. **Push** & Open PR.

See `CONTRIBUTING.md` for our full "Code like you care" guidelines.

---

## 📝 License & Ethos

Distributed under the **MIT License**. Built for studios that need trust at scale.

**Julian Mackler**  
**BIT AND MORTAR SYSTEMS**  
[bitandmortar.com](https://bitandmortar.com)

---

### Made with 💙 by Julian Mackler / bitandmortar
