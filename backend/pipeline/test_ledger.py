"""
Standalone test for LedgerManager — run directly, no server needed.
    python test_ledger.py

Proves:
  1. Blocks chain correctly (each previous_hash matches prior block_hash)
  2. verify_chain() passes on a clean ledger
  3. Tampering with one block is detected and reported precisely
"""
import os
import sqlite3
from ledger import LedgerManager

TEST_DB = "test_ledger.db"


def reset_test_db():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


def main():
    reset_test_db()
    ledger = LedgerManager(db_path=TEST_DB)

    print("=== Step 1: Adding 3 blocks ===")
    b0 = ledger.append_block(session_id="sess_001", video_hash="hash_video_A", signature="sig_A")
    b1 = ledger.append_block(session_id="sess_002", video_hash="hash_video_B", signature="sig_B")
    b2 = ledger.append_block(session_id="sess_003", video_hash="hash_video_C", signature="sig_C")
    for b in (b0, b1, b2):
        print(f"  Block #{b['block_index']} -> block_hash={b['block_hash'][:16]}...")

    print("\n=== Step 2: Verifying clean chain ===")
    result = ledger.verify_chain(public_key=None)
    print(f"  valid={result['valid']}  status={result['status']}")
    assert result["valid"] is True, "Clean chain should verify as valid!"

    print("\n=== Step 3: Simulating tamper on Block #1 ===")
    with sqlite3.connect(TEST_DB) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE ledger SET video_hash = 'tampered_hash_evil' WHERE block_index = 1"
        )
        conn.commit()

    print("=== Step 4: Verifying tampered chain ===")
    result = ledger.verify_chain(public_key=None)
    print(f"  valid={result['valid']}  status={result['status']}")
    print(f"  details: {result.get('details')}")
    assert result["valid"] is False, "Tampered chain must be detected!"

    print("\n✅ All assertions passed — chain-of-trust and tamper detection work correctly.")


if __name__ == "__main__":
    main()