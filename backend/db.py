import sqlite3
import json
from typing import Any, Optional
from backend.config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        total_pages INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending', -- pending, processing, completed, error
        tables_count INTEGER DEFAULT 0,
        charts_count INTEGER DEFAULT 0,
        images_count INTEGER DEFAULT 0,
        scanned_pages_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Document pages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        image_path TEXT,
        thumbnail_path TEXT,
        text_content TEXT,
        is_scanned BOOLEAN DEFAULT 0,
        tables_count INTEGER DEFAULT 0,
        visuals_count INTEGER DEFAULT 0,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    );
    """)
    
    # Extracted elements (chunks, tables, charts, images)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS elements (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        document_name TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        content_type TEXT NOT NULL, -- text, table, chart, image
        section TEXT,
        content TEXT NOT NULL,
        metadata_json TEXT, -- Bounding box, structured table JSON, etc.
        source_reference TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
    );
    """)
    
    # Insights table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        title TEXT NOT NULL,
        category TEXT NOT NULL, -- trend, risk, anomaly, opportunity
        severity TEXT DEFAULT 'medium', -- low, medium, high
        description TEXT NOT NULL,
        evidence_page INTEGER,
        evidence_reference TEXT,
        confidence TEXT DEFAULT 'high', -- high, moderate, low
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Recommendations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        problem TEXT NOT NULL,
        evidence TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        reason TEXT NOT NULL,
        potential_impact TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Action Plan tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS action_plans (
        id TEXT PRIMARY KEY,
        document_id TEXT,
        priority TEXT NOT NULL, -- high, medium, low
        action TEXT NOT NULL,
        reason TEXT NOT NULL,
        evidence TEXT NOT NULL,
        status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Query history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS query_history (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        explanation TEXT,
        calculation TEXT,
        confidence TEXT DEFAULT 'high',
        documents_used TEXT,
        evidence_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # User accounts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_demo INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        last_login_at INTEGER
    );
    """)

    # Sign-in sessions. Only a SHA-256 digest of each token is stored.
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        remember INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
