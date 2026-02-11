![RepoRemix Hero](client/public/assets/repo-hero.png)

# RepoRemix

Track and manage your GitHub repository network with semantic search, interactive visualizations, and temporal analytics.

![License](https://img.shields.io/badge/license-MIT-ffd166.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-ffd166.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D14.0-ffd166.svg)

-----

## Features

**Authentication & Data**: OAuth 2.0 integration with GitHub. Immutable event tracking for commits, stars, and forks. Real-time fork status monitoring.

**Visualization**: Force-directed network graphs, drag-and-drop kanban boards, time-series analytics, and complexity scoring.

**Classification**: Organize repositories by type—Agent, Engine, Utility, Research, UI—with AI-assisted categorization.

**Embeddings**: Export semantic vectors for external analysis and clustering.

-----

## Setup

Built for macOS ARM64. Requires Node.js 20+, PostgreSQL 14+, and pgvector.

```bash
git clone https://github.com/bitandmortar/reporemix.git
cd reporemix
npm install

createdb reporemix
npm run migrate

cp .env.example .env
# Add GitHub OAuth credentials and database URL
```

Start the server:

```bash
npm run dev
```

Open `http://localhost:3000`.

-----

## Database Schema

Normalized tables for identity, metrics, intelligence, and events:

- **Identity**: `users`, `auth_accounts`
- **Core**: `repositories`, `owners`, `licenses`
- **Metrics**: `repository_metrics`, `clone_activity`
- **Intelligence**: `languages`, `dependencies`, `code_quality`
- **AI Layer**: `repository_classifications`, `repository_embeddings`
- **Events**: `repository_events`, `repository_scores`

-----

## API Endpoints

**Auth**: `/auth/github`, `/auth/status`, `/auth/logout`  
**Data**: `/api/repositories`, `/api/repositories/sync`  
**Analytics**: `/api/analytics/overview`, `/api/analytics/network`  
**Export**: `/api/export/csv`, `/api/export/json`, `/api/export/md`

-----

## Repository Categories

- **Agent**: Autonomous systems and orchestrators
- **Engine**: Frameworks and infrastructure
- **Utility**: CLI tools and automation
- **Research**: Datasets and documentation
- **UI**: Visualization and design systems

-----

## Atlas Embeddings

Repository embeddings are generated from metadata and classifications. Access via `GET /api/repositories` with `embedding_vector` and `embedding_model` fields. The Atlas view renders projections with theme-aware filtering.

-----

## Contributing

Fork, branch, commit, push. Use conventional commits. See `CONTRIBUTING.md`.

-----

## License

MIT License

**Julian Mackler**  
**BIT AND MORTAR SYSTEMS**  
[bitandmortar.com](https://bitandmortar.com)### Made with 💙 by Julian Mackler / bitandmortar
