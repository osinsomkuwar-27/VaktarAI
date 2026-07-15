import sqlite3
import hashlib
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "ledger.db")


class LedgerManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initializes the database and creates the ledger table if it doesn't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ledger (
                    block_index INTEGER PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    video_hash TEXT NOT NULL UNIQUE,
                    signature TEXT NOT NULL,
                    previous_hash TEXT NOT NULL,
                    block_hash TEXT NOT NULL UNIQUE
                );
            """)
            conn.commit()

    def get_latest_block(self) -> dict:
        """Returns the latest block in the chain, or None if empty."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ledger ORDER BY block_index DESC LIMIT 1")
            row = cursor.fetchone()
            return dict(row) if row else None

    def calculate_block_hash(self, index: int, timestamp: str, session_id: str,
                              video_hash: str, signature: str, previous_hash: str) -> str:
        """Computes the SHA-256 hash of a block's concatenated string representation."""
        block_string = f"{index}|{timestamp}|{session_id}|{video_hash}|{signature}|{previous_hash}"
        return hashlib.sha256(block_string.encode("utf-8")).hexdigest()

    def append_block(self, session_id: str, video_hash: str, signature: str) -> dict:
        """Appends a new block to the ledger, automatically linking it to the previous block."""
        latest = self.get_latest_block()

        if latest is None:
            index = 0
            previous_hash = "vaktar_genesis_hash"
        else:
            index = latest["block_index"] + 1
            previous_hash = latest["block_hash"]

        timestamp = datetime.utcnow().isoformat() + "Z"
        block_hash = self.calculate_block_hash(
            index, timestamp, session_id, video_hash, signature, previous_hash
        )

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO ledger (block_index, timestamp, session_id, video_hash, signature, previous_hash, block_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (index, timestamp, session_id, video_hash, signature, previous_hash, block_hash))
            conn.commit()

        return {
            "block_index": index,
            "timestamp": timestamp,
            "session_id": session_id,
            "video_hash": video_hash,
            "signature": signature,
            "previous_hash": previous_hash,
            "block_hash": block_hash
        }

    def get_all_blocks(self) -> list:
        """Returns all blocks in the ledger sorted by index."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ledger ORDER BY block_index ASC")
            return [dict(row) for row in cursor.fetchall()]

    def get_block_by_hash(self, video_hash: str) -> dict | None:
        """Retrieves a block by the computed video SHA-256 hash."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM ledger WHERE video_hash = ?",
                (video_hash,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    def verify_chain(self, public_key) -> dict:
        """
        Validates the entire ledger.
        Checks:
          1. Hash chain pointer linkages (block[i].previous_hash == block[i-1].block_hash)
          2. Block hash computation correctness
          3. Digital Signature authenticity using the public key
        """
        blocks = self.get_all_blocks()
        if not blocks:
            return {"status": "empty", "message": "Ledger contains no entries.", "valid": True}

        from security import verify_hash_signature
        log = []

        for i, block in enumerate(blocks):
            # Check 1: Verify previous hash linkage
            if i == 0:
                expected_prev = "vaktar_genesis_hash"
            else:
                expected_prev = blocks[i - 1]["block_hash"]

            if block["previous_hash"] != expected_prev:
                return {
                    "valid": False,
                    "status": "tampered",
                    "details": f"Linkage broken at Block #{block['block_index']}. Expected previous_hash '{expected_prev}', got '{block['previous_hash']}'."
                }

            # Check 2: Verify block hash computation
            recalculated_hash = self.calculate_block_hash(
                block["block_index"], block["timestamp"], block["session_id"],
                block["video_hash"], block["signature"], block["previous_hash"]
            )
            if block["block_hash"] != recalculated_hash:
                return {
                    "valid": False,
                    "status": "tampered",
                    "details": f"Data integrity error at Block #{block['block_index']}. Recalculated hash does not match stored block_hash."
                }

            # Check 3: Verify cryptographic signature of the video using the real public key
            is_sig_valid = verify_hash_signature(public_key, block["video_hash"], block["signature"])
            if not is_sig_valid:
                return {
                    "valid": False,
                    "status": "invalid_signature",
                    "details": f"Signature verification failed at Block #{block['block_index']}. The signature does not match the video hash."
                }

            log.append(f"Block #{block['block_index']} verified successfully.")

        return {"valid": True, "status": "secure", "log": log}


# ==============================================================================
# Compatibility Wrappers for module-level imports
# ==============================================================================

_manager = LedgerManager()

def init_db() -> None:
    """Module wrapper to initialize DB."""
    _manager._init_db()

def append_block(session_id: str, video_hash: str, signature_hex: str) -> dict:
    """Module wrapper to append a block (uses the blockchain manager)."""
    return _manager.append_block(session_id, video_hash, signature_hex)

def get_block_by_hash(video_hash: str) -> dict | None:
    """Module wrapper to get a block by hash."""
    return _manager.get_block_by_hash(video_hash)
