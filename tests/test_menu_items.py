import os
import pytest
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token

from app import create_app, db
from app.models.models import User, MenuItem


# ---------- Test Fixtures ----------

@pytest.fixture(scope="function")
def client():
    os.environ["FLASK_ENV"] = "testing"
    os.environ["SECRET_KEY"] = "test-secret"
    os.environ["DB_HOST"] = os.environ.get("DB_HOST", "localhost")
    os.environ["DB_PORT"] = os.environ.get("DB_PORT", "5432")
    os.environ["DB_USER"] = os.environ.get("DB_USER", "postgres")
    os.environ["DB_PASSWORD"] = os.environ.get("DB_PASSWORD", "postgres")
    os.environ["DB_NAME"] = os.environ.get("DB_NAME", "trustnet_pos_test_db")
    os.environ["TEST_DB_NAME"] = os.environ.get("TEST_DB_NAME", os.environ["DB_NAME"])

    app = create_app("testing")
    with app.app_context():
        db.drop_all()
        db.create_all()

        # seed users (admin, manager, waiter)
        users = [
            User(name="Admin", username="admin", password_hash=generate_password_hash("adminpass"), role="admin"),
            User(name="Manager", username="manager", password_hash=generate_password_hash("managerpass"), role="manager"),
            User(name="Waiter", username="waiter", password_hash=generate_password_hash("waiterpass"), role="waiter"),
        ]
        db.session.add_all(users)
        db.session.commit()

    testing_client = app.test_client()
    testing_client.application = app
    yield testing_client

    with app.app_context():
        db.session.remove()
        db.drop_all()


def auth_headers(user_id: int, role: str, app):
    """Issue a JWT with the given role for tests."""
    with app.app_context():
        token = create_access_token(identity=str(user_id), additional_claims={"role": role})
    return {"Authorization": f"Bearer {token}"}


# ---------- Tests ----------

def test_admin_can_create_menu_item(client):
    app = client.application
    headers = auth_headers(1, "admin", app)

    payload = {
        "name": "Cheeseburger",
        "description": "Tasty burger with cheese",
        "price": 9.99,
        "category": "food",
        "is_available": True,
        "image_url": "http://example.com/burger.jpg"
    }
    resp = client.post("/menu-items/", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "Cheeseburger"
    assert data["category"] == "food"
    assert data["is_available"] is True


def test_duplicate_name_returns_400(client):
    app = client.application
    headers = auth_headers(2, "manager", app)

    first = {
        "name": "Cola",
        "description": "Chilled",
        "price": 3.50,
        "category": "drinks",
        "is_available": True
    }
    client.post("/menu-items/", json=first, headers=headers)

    dup = {
        "name": "Cola",
        "description": "Another",
        "price": 3.00,
        "category": "drinks",
    }
    resp = client.post("/menu-items/", json=dup, headers=headers)
    assert resp.status_code == 400


def test_waiter_cannot_create_menu_item(client):
    app = client.application
    headers = auth_headers(3, "waiter", app)
    payload = {"name": "Ribeye", "price": 19.99, "category": "raw_meat"}
    resp = client.post("/menu-items/", json=payload, headers=headers)
    assert resp.status_code == 403


def test_get_all_and_filter_by_category(client):
    app = client.application
    admin_h = auth_headers(1, "admin", app)

    # seed a few items
    items = [
        {"name": "Steak", "price": 25.0, "category": "raw_meat"},
        {"name": "Pasta", "price": 12.0, "category": "food"},
        {"name": "Orange Juice", "price": 4.0, "category": "drinks"},
    ]
    for it in items:
        client.post("/menu-items/", json=it, headers=admin_h)

    # waiter can read
    waiter_h = auth_headers(3, "waiter", app)
    all_resp = client.get("/menu-items/", headers=waiter_h)
    assert all_resp.status_code == 200
    all_data = all_resp.get_json()
    assert len(all_data) == 3

    # filter
    filt_resp = client.get("/menu-items/?category=food", headers=waiter_h)
    assert filt_resp.status_code == 200
    filt_data = filt_resp.get_json()
    assert len(filt_data) == 1
    assert filt_data[0]["category"] == "food"


def test_get_single_item(client):
    app = client.application
    mgr_h = auth_headers(2, "manager", app)

    create = client.post("/menu-items/", json={"name": "Espresso", "price": 2.5, "category": "drinks"}, headers=mgr_h)
    item_id = create.get_json()["id"]

    # any allowed role can fetch
    waiter_h = auth_headers(3, "waiter", app)
    resp = client.get(f"/menu-items/{item_id}", headers=waiter_h)
    assert resp.status_code == 200
    assert resp.get_json()["name"] == "Espresso"


def test_admin_can_update_item(client):
    app = client.application
    admin_h = auth_headers(1, "admin", app)

    create = client.post("/menu-items/", json={"name": "Salad", "price": 6.0, "category": "food"}, headers=admin_h)
    item_id = create.get_json()["id"]

    update = client.put(
        f"/menu-items/{item_id}",
        json={"price": 7.5, "is_available": False},
        headers=admin_h,
    )
    assert update.status_code == 200
    data = update.get_json()
    assert data["price"] == 7.5
    assert data["is_available"] is False


def test_manager_can_delete_item(client):
    app = client.application
    mgr_h = auth_headers(2, "manager", app)

    create = client.post("/menu-items/", json={"name": "Tea", "price": 2.0, "category": "drinks"}, headers=mgr_h)
    item_id = create.get_json()["id"]

    delete = client.delete(f"/menu-items/{item_id}", headers=mgr_h)
    assert delete.status_code == 200
    # ensure gone
    waiter_h = auth_headers(3, "waiter", app)
    get_resp = client.get(f"/menu-items/{item_id}", headers=waiter_h)
    assert get_resp.status_code == 404
