import os
import re
import psycopg2
from psycopg2.extras import execute_values
import uuid

# Configuration
DB_HOST = "127.0.0.1"
DB_PORT = "5434"
DB_USER = "juju"
DB_PASSWORD = "admin"
DATA_FILE = "raw_repos.txt"
DEFAULT_DB = "postgres"

def parse_number(s):
    s = s.strip().lower()
    if 'k' in s:
        return int(float(s.replace('k', '')) * 1000)
    if 'm' in s:
        return int(float(s.replace('m', '')) * 1000000)
    try:
        return int(s.replace(',', ''))
    except ValueError:
        return 0

def is_number(s):
    return bool(re.match(r'^[\d\.]+[km]?$', s.strip(), re.IGNORECASE))

def connect_db(dbname=None):
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=dbname or DEFAULT_DB
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database {dbname}: {e}")
        return None

def check_database_exists(target_db):
    conn = connect_db(DEFAULT_DB)
    if not conn:
        return False
    
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
    exists = cur.fetchone()
    cur.close()
    conn.close()
    return exists is not None

def parse_data(file_path):
    repos = []
    with open(file_path, 'r') as f:
        # Read lines and filter empty ones
        lines = [line.strip() for line in f if line.strip()]

    i = 0
    while i < len(lines):
        full_name = lines[i]
        
        # Skip lines that are not repo names (must contain /)
        if '/' not in full_name:
            i += 1
            continue

        description = ""
        language = None
        stars = 0
        forks = 0

        current_idx = i + 1
        
        # Handle end of file
        if current_idx >= len(lines):
            repos.append({
                "full_name": full_name,
                "owner": full_name.split('/')[0],
                "name": full_name.split('/')[1],
                "description": description,
                "language": language,
                "stars": stars,
                "forks": forks
            })
            break

        # Check if current_idx is a number -> No Description
        if is_number(lines[current_idx]):
            stars = parse_number(lines[current_idx])
            current_idx += 1
            if current_idx < len(lines) and is_number(lines[current_idx]):
                forks = parse_number(lines[current_idx])
                current_idx += 1
        else:
            # It's a description
            description = lines[current_idx]
            current_idx += 1
            
            if current_idx < len(lines):
                # Check for Language or Stars
                if is_number(lines[current_idx]):
                    stars = parse_number(lines[current_idx])
                    current_idx += 1
                    if current_idx < len(lines) and is_number(lines[current_idx]):
                        forks = parse_number(lines[current_idx])
                        current_idx += 1
                else:
                    # Must be language
                    language = lines[current_idx]
                    current_idx += 1
                    if current_idx < len(lines) and is_number(lines[current_idx]):
                        stars = parse_number(lines[current_idx])
                        current_idx += 1
                        if current_idx < len(lines) and is_number(lines[current_idx]):
                            forks = parse_number(lines[current_idx])
                            current_idx += 1

        parts = full_name.split('/')
        owner_login = parts[0]
        name = parts[1]

        repos.append({
            "full_name": full_name,
            "owner": owner_login,
            "name": name,
            "description": description,
            "language": language,
            "stars": stars,
            "forks": forks
        })
        
        i = current_idx
        
    return repos

def insert_data(repos):
    target_db = "reporemix"
    if not check_database_exists(target_db):
        print(f"Database {target_db} does not exist. Checking pastyche...")
        if check_database_exists("pastyche"):
            target_db = "pastyche"
        else:
            print("Neither reporemix nor pastyche DB found. Exiting.")
            return

    conn = connect_db(target_db)
    if not conn:
        return

    cur = conn.cursor()
    print(f"Connected to {target_db}. Processing {len(repos)} repositories...")
    
    try:
        for repo in repos:
            # Check if Owner exists
            cur.execute("SELECT id FROM owners WHERE login = %s", (repo['owner'],))
            res = cur.fetchone()
            
            if not res:
                # Insert new owner
                cur.execute("""
                    INSERT INTO owners (type, github_id, login, html_url)
                    VALUES ('user', abs(hashtext(%s)), %s, %s)
                    RETURNING id
                """, (repo['owner'], repo['owner'], f"https://github.com/{repo['owner']}"))
                owner_id = cur.fetchone()[0]
            else:
                owner_id = res[0]

            # Upsert Repository
            cur.execute("""
                INSERT INTO repositories (
                    owner_id, github_id, name, full_name, description, 
                    primary_language, visibility, updated_at
                ) VALUES (
                    %s, abs(hashtext(%s)), %s, %s, %s, %s, 'public', CURRENT_TIMESTAMP
                )
                ON CONFLICT (github_id) 
                DO UPDATE SET 
                    description = EXCLUDED.description,
                    primary_language = EXCLUDED.primary_language,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            """, (
                owner_id, repo['full_name'], repo['name'], repo['full_name'], 
                repo['description'], repo['language']
            ))
            
            repo_id = cur.fetchone()[0]
            
            # Insert Metrics
            cur.execute("""
                INSERT INTO repository_metrics (
                    repository_id, stars, forks_count, collected_at
                ) VALUES (
                    %s, %s, %s, CURRENT_TIMESTAMP
                )
            """, (repo_id, repo['stars'], repo['forks']))
            
        conn.commit()
        print("Successfully ingested all data.")
        
    except Exception as e:
        print(f"Error during ingestion: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    if not os.path.exists(DATA_FILE):
        print(f"Data file {DATA_FILE} not found.")
    else:
        repos = parse_data(DATA_FILE)
        print(f"Parsed {len(repos)} repos.")
        if len(repos) > 0:
            print(f"First repo sample: {repos[0]}")
            insert_data(repos)
