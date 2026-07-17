import os
import sys

# Set test environment secret key BEFORE importing pipeline.py
os.environ["VAKTAR_PUBLIC_DISTRIBUTION_HMAC_TOKEN_SECRET"] = "test_hmac_secret_key_1234567890"

from fastapi.testclient import TestClient
from pipeline import app
from security import generate_signed_public_url, verify_url_signature

client = TestClient(app)

def test_secure_links():
    # 1. Create a dummy video file inside generated_videos
    test_filename = "test_official_subsidy_announcement.mp4"
    test_filepath = os.path.join("generated_videos", test_filename)
    os.makedirs("generated_videos", exist_ok=True)
    with open(test_filepath, "w") as f:
        f.write("dummy video data")

    try:
        # 2. Test generating a signed URL
        signed_url = generate_signed_public_url(test_filename, base_url="http://testserver")
        print(f"[TEST] Generated URL: {signed_url}")
        assert "file=test_official_subsidy_announcement.mp4" in signed_url
        assert "signature=" in signed_url

        # Extract signature from signed url for tests
        signature = signed_url.split("signature=")[-1]
        
        # 3. Test verification logic directly
        assert verify_url_signature(test_filename, signature) is True
        assert verify_url_signature(test_filename, "invalid_sig") is False
        assert verify_url_signature("altered_filename.mp4", signature) is False

        # 4. Test API GET /videos/public - Successful case (valid signature)
        response = client.get(f"/videos/public?file={test_filename}&signature={signature}")
        print(f"[TEST] Response status: {response.status_code}")
        assert response.status_code == 200
        assert response.text == "dummy video data"

        # 5. Test API GET /videos/public - Invalid signature
        response = client.get(f"/videos/public?file={test_filename}&signature=wrong_sig")
        assert response.status_code == 403
        assert "Invalid URL signature" in response.json()["detail"]

        # 6. Test API GET /videos/public - Altered file
        response = client.get(f"/videos/public?file=forged_video.mp4&signature={signature}")
        assert response.status_code == 403

        # 7. Test API GET /videos/public - Valid signature but missing file
        missing_filename = "non_existent_video.mp4"
        missing_url = generate_signed_public_url(missing_filename, base_url="http://testserver")
        missing_sig = missing_url.split("signature=")[-1]
        response = client.get(f"/videos/public?file={missing_filename}&signature={missing_sig}")
        assert response.status_code == 404
        assert "file not found" in response.json()["detail"].lower()

        # 8. Test API GET /videos/public - Directory traversal attempt
        traversal_filename = "../security.py"
        traversal_url = generate_signed_public_url(traversal_filename, base_url="http://testserver")
        traversal_sig = traversal_url.split("signature=")[-1]
        
        response = client.get(f"/videos/public?file={traversal_filename}&signature={traversal_sig}")
        assert response.status_code == 403
        assert "traversal" in response.json()["detail"].lower()
        
        print("[TEST] All secure links test cases PASSED successfully! 🎉")

    finally:
        # Cleanup test file
        if os.path.exists(test_filepath):
            os.remove(test_filepath)

if __name__ == "__main__":
    test_secure_links()
