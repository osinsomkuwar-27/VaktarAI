import hmac
import hashlib
import os
import secrets
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# ==========================================
# 1. Symmetric HMAC Signed URLs (Feature 3)
# ==========================================

ENV_KEY_NAME = "VAKTAR_PUBLIC_DISTRIBUTION_HMAC_TOKEN_SECRET"
_secret = os.getenv(ENV_KEY_NAME)

if not _secret:
    print(f"[SECURITY] WARNING: {ENV_KEY_NAME} is not set in the environment.")
    print(f"[SECURITY] Generating a temporary secure token secret key for this session...")
    _secret = secrets.token_hex(32)

SECRET_KEY = _secret.encode("utf-8")

def generate_signed_public_url(filename: str, base_url: str) -> str:
    """
    Generates a permanent, tamper-proof signed URL for public outreach videos.
    The filename and signature are passed as query parameters.
    """
    token = hmac.new(
        SECRET_KEY,
        filename.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    clean_base = base_url.rstrip("/")
    return f"{clean_base}/videos/public?file={filename}&signature={token}"

def verify_url_signature(filename: str, signature: str) -> bool:
    """
    Verifies that the signature in the URL is valid for the given filename.
    """
    if not filename or not signature:
        return False
        
    expected_token = hmac.new(
        SECRET_KEY,
        filename.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_token, signature)


# ==========================================
# 2. Asymmetric Ed25519 Signatures (Feature 1)
# ==========================================

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

def sign_video_file(video_path: str) -> tuple[str, str]:
    """Computes SHA-256 hash of a video file and signs it with the private key.
    Returns (video_hash, signature_hex) as specified in sequence diagram.
    """
    video_hash = compute_sha256(video_path)
    km = KeyManager()
    private_key = km.load_private_key()
    signature_hex = sign_hash(private_key, video_hash)
    return video_hash, signature_hex

def generate_secure_token(video_filename: str) -> str:
    """Generates an encrypted secure token from a video filename using private key signatures."""
    km = KeyManager()
    private_key = km.load_private_key()
    token_sig = private_key.sign(video_filename.encode('utf-8'))
    return token_sig.hex()
