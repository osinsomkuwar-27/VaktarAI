import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ledger.db")

def init_db() -> None:
    """Initializes the SQLite ledger database and creates the ledger table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                video_hash TEXT NOT NULL UNIQUE,
                signature TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        conn.commit()
    finally:
        conn.close()

def append_block(session_id: str, video_hash: str, signature_hex: str) -> None:
    """Inserts a new block record into the ledger database."""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        cursor.execute(
            "INSERT OR REPLACE INTO ledger (session_id, video_hash, signature, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, video_hash, signature_hex, timestamp)
        )
        conn.commit()
    finally:
        conn.close()

def get_block_by_hash(video_hash: str) -> dict | None:
    """Retrieves a block by the computed video SHA-256 hash."""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT session_id, video_hash, signature, timestamp FROM ledger WHERE video_hash = ?",
            (video_hash,)
        )
        row = cursor.fetchone()
        if row:
            return {
                "session_id": row[0],
                "video_hash": row[1],
                "signature": row[2],
                "timestamp": row[3]
            }
        return None
    finally:
        conn.close()
