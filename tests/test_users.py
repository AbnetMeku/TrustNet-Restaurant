import pytest
from app import create_app, db
from app.models.models import User
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token

@pytest.fixture(scope="module")
def app():
    app = create_app()
    app.config.from_object("app.config.TestingConfig")
    with app.app_context():
        # Clean tables before tests run
        db.drop_all()
        db.create_all()
        # Insert test users
        users = [
            User(name="Admin User", username="admin", password_hash=generate_password_hash("adminpass"), role="admin"),
            User(name="Manager User", username="manager", password_hash=generate_password_hash("managerpass"), role="manager"),
            User(name="Waiter User", username="waiter", password_hash=generate_password_hash("waiterpass"), role="waiter"),
        ]
        db.session.bulk_save_objects(users)
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()

def get_auth_headers(user_id, role, app):
    with app.app_context():
        token = create_access_token(identity=str(user_id), additional_claims={"role": role})
    return {"Authorization": f"Bearer {token}"}

def test_admin_can_get_all_users(client, app):
    headers = get_auth_headers(1, "admin", app)
    res = client.get("/users/", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert isinstance(data, list)
    assert any(u["username"] == "admin" for u in data)

def test_manager_can_create_user(client, app):
    headers = get_auth_headers(2, "manager", app)
    new_user = {"name": "New User", "username": "newuser", "password": "newpass", "role": "waiter"}
    res = client.post("/users/", headers=headers, json=new_user)
    assert res.status_code == 201
    data = res.get_json()
    assert data["username"] == "newuser"

def test_waiter_cannot_create_user(client, app):
    headers = get_auth_headers(3, "waiter", app)
    new_user = {"name": "Bad User", "username": "baduser", "password": "badpass", "role": "waiter"}
    res = client.post("/users/", headers=headers, json=new_user)
    assert res.status_code == 403

def test_user_can_get_own_details(client, app):
    headers = get_auth_headers(3, "waiter", app)
    res = client.get("/users/3", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["id"] == 3

def test_user_cannot_get_other_user_details(client, app):
    headers = get_auth_headers(3, "waiter", app)
    res = client.get("/users/1", headers=headers)  # waiter trying to get admin details
    assert res.status_code == 403

def test_admin_can_update_user(client, app):
    headers = get_auth_headers(1, "admin", app)
    update_data = {"name": "Updated Manager", "role": "manager"}
    res = client.put("/users/2", headers=headers, json=update_data)
    assert res.status_code == 200
    data = res.get_json()
    assert data["name"] == "Updated Manager"

def test_manager_can_delete_user(client, app):
    headers = get_auth_headers(2, "manager", app)
    res = client.delete("/users/3", headers=headers)  # deleting waiter
    assert res.status_code == 200
    assert res.get_json()["message"] == "User deleted"

def test_auth_login_success(client):
    res = client.post("/auth/login", json={"username": "admin", "password": "adminpass"})
    assert res.status_code == 200
    data = res.get_json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_auth_login_fail(client):
    res = client.post("/auth/login", json={"username": "admin", "password": "wrongpass"})
    assert res.status_code == 401
    data = res.get_json()
    assert data["msg"] == "Invalid username or password"
