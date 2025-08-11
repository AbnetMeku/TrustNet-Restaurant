import pytest
import json
from app import create_app, db
from app.models.models import User, Table
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

# Helper to create user and generate token
def create_user_and_token(role, db_session, username="testuser"):
    user = User(
        name="Test User",
        username=username,
        password_hash=generate_password_hash("password123"),
        role=role,
    )
    db_session.add(user)
    db_session.commit()
    # Use string id as identity (consistent with your auth)
    token = create_access_token(identity=str(user.id), additional_claims={"role": role})
    return user, token

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

def test_admin_can_create_table(client, app):
    with app.app_context():
        _, token = create_user_and_token("admin", db.session, "admin1")

        # Create table
        response = client.post(
            "/tables/",
            data=json.dumps({"number": "T1", "status": "available", "is_vip": False}),
            headers={**auth_headers(token), "Content-Type": "application/json"},
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["number"] == "T1"
        assert data["is_vip"] is False

def test_manager_can_create_table(client, app):
    with app.app_context():
        _, token = create_user_and_token("manager", db.session, "manager1")

        response = client.post(
            "/tables/",
            data=json.dumps({"number": "T2"}),
            headers={**auth_headers(token), "Content-Type": "application/json"},
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["number"] == "T2"

def test_waiter_cannot_create_table(client, app):
    with app.app_context():
        _, token = create_user_and_token("waiter", db.session, "waiter1")

        response = client.post(
            "/tables/",
            data=json.dumps({"number": "T3"}),
            headers={**auth_headers(token), "Content-Type": "application/json"},
        )
        assert response.status_code == 403  # Forbidden

def test_get_all_tables(client, app):
    with app.app_context():
        # Create admin and a table
        _, admin_token = create_user_and_token("admin", db.session, "admin2")
        table = Table(number="T4", status="available")
        db.session.add(table)
        db.session.commit()

        # Admin can get tables
        response = client.get(
            "/tables/",
            headers=auth_headers(admin_token)
        )
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert any(t["number"] == "T4" for t in data)

def test_update_table(client, app):
    with app.app_context():
        _, admin_token = create_user_and_token("admin", db.session, "admin3")
        table = Table(number="T5", status="available", is_vip=False)
        db.session.add(table)
        db.session.commit()

        # Update table
        response = client.put(
            f"/tables/{table.id}",
            data=json.dumps({"status": "occupied", "is_vip": True}),
            headers={**auth_headers(admin_token), "Content-Type": "application/json"},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "occupied"
        assert data["is_vip"] is True

def test_delete_table(client, app):
    with app.app_context():
        _, admin_token = create_user_and_token("admin", db.session, "admin4")
        table = Table(number="T6")
        db.session.add(table)
        db.session.commit()

        response = client.delete(
            f"/tables/{table.id}",
            headers=auth_headers(admin_token),
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "Table deleted"

        # Verify deleted
        t = Table.query.get(table.id)
        assert t is None
