import hmac
import hashlib
import os
import secrets
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Load the secret key from the environment variable with a complex name
# If it is not set, generate a random secure secret key for this session
ENV_KEY_NAME = "VAKTAR_PUBLIC_DISTRIBUTION_HMAC_TOKEN_SECRET"
_secret = os.getenv(ENV_KEY_NAME)

if not _secret:
    print(f"[SECURITY] WARNING: {ENV_KEY_NAME} is not set in the environment.")
    print(f"[SECURITY] Generating a temporary secure token secret key for this session...")
    _secret = secrets.token_hex(32)
    # Note: In a production environment, this should be written to the .env file.

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
    
    # Ensure base_url doesn't end with a slash to avoid duplicate slashes
    clean_base = base_url.rstrip("/")
    return f"{clean_base}/videos/public?file={filename}&signature={token}"

def verify_url_signature(filename: str, signature: str) -> bool:
    """
    Verifies that the signature in the URL is valid for the given filename
    using the secure server secret key. Prevents manipulation and enumeration.
    """
    if not filename or not signature:
        return False
        
    expected_token = hmac.new(
        SECRET_KEY,
        filename.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_token, signature)
