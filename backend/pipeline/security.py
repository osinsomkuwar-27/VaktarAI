import os

# Resolve keys path absolute to this module to guarantee correct key location regardless of CWD.
DEFAULT_KEYS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "keys")

class KeyManager:
    def __init__(self, keys_dir: str = DEFAULT_KEYS_DIR):
        self.keys_dir = keys_dir
        self.private_key_path = os.path.join(keys_dir, "private_key.pem")
        self.public_key_path = os.path.join(keys_dir, "public_key.pem")
        self._ensure_keys_exist()

    def _ensure_keys_exist(self) -> None:
        """Checks if keys exist, generates them if missing."""
        if not os.path.exists(self.private_key_path) or not os.path.exists(self.public_key_path):
            os.makedirs(self.keys_dir, exist_ok=True)
            self._generate_keypair()

    def _generate_keypair(self) -> None:
        """Generates Ed25519 private/public keypair and saves to PEM files."""
        from cryptography.hazmat.primitives.asymmetric import ed25519
        from cryptography.hazmat.primitives import serialization

        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        # Serialize Private Key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        with open(self.private_key_path, "wb") as f:
            f.write(private_pem)

        # Serialize Public Key
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        with open(self.public_key_path, "wb") as f:
            f.write(public_pem)

    def load_private_key(self):
        """Loads and returns the private key object."""
        from cryptography.hazmat.primitives import serialization
        with open(self.private_key_path, "rb") as f:
            return serialization.load_pem_private_key(f.read(), password=None)

    def load_public_key(self):
        """Loads and returns the public key object."""
        from cryptography.hazmat.primitives import serialization
        with open(self.public_key_path, "rb") as f:
            return serialization.load_pem_public_key(f.read())
            
    def get_public_key_pem(self) -> str:
        """Returns public key as a PEM-encoded string."""
        with open(self.public_key_path, "r", encoding="utf-8") as f:
            return f.read()

def compute_sha256(file_path: str) -> str:
    """Computes SHA-256 hash of a file using buffered reading."""
    import hashlib
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536): # 64KB chunks
            sha256.update(chunk)
    return sha256.hexdigest()

def sign_hash(private_key, data_hash: str) -> str:
    """Signs a SHA-256 hash string and returns a hex signature."""
    hash_bytes = data_hash.encode('utf-8')
    signature = private_key.sign(hash_bytes)
    return signature.hex()

def verify_hash_signature(public_key, data_hash: str, signature_hex: str) -> bool:
    """Verifies a signature against a SHA-256 hash using the public key."""
    try:
        hash_bytes = data_hash.encode('utf-8')
        signature_bytes = bytes.fromhex(signature_hex)
        public_key.verify(signature_bytes, hash_bytes)
        return True
    except Exception:
        return False
