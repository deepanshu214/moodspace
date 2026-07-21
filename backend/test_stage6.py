from fastapi.testclient import TestClient
from src.main import app
from src.config.database import SessionLocal
from src.models.user import User, UserSession
import uuid
from datetime import date

client = TestClient(app)

def setup_test_users():
    db = SessionLocal()
    # Clean up old
    db.query(UserSession).delete()
    db.query(User).filter(User.email.like("test_stage6_%")).delete()
    db.commit()
    
    admin_id = uuid.uuid4()
    user_id = uuid.uuid4()
    
    admin = User(id=admin_id, email="test_stage6_admin@example.com", display_name="Admin", role="admin", date_of_birth=date(1990, 1, 1), password_hash="dummy")
    user = User(id=user_id, email="test_stage6_user@example.com", display_name="User", role="user", date_of_birth=date(1995, 1, 1), password_hash="dummy")
    
    db.add_all([admin, user])
    db.commit()
    
    return admin_id, user_id, db

def override_get_current_user(user_role="user"):
    def _override():
        db = SessionLocal()
        user = db.query(User).filter(User.email == f"test_stage6_{user_role}@example.com").first()
        return user
    return _override

def test_error_handlers():
    print("Testing Global Error Handler (404)...")
    response = client.get("/api/v1/invalid-route-does-not-exist")
    assert response.status_code == 404
    # FastAPI's default 404 is {"detail": "Not Found"}. Our global handler might not catch standard 404s unless we register it for Starlette HTTPException.
    # Let's test a route that throws our custom exception.

    print("Testing Validation Error Handler...")
    # Trigger a Pydantic RequestValidationError
    response = client.post("/api/v1/auth/login", json={"email": "not-an-email", "password": "short"})
    data = response.json()
    assert response.status_code == 400
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "details" in data["error"]

def test_support_endpoints():
    print("Setting up users...")
    admin_id, user_id, db = setup_test_users()
    
    # Override auth to pretend to be admin
    from src.api.deps import get_current_user
    app.dependency_overrides[get_current_user] = override_get_current_user("admin")
    
    print("Testing GET /support/users/{id} (Admin View)...")
    response = client.get(f"/api/v1/support/users/{user_id}")
    if response.status_code != 200:
        print(response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_stage6_user@example.com"
    assert "date_of_birth" not in data # Private data excluded
    
    print("Testing POST /support/users/{id}/suspend...")
    response = client.post(f"/api/v1/support/users/{user_id}/suspend", json={"reason": "Violated terms of service test", "duration_days": 7})
    assert response.status_code == 200
    
    # Verify in DB
    updated_user = db.query(User).filter(User.id == user_id).first()
    assert updated_user.status == "suspended"
    assert updated_user.suspended_until is not None
    
    print("Testing POST /support/users/{id}/logout...")
    response = client.post(f"/api/v1/support/users/{user_id}/logout")
    assert response.status_code == 200
    
    print("Testing RBAC (User View)...")
    app.dependency_overrides[get_current_user] = override_get_current_user("user")
    response = client.get(f"/api/v1/support/users/{user_id}")
    assert response.status_code == 403
    data = response.json()
    assert data["error"]["code"] == "FORBIDDEN"
    
    app.dependency_overrides = {}
    
    # Cleanup
    db.query(UserSession).delete()
    db.query(User).filter(User.email.like("test_stage6_%")).delete()
    db.commit()
    db.close()
    
    print("All Stage 6 tests passed!")

if __name__ == "__main__":
    test_error_handlers()
    test_support_endpoints()
