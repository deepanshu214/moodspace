import asyncio
from fastapi.testclient import TestClient
from src.main import app
import random

client = TestClient(app)

def test_stage3_flow():
    print("=== MoodLens Stage 3 Tests ===\n")
    
    # 1. Register & Login User A (The poster)
    email = f"testuser_{random.randint(1000,9999)}@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email, "display_name": "Test User A", 
        "password": "StrongPassword123!", "date_of_birth": "1990-01-01T00:00:00Z"
    })
    token = client.post("/api/v1/auth/login", data={
        "username": email, "password": "StrongPassword123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Test Check-in (Public, Spatial, Normal)
    print("Testing Normal Check-in (Public, Geospatial)...")
    res = client.post("/api/v1/mood/checkin", headers=headers, json={
        "emotions": [{"primary": "joy", "secondary": "happy", "intensity": 8}],
        "context_tags": ["work", "weather"],
        "journal_note": "Having a really great day in the park!",
        "privacy_level": "public",
        "location": {"latitude": 40.7128, "longitude": -74.0060} # NYC
    })
    assert res.status_code == 201, res.text
    print("✅ Created public geospatial mood bubble in NYC")
    
    # 3. Test Check-in (Private, Crisis Keyword)
    print("\nTesting Crisis Detection Check-in...")
    res2 = client.post("/api/v1/mood/checkin", headers=headers, json={
        "emotions": [{"primary": "sadness", "secondary": "lonely", "intensity": 9}],
        "journal_note": "I don't know what to do anymore. I just want to end it all.",
        "privacy_level": "private"
    })
    assert res2.status_code == 201
    assert res2.json()["crisis_detected"] == True
    print("✅ Crisis keyword detected correctly")
    print(f"   Resource: {res2.json()['crisis_resources']['hotlines'][0]['name']}")
    
    # 4. Test Nearby Query
    print("\nTesting PostGIS /nearby Geospatial Query...")
    # Query very close to NYC
    res3 = client.get("/api/v1/mood/nearby?latitude=40.7130&longitude=-74.0050&radius_km=10.0", headers=headers)
    assert res3.status_code == 200
    bubbles = res3.json()["data"]["bubbles"]
    assert len(bubbles) > 0, "Should find the public bubble we just created!"
    print(f"✅ Found {len(bubbles)} public bubble(s) within 10km of NYC!")
    
    # Query far away (London)
    res4 = client.get("/api/v1/mood/nearby?latitude=51.5072&longitude=-0.1276&radius_km=10.0", headers=headers)
    assert res4.status_code == 200
    bubbles_far = res4.json()["data"]["bubbles"]
    assert len(bubbles_far) == 0, "Should not find NYC bubbles in London!"
    print(f"✅ Found {len(bubbles_far)} bubbles in London (as expected)")
    
    # 5. Test History & AES-256 Decryption
    print("\nTesting History (AES Decryption)...")
    res5 = client.get("/api/v1/mood/history", headers=headers)
    assert res5.status_code == 200
    entries = res5.json()["data"]["entries"]
    assert len(entries) >= 2
    # Verify the decrypted journal excerpt matches what we sent
    assert "Having a really great day" in entries[1]["journal_excerpt"]
    print("✅ Successfully decrypted AES-256 journal notes for the owner!")
    
    print("\n🎉 ALL STAGE 3 TESTS PASSED!")

if __name__ == "__main__":
    test_stage3_flow()
