-- Migration: 001_initial_schema.sql
-- Description: RepoRemix Database Schema
-- Created: 2026-02-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Identity & Auth
CREATE TYPE user_role AS ENUM ('user', 'admin', 'org_member');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id BIGINT UNIQUE,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    company VARCHAR(255),
    location VARCHAR(255),
    website_url TEXT,
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE auth_provider AS ENUM ('github', 'gitlab', 'bitbucket', 'google');

CREATE TABLE auth_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- 2. Repository Core
CREATE TYPE owner_type AS ENUM ('user', 'organization');

CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type owner_type NOT NULL,
    github_id BIGINT NOT NULL,
    login VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    html_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spdx_id VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    url TEXT
);

CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    github_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(500) NOT NULL,
    description TEXT,
    visibility VARCHAR(20) DEFAULT 'public',
    default_branch VARCHAR(100) DEFAULT 'main',
    is_fork BOOLEAN DEFAULT false,
    parent_repository_id UUID REFERENCES repositories(id),
    size_kb INTEGER DEFAULT 0,
    homepage_url TEXT,
    primary_language VARCHAR(100),
    license_id UUID REFERENCES licenses(id),
    archived BOOLEAN DEFAULT false,
    disabled BOOLEAN DEFAULT false,
    topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    pushed_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Social & Engagement Metrics
CREATE TABLE repository_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    stars INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    open_issues INTEGER DEFAULT 0,
    subscribers_count INTEGER DEFAULT 0,
    network_count INTEGER DEFAULT 0,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clone_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    clones_count INTEGER NOT NULL DEFAULT 0,
    unique_clones INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE traffic_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    views_count INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 4. Language & Code Intelligence
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bytes BIGINT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, name)
);

CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    ecosystem VARCHAR(50), 
    is_dev_dependency BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE code_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    cyclomatic_complexity INTEGER,
    maintainability_index INTEGER,
    test_coverage_percent DECIMAL(5,2),
    linter_errors INTEGER,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI / Classification Layer
CREATE TABLE repository_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    model_version VARCHAR(50),
    category VARCHAR(100) NOT NULL, 
    vibe_score DECIMAL(5,2),
    complexity_score DECIMAL(5,2),
    innovation_score DECIMAL(5,2),
    maturity_score DECIMAL(5,2),
    confidence DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repository_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    embedding_vector vector(1536) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Collaboration & Team Use
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255),
    login VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

CREATE TABLE repository_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) DEFAULT 'read', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, user_id)
);

-- 7. Activity & Event Tracking
CREATE TABLE repository_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, 
    actor_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE repository_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    popularity_score DECIMAL(5,2),
    activity_score DECIMAL(5,2),
    health_score DECIMAL(5,2),
    ai_relevance_score DECIMAL(5,2),
    composite_score DECIMAL(5,2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tagging & Custom Taxonomy
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repository_tags (
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (repository_id, tag_id)
);

-- 9. Audit & Compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Feature Flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --- INDICES FOR OPTIMIZATION ---
CREATE INDEX idx_repos_primary_lang ON repositories(primary_language);
CREATE INDEX idx_repos_pushed_at ON repositories(pushed_at DESC);
CREATE INDEX idx_repo_metrics_collected ON repository_metrics(repository_id, collected_at DESC);
CREATE INDEX idx_repo_class_cat_conf ON repository_classifications(category, confidence DESC);
CREATE INDEX idx_repo_scores_composite ON repository_scores(composite_score DESC);

-- GIN indices for metadata and tags
CREATE INDEX idx_repo_events_metadata ON repository_events USING GIN (metadata);
CREATE INDEX idx_repositories_topics ON repositories USING GIN (topics) WHERE topics IS NOT NULL;

-- --- TRIGGERS FOR UPDATED_AT ---
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_accounts_updated_at BEFORE UPDATE ON auth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
