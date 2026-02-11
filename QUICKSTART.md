# 🚀 RepoRemix Quick Start

**“When in doubt, fork.”**

- **GitHub OAuth** secures every session.
- **PostgreSQL** persists your full fork network and analytics.
- **AI Taxonomy** maps repos into Agent/Engine/Utility/Research lanes.
- **Multi-modal views**:
  - 🎨 Drag Onto: Ontological Kanban.
  - 🕸️ Force Graph: Physics-based network topology.
  - 📊 Data Grid: Filterable, sortable metadata.
  - 📈 Timeline: Activity + sync history.
- **Complexity Metrics** drive install/architecture/maintenance decisions.
- **Exports**: CSV, JSON, TXT, MD.

(Native ARM64)

### Prerequisites

```bash
# Check you have these:
node -v    # Should be 18+
psql --version  # Should be 14+
```

### Installation

```bash
# 1. Run the automated setup
./setup.sh

# 2. Follow the prompts to:
#    - Create PostgreSQL database
#    - Install dependencies (uv)
#    - Set up GitHub OAuth credentials

# 3. Start the app
npm run dev
```

That's it! Visit <http://localhost:5173>

## 🔐 GitHub OAuth Setup

You need to create a GitHub OAuth app (takes 2 minutes):

1. Go to: <https://github.com/settings/developers>
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `RepoRemix (Dev)`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click **"Register application"**
5. Copy your **Client ID** and **Client Secret**
6. Update `.env`:

   ```bash
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

## 📁 SCAFFOLD

```
reporemix/
├── server/              # Node.js + Express backend
│   ├── routes/
│   │   ├── auth.js     # GitHub OAuth
│   │   ├── api.js      # REST API
│   │   └── sync.js     # Background sync
│   ├── services/
│   │   ├── github.js   # GitHub API client
│   │   └── ontology.js # AI categorization
│   └── config/
│       ├── database.js # PostgreSQL
│       └── passport.js # OAuth strategy
├── client/              # React + Vite frontend
│   └── src/
│       ├── App.jsx     # Main application
│       └── index.css   # Pastyche aesthetic
├── migrations/          # Database schema
└── .env                # Your configuration
```

n Kanban, Force Graph, Data Grid, and Timeline views

### Features

**🔍 Search & Filter**

- BROWSE BY STARS, FORKS, INSTALLS
- Search by name, description, or owner
- Filter by ontological categories (dynamically populated via API)
- Filter by technology stack (Python, TypeScript, Rust, etc.
  -Filter by language (not programming)

**📊 Complexity Metrics**
Each repo shows:

- **Good Juju Score** (0-100): Popularity + Activity + Engagement
- **Complexity** (1-10): Size + Architecture + Language difficulty
- **Install Difficulty** (1-10): Setup complexity estimate
- **Debug Time**: Estimated troubleshooting hours
- **Learning Curve** (1-10): Onboarding difficulty
- **Maintenance Load** (1-10): Ongoing care requirements
  -\*\*

**💾 Export**

- CSV: For spreadsheets and analysis
- JSON: For programmatic access
- TXT: For quick notes and sharing
- MD: For documentation

## 🗄️ Database Schema

Your repositories are stored in PostgreSQL with these tables:

- **users** - Your GitHub profile
- **repositories** - All fork data (name, stars, description, etc.)
- **languages** - Language breakdown per repo
- **repository_categories** - AI categorization & metrics
- **star_history** - Star count tracking over time
- **clone_activity** - Traffic statistics
- **repository_relationships** - Fork network graph

## 🔄 Syncing Your Repos

The app automatically syncs with GitHub, but you can manually trigger:

```bash
# Via API (when app is running)
curl -X POST http://localhost:3000/sync/repositories \
  -H "Cookie: reporemix.sid=your_session_cookie"

# Or use the refresh button in the UI
```

Sync process:

1. Fetches all repos from GitHub API
2. Extracts languages and topics
3. Runs ontological analysis
4. Categorizes by type
5. Calculates all metrics
6. Updates PostgreSQL

## 📊 API Endpoints

```bash
# Get repositories with optional filters
GET /api/repositories?category=Engine&language=Python

# Full-text search across repo metadata
GET /api/repositories/search?q=query

# High-level analytics for the active network
GET /api/analytics/overview

# Detailed language and dependency distribution
GET /api/analytics/languages

# Force-graph node and edge relationship data
GET /api/analytics/network

# Data export endpoints
GET /api/export/csv
GET /api/export/json
GET /api/export/md
```

## 🐛 Troubleshooting

### Database Issues

```bash
# Reset database
dropdb reporemix
createdb reporemix
npm run migrate:up
```

### GitHub API Rate Limits

- **Authenticated (OAuth)**: 5,000 requests/hour (Standard)
- **Enterprise**: Up to 15,000 requests/hour
- **Unauthenticated**: 60 requests/hour (The app requires login to avoid this)
- Syncing a standard network typically consumes 200-500 requests per pass.
- If you encounter 403 errors, check your token status in the `.env` or wait for the hourly reset.

### Port Conflicts

```bash
# Change ports in .env
PORT=3001              # Backend
# Then update vite.config.js proxy target
```

## 🚀 Production Deployment

### Option 1: Traditional VPS

```bash
# Build frontend
cd client && npm run build

# Set environment
export NODE_ENV=production

# Start server
npm start
```

### Option 2: Heroku

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
```

### Option 3: Vercel + Supabase

- Deploy frontend to Vercel
- Use Supabase for PostgreSQL
- Set environment variables in Vercel dashboard

## 📈 Next Steps

Ideas for enhancement:

- [ ] Add dependency graph visualization
- [ ] GitHub Actions integration
- [ ] Custom category creation
- [ ] Collaboration features (share dashboards)
- [ ] Automated reports (weekly emails)
- [ ] Integration with project management tools
- [ ] Mobile app with React Native

## 🤝 Contributing

This is YOUR first public repo! Here's how others can contribute:

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

See `CONTRIBUTING.md` for detailed guidelines.

## ✅ Testing

```bash
npm run test:ci
```

## 📝 License

MIT License - do whatever you want with this! See `LICENSE` file.

## 🙏 Acknowledgments

Built with:

- React + Vite
- Express.js
- PostgreSQL
- D3.js + Force-Graph
- Tailwind CSS
- Octokit (GitHub API)

## 💬 Support

- **Issues**: <https://github.com/bitandmortar/reporemix/issues>
- **Discussions**: <https://github.com/bitandmortar/reporemix/discussions>

---

**Made with 💙 by @bitandmortar**
