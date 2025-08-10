from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app.models.models import User
from app.extensions import jwt
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Invalid username or password"}), 401

    # Role-based token expiry times
    role_expiry_map = {
        "waiter": timedelta(hours=1),
        "kitchen": timedelta(hours=12),
        "bar": timedelta(hours=12),
        "butcher": timedelta(hours=12),
        "admin": timedelta(hours=24),
        "manager": timedelta(hours=24),
        "cashier": timedelta(hours=12),
    }
    
    expires = role_expiry_map.get(user.role, timedelta(hours=1))  # default 1 hour

    # Create access token with role in claims
    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={"role": user.role},
    expires_delta=expires
)
    return jsonify(access_token=access_token, user={"id": user.id, "name": user.name, "role": user.role})
