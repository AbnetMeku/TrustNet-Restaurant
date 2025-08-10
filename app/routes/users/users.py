# app/routes/users/users.py
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import User
from werkzeug.security import generate_password_hash
from app.utils.decorators import roles_required

users_bp = Blueprint("users_bp", __name__, url_prefix="/users")

def user_to_dict(user):
    """Helper to convert User model to JSON-safe dict."""
    return {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "role": user.role,
    }

# ---- GET ALL USERS ----
@users_bp.route("/", methods=["GET"])
@jwt_required()
@roles_required("admin", "manager")  # <-- pass roles as separate arguments
def get_users():
    """Return list of all users. Restricted to admin and manager."""
    users = User.query.all()
    return jsonify([user_to_dict(u) for u in users])

# ---- CREATE USER ----
@users_bp.route("/", methods=["POST"])
@jwt_required()
@roles_required("admin", "manager")  # <-- pass roles as separate arguments
def create_user():
    """Create a new user. Admin and manager only."""
    data = request.get_json()

    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not all([name, username, password, role]):
        abort(400, "Missing user info")

    if User.query.filter_by(username=username).first():
        abort(400, "Username already exists")

    user = User(
        name=name,
        username=username,
        password_hash=generate_password_hash(password),
        role=role,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify(user_to_dict(user)), 201

# ---- GET SINGLE USER ----
@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
@roles_required("admin", "manager", "waiter", "kitchen", "butcher", "bar", "cashier")
def get_user(user_id):
    """
    Get user details by ID.
    Allowed roles: admin, manager, and all staff roles.
    Users can only see their own info unless admin/manager.
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    user = User.query.get_or_404(user_id)

    # If not admin or manager, user can only access their own data
    if current_user.role not in ["admin", "manager"] and current_user.id != user_id:
        abort(403, "Forbidden")

    return jsonify(user_to_dict(user))

# ---- UPDATE USER ----
@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
@roles_required("admin", "manager")
def update_user(user_id):
    """Update user info (name and role). Only admin and manager can update."""
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    user.name = data.get("name", user.name)
    user.role = data.get("role", user.role)

    # We won't allow username or password update here for now

    db.session.commit()
    return jsonify(user_to_dict(user))

# ---- DELETE USER ----
@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
@roles_required("admin", "manager")
def delete_user(user_id):
    """Delete a user. Only admin and manager allowed."""
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})
