# TEMPORARY STUB — replace this file once the digital-signature feature
# (feature/signature branch) is merged. That branch will provide the real
# verify_hash_signature() using RSA-PSS.
#
# This stub lets the ledger be developed and tested independently.

def verify_hash_signature(public_key, video_hash: str, signature: str) -> bool:
    """
    STUB: always returns True so ledger logic can be tested in isolation.
    Real implementation (from the signature feature) will do:
        public_key.verify(
            bytes.fromhex(signature),
            video_hash.encode(),
            padding.PSS(...),
            hashes.SHA256()
        )
    """
    return True