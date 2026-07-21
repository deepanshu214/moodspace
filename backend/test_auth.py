import asyncio
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_auth_flow():
    # 1. Register User
    print("Testing Registration...")
    res = client.post("/api/v1/auth/register", json={
        "email": "testuser123@example.com",
        "display_name": "Test User",
        "password": "StrongPassword123!",
        "date_of_birth": "1990-01-01T00:00:00Z"
    })
    
    if res.status_code == 409:
        print("User already exists, skipping registration.")
    elif res.status_code != 201:
        print(f"Failed to register: {res.text}")
        return
    else:
        print("Registration successful!")

    # 2. Login User
    print("Testing Login...")
    res = client.post("/api/v1/auth/login", data={
        "username": "testuser123@example.com",
        "password": "StrongPassword123!"
    })
    
    if res.status_code != 200:
        print(f"Failed to login: {res.text}")
        return
        
    print("Login successful!")
    token = res.json()["access_token"]
    
    # 3. Get Profile
    print("Testing Profile Access...")
    res = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    if res.status_code != 200:
        print(f"Failed to access profile: {res.text}")
        return
        
    print(f"Profile access successful! Logged in as: {res.json()['display_name']}")
    
    # 4. Update Profile
    print("Testing Profile Update...")
    res = client.patch("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}, json={
        "bio": "This is a test bio"
    })
    if res.status_code != 200:
        print(f"Failed to update profile: {res.text}")
        return
        
    print(f"Profile update successful! New bio: {res.json().get('bio')}")
    print("ALL TESTS PASSED!")

if __name__ == "__main__":
    test_auth_flow()
