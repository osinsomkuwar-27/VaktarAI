import os
import shutil
import sqlite3
import sys

# Set up test environment variables before importing
os.environ["VAKTAR_PUBLIC_DISTRIBUTION_HMAC_TOKEN_SECRET"] = "test_hmac_secret_key_1234567890"

# Import our unified security modules and the ledger
from security import (
    KeyManager, 
    sign_video_file, 
    verify_hash_signature, 
    generate_signed_public_url, 
    verify_url_signature,
    generate_secure_token
)
import ledger

TEST_DB = "test_integrated_ledger.db"
TEST_KEYS_DIR = "test_keys"
TEST_VIDEO = "test_video_flow.mp4"

def setup_test_environment():
    # Clean up any leftover database or video files
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    video_path = os.path.join("generated_videos", TEST_VIDEO)
    if os.path.exists(video_path):
        os.remove(video_path)
    
    # Initialize the ledger with a test database
    ledger.DB_PATH = TEST_DB
    ledger._manager = ledger.LedgerManager(db_path=TEST_DB)
    
    # Ensure platform key pair exists
    print("[TEST] Ensuring platform key pair exists in default directory...")
    km = KeyManager()
    
    # Write a dummy test video file
    print("[TEST] Creating dummy video file...")
    os.makedirs("generated_videos", exist_ok=True)
    with open(os.path.join("generated_videos", TEST_VIDEO), "wb") as f:
        f.write(b"dummy video data block 12345")

def cleanup():
    # Remove database and video file
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    video_path = os.path.join("generated_videos", TEST_VIDEO)
    if os.path.exists(video_path):
        os.remove(video_path)

def run_integration_tests():
    setup_test_environment()
    
    km = KeyManager()
    public_key = km.load_public_key()
    private_key = km.load_private_key()
    
    try:
        print("\n=== Test 1: Full Generation Sequence (Watermark -> Sign -> Ledger -> Signed URL) ===")
        # 1. Hashing & Signing (Digital Signature)
        video_path = os.path.join("generated_videos", TEST_VIDEO)
        video_hash, signature_hex = sign_video_file(video_path)
        print(f"  [OK] Video Hash (SHA-256): {video_hash}")
        print(f"  [OK] Digital Signature (Ed25519): {signature_hex[:24]}...")
        
        # 2. Writing to Ledger (tamper-evident block chaining)
        block = ledger.append_block("session_government_test_001", video_hash, signature_hex)
        print(f"  [OK] Block #{block['block_index']} Appended.")
        print(f"  [OK] Previous Hash: {block['previous_hash']}")
        print(f"  [OK] Block Hash: {block['block_hash']}")
        
        # 3. Generating HMAC signed URL (secure links)
        signed_url = generate_signed_public_url(TEST_VIDEO, base_url="http://localhost:8000")
        print(f"  [OK] Public signed URL: {signed_url}")
        
        print("\n=== Test 2: Secure URL Routing & Validation ===")
        signature_param = signed_url.split("signature=")[-1]
        
        # Validate correct signature
        assert verify_url_signature(TEST_VIDEO, signature_param) is True, "Valid signature verification failed!"
        # Validate tampered signature
        assert verify_url_signature(TEST_VIDEO, signature_param + "forged") is False, "Forged signature verification accepted!"
        # Validate tampered filename
        assert verify_url_signature("altered_video.mp4", signature_param) is False, "Forged filename accepted!"
        print("  [PASS] HMAC Signed URL routing works perfectly.")

        print("\n=== Test 3: Standalone Video Verification ===")
        # Lookup in ledger database by hash
        retrieved_block = ledger.get_block_by_hash(video_hash)
        assert retrieved_block is not None, "Failed to retrieve block from ledger database by hash!"
        assert retrieved_block["session_id"] == "session_government_test_001", "Session ID mismatch!"
        
        # Cryptographic verification against public key
        is_sig_valid = verify_hash_signature(public_key, video_hash, retrieved_block["signature"])
        assert is_sig_valid is True, "Cryptographic Ed25519 signature verification failed!"
        print("  [PASS] Video hash found in ledger and validated against platform trust key.")

        print("\n=== Test 4: Blockchain Ledger Integrity Audit ===")
        # Sign the dummy hashes using the private key to make them cryptographically valid
        from security import sign_hash
        sig_B = sign_hash(private_key, "dummy_hash_B")
        sig_C = sign_hash(private_key, "dummy_hash_C")
        
        ledger.append_block("session_government_test_002", "dummy_hash_B", sig_B)
        ledger.append_block("session_government_test_003", "dummy_hash_C", sig_C)
        
        # Audit the ledger
        audit_result = ledger._manager.verify_chain(public_key=public_key)
        print(f"  Audit Status: {audit_result['status']} (valid={audit_result['valid']})")
        assert audit_result["valid"] is True, "Clean ledger chain failed integrity audit!"
        print("  [PASS] Blockchain ledger chain integrity verified successfully.")

        print("\n=== Test 5: Cryptographic Tamper Detection ===")
        # Simulate tampering by changing a record directly in the SQLite database file
        with sqlite3.connect(TEST_DB) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE ledger SET video_hash = 'evil_tampered_hash_value' WHERE block_index = 1"
            )
            conn.commit()
            
        print("  Running integrity audit on the tampered database...")
        audit_result = ledger._manager.verify_chain(public_key=public_key)
        print(f"  Audit Status: {audit_result['status']} (valid={audit_result['valid']})")
        print(f"  Audit Details: {audit_result.get('details')}")
        
        assert audit_result["valid"] is False, "Tampered database bypasses integrity audit!"
        assert audit_result["status"] == "tampered", "Tampered status not reported correctly!"
        print("  [PASS] Cryptographic tampering detected and reported successfully!")

        print("\n🎉 ALL INTEGRATED SECURITY VERIFICATIONS PASSED SUCCESSFULLY! 🎉")

    finally:
        cleanup()

if __name__ == "__main__":
    run_integration_tests()
