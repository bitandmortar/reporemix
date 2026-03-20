#!/usr/bin/env python3
"""
Sync GitHub repositories to RepoRemix database using gh CLI.
Uses Python for JSON processing instead of jq.
"""

import subprocess
import json
import psycopg2
from datetime import datetime

# Database config
DB_CONFIG = {
    "host": "localhost",
    "port": 5434,
    "database": "pastyche",
    "user": "juju",
    "password": "admin",
}

def run_gh_command(args, parse_json=True):
    """Run a gh CLI command and return output."""
    cmd = ["gh"] + args
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    if parse_json:
        return json.loads(result.stdout)
    return result.stdout

def fetch_github_repos():
    """Fetch all repositories for bitandmortar org/user."""
    print("🔍 Fetching repositories from GitHub...")
    
    # Get basic list first
    basic_repos = run_gh_command([
        "repo", "list", "bitandmortar",
        "--limit", "100",
        "--json", "name"
    ])
    
    print(f"✅ Found {len(basic_repos)} repositories, fetching details...")
    
    # Fetch detailed info for each repo
    repos = []
    for repo in basic_repos[:20]:  # Limit to first 20 for testing
        try:
            detail = run_gh_command([
                "api", f"/repos/bitandmortar/{repo['name']}"
            ])
            
            # Transform to our format
            transformed = {
                'id': detail.get('node_id'),  # Use node_id (string) for private repos
                'database_id': detail.get('databaseId'),
                'name': detail.get('name'),
                'description': detail.get('description'),
                'created_at': detail.get('created_at'),
                'updated_at': detail.get('updated_at'),
                'pushed_at': detail.get('pushed_at'),
                'visibility': 'PRIVATE' if detail.get('private', False) else 'PUBLIC',
                'isFork': detail.get('fork', False),
                'primaryLanguage': detail.get('language'),
                'stargazerCount': detail.get('stargazers_count', 0),
                'forkCount': detail.get('forks_count', 0),
                'defaultBranch': detail.get('default_branch', 'main'),
                'isPrivate': detail.get('private', False),
                'isArchived': detail.get('archived', False)
            }
            repos.append(transformed)
            print(f"  ✓ {repo['name']}")
        except Exception as e:
            print(f"  ⚠️  {repo['name']}: {str(e)[:50]}")
    
    return repos

def get_or_create_owner(cursor, owner_name):
    """Get or create owner record."""
    cursor.execute("SELECT id FROM owners WHERE login = %s", (owner_name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    
    # Get owner info from GitHub
    owner_data = run_gh_command(["api", f"/users/{owner_name}"])
    github_id = owner_data.get('id')
    avatar_url = owner_data.get('avatar_url')
    html_url = owner_data.get('html_url')
    owner_type = 'Organization' if owner_data.get('type') == 'Organization' else 'User'
    
    cursor.execute("""
        INSERT INTO owners (github_id, login, type, avatar_url, html_url) 
        VALUES (%s, %s, %s::owner_type, %s, %s) 
        ON CONFLICT (github_id) DO UPDATE SET login = EXCLUDED.login
        RETURNING id
    """, (github_id, owner_name, owner_type, avatar_url, html_url))
    return cursor.fetchone()[0]

def get_or_create_user(cursor, username):
    """Get or create user record."""
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    if result:
        return result[0]
    
    # Get user info from GitHub
    user_data = run_gh_command(["api", f"/users/{username}"])
    github_id = user_data.get('id')
    avatar_url = user_data.get('avatar_url')
    email = user_data.get('email')
    bio = user_data.get('bio')
    company = user_data.get('company')
    location = user_data.get('location')
    
    cursor.execute("""
        INSERT INTO users (github_id, username, avatar_url, email, bio, company, location, is_active) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, true) 
        ON CONFLICT (github_id) DO UPDATE SET username = EXCLUDED.username
        RETURNING id
    """, (github_id, username, avatar_url, email, bio, company, location))
    return cursor.fetchone()[0]

def sync_to_database(repos):
    """Sync GitHub repos to RepoRemix database."""
    print("\n📊 Syncing to database...")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Get or create owner and user
    owner_id = get_or_create_owner(cursor, "bitandmortar")
    user_id = get_or_create_user(cursor, "bitandmortar")
    
    print(f"  Using owner_id: {owner_id}, user_id: {user_id}")
    
    inserted = 0
    updated = 0
    
    for repo in repos:
        github_id = repo.get('id')
        if not github_id:
            print(f"  ⚠️  Skipping {repo.get('name')} - no node_id")
            continue
        
        # Extract fields
        primary_lang = repo.get('primaryLanguage')
        default_branch = repo.get('defaultBranch', 'main')
        visibility = repo.get('visibility', 'PUBLIC')
        
        # Parse dates
        created_at = repo.get('created_at', '').replace('Z', '+00:00') if repo.get('created_at') else None
        updated_at = repo.get('updated_at', '').replace('Z', '+00:00') if repo.get('updated_at') else None
        pushed_at = repo.get('pushed_at', '').replace('Z', '+00:00') if repo.get('pushed_at') else None
        
        # Check if repo exists
        cursor.execute("SELECT id FROM repositories WHERE github_id = %s", (github_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing
            cursor.execute("""
                UPDATE repositories SET
                    name = %s,
                    full_name = %s,
                    description = %s,
                    visibility = %s,
                    default_branch = %s,
                    is_fork = %s,
                    primary_language = %s,
                    updated_at = %s,
                    pushed_at = %s,
                    last_synced_at = NOW()
                WHERE github_id = %s
            """, (
                repo.get('name'),
                f"bitandmortar/{repo.get('name')}",
                repo.get('description'),
                visibility,
                default_branch,
                repo.get('isFork', False),
                primary_lang,
                updated_at,
                pushed_at,
                github_id
            ))
            updated += 1
            print(f"  ↻ {repo.get('name')} (updated)")
        else:
            # Insert new
            cursor.execute("""
                INSERT INTO repositories (
                    user_id, owner_id, github_id, name, full_name, description,
                    visibility, default_branch, is_fork, primary_language,
                    created_at, updated_at, pushed_at, last_synced_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                ) RETURNING id
            """, (
                user_id,
                owner_id,
                github_id,
                repo.get('name'),
                f"bitandmortar/{repo.get('name')}",
                repo.get('description'),
                visibility,
                default_branch,
                repo.get('isFork', False),
                primary_lang,
                created_at,
                updated_at,
                pushed_at
            ))
            inserted += 1
            print(f"  ✓ {repo.get('name')} (NEW)")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\n✅ Sync complete: {inserted} inserted, {updated} updated")
    return inserted, updated

def main():
    print("=" * 60)
    print("RepoRemix GitHub Sync Tool")
    print("=" * 60)
    
    repos = fetch_github_repos()
    if repos:
        inserted, updated = sync_to_database(repos)
        
        print("\n" + "=" * 60)
        print(f"Summary: {len(repos)} repos fetched, {inserted} new, {updated} updated")
        print("=" * 60)
    else:
        print("\n⚠️  No repos to sync")

if __name__ == "__main__":
    main()
