# Contributing to RepoRemix

Thank you for your interest in contributing to RepoRemix! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others
- Code likes you care
- Human fellowship above all

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- GitHub account
- Git
- macOS (Apple Silicon preferred)

_Note: RepoRemix is designed for native macOS execution. All commands above work on ARM64 without Docker; if you stumble into Docker references elsewhere, treat them as Easter eggs rather than a supported flow._

### Development Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/reporemix.git
   cd reporemix
   ```

3. Install dependencies:

   ```bash
   npm install
   cd client && npm install
   ```

4. Set up your environment:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up the database:

   ```bash
   createdb reporemix
   npm run migrate:up
   ```

6. Start development servers:

   ```bash
   npm run dev
   ```

## macOS Development Notes

We run everything locally on macOS: Node 20+ is installed via Homebrew or the official pkg, PostgreSQL runs through `brew services`, and migrations execute against the native Postgres binaries. Avoid Docker unless you are deliberately exploring alternate builds—it's hidden by design and not required for contributions.

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

Example: `feature/add-dependency-graph`

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example:

```
feat(api): add repository search endpoint

Implements full-text search across repositories
using PostgreSQL's ts_vector capabilities.

Closes #123
```

### Code Style

- Use ESLint for JavaScript/JSX
- Follow Airbnb style guide
- Run `npm run lint` before committing
- Format with Prettier: `npm run format`

### Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Maintain or improve code coverage

## Pull Request Process

1. **Create a feature branch** from `main`

2. **Make your changes**:
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test thoroughly**:

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit your changes** using conventional commits

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature
   ```

6. **Create a Pull Request**:
   - Provide a clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure CI passes

7. **Address review feedback**:
   - Respond to comments
   - Make requested changes
   - Push updates to your branch

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
- [ ] UI changes tested on multiple browsers
- [ ] Responsive design verified

## Project Structure

```
reporemix/
├── server/           # Backend (Express, Node.js)
│   ├── config/       # Configuration files
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── index.js      # Server entry point
├── client/           # Frontend (React, Vite)
│   ├── public/       # Static assets
│   ├── src/          # React components
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── migrations/       # Database migrations
├── scripts/          # Utility scripts
└── README.md
```

## Areas for Contribution

### High Priority

- [ ] Additional visualizations (sunburst, treemap)
- [ ] Repository dependency analysis
- [ ] Advanced filtering options
- [ ] Dark/light theme toggle
- [ ] Export to more formats (PDF, Markdown)

### Medium Priority

- [ ] Repository health metrics
- [ ] Collaboration features
- [ ] Custom categories/tags
- [ ] Bulk operations
- [ ] API rate limit optimization

### Documentation

- [ ] API documentation
- [ ] Component storybook
- [ ] Video tutorials
- [ ] Deployment guides

## Reporting Bugs

Create an issue with:

1. **Title**: Clear, concise description
2. **Description**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
3. **Environment**:
   - OS
   - Node version
   - Browser (for frontend issues)
4. **Additional context**: Logs, error messages

## Feature Requests

Create an issue with:

1. **Title**: Feature name
2. **Problem**: What problem does it solve?
3. **Solution**: Proposed solution
4. **Alternatives**: Other solutions considered
5. **Additional context**: Mockups, examples

## Questions?

- Check existing issues and discussions
- Ask in GitHub Discussions
- Tag @bitandmortar if urgent

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in commit history

Thank you for contributing to RepoRemix

When in doubt, fork.
