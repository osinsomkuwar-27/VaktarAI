import sqlite3
from fastapi import APIRouter, HTTPException
from ledger import LedgerManager, DB_PATH

router = APIRouter(prefix="/ledger", tags=["ledger"])
ledger = LedgerManager()


@router.get("")
def get_ledger():
    """Returns all blocks in the ledger. Used by the frontend to render the visual timeline."""
    return {"blocks": ledger.get_all_blocks()}


@router.get("/verify")
def verify_ledger():
    """Runs the integrity check on the chain and returns the audit log."""
    from security import KeyManager
    km = KeyManager()
    try:
        public_key = km.load_public_key()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load platform public key: {e}")
    
    result = ledger.verify_chain(public_key=public_key)
    return result


@router.post("/tamper")
def tamper_ledger():
    """
    DEMO/TEST ONLY — simulates an attacker replacing a video file on disk
    and updating the DB to cover their tracks. Used to prove tamper detection
    works, for the paper's results section.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT block_index FROM ledger ORDER BY block_index DESC LIMIT 1")
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Ledger is empty")
        target_idx = row[0] // 2  # Tamper with the middle block

        cursor.execute(
            "UPDATE ledger SET video_hash = 'tampered_hash_value_12345' WHERE block_index = ?",
            (target_idx,)
        )
        conn.commit()
    return {"message": f"Successfully tampered with Block #{target_idx}!"}


@router.post("/restore")
def restore_ledger():
    """
    DEMO/TEST ONLY — resets the ledger DB file, wiping all blocks so you can
    start clean after a tamper demo. Full re-derivation from backup is a
    future-scope item; for now this just clears the table.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM ledger")
        conn.commit()
    return {"message": "Ledger restored to empty state."}