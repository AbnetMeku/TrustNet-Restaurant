# app/routes/tables2.py

from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Table, User
from app.utils.decorators import roles_required

tables2_bp = Blueprint("tables2_bp", __name__, url_prefix="/tables2")

def table_to_dict(table):
    """Convert Table model to dict including assigned waiter info."""
    return {
        "id": table.id,
        "number": table.number,
        "seats": table.seats,
        "is_vip": table.is_vip,
        "waiter_id": table.waiter_id,
        "waiter_name": table.waiter.name if table.waiter else None,
    }

@tables2_bp.route("/", methods=["GET"])
@jwt_required()
@roles_required("admin", "manager", "waiter")
def get_tables():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if current_user.role in ["admin", "manager"]:
        tables = Table.query.all()
    elif current_user.role == "waiter":
        tables = Table.query.filter_by(waiter_id=current_user_id).all()
    else:
        # Other roles don't get tables here
        abort(403, "Forbidden")

    return jsonify([table_to_dict(t) for t in tables])

@tables2_bp.route("/", methods=["POST"])
@jwt_required()
@roles_required("admin", "manager")
def create_table():
    data = request.get_json()

    number = data.get("number")
    seats = data.get("seats")
    is_vip = data.get("is_vip", False)
    waiter_id = data.get("waiter_id")  # Optional assignment

    if not number or not seats:
        abort(400, "Missing table number or seats")

    table = Table(number=number, seats=seats, is_vip=is_vip)

    if waiter_id:
        waiter = User.query.get(waiter_id)
        if not waiter or waiter.role != "waiter":
            abort(400, "Invalid waiter_id")
        table.waiter_id = waiter_id

    db.session.add(table)
    db.session.commit()

    return jsonify(table_to_dict(table)), 201

@tables2_bp.route("/<int:table_id>", methods=["PUT"])
@jwt_required()
@roles_required("admin", "manager")
def update_table(table_id):
    table = Table.query.get_or_404(table_id)
    data = request.get_json()

    table.number = data.get("number", table.number)
    table.seats = data.get("seats", table.seats)
    table.is_vip = data.get("is_vip", table.is_vip)

    waiter_id = data.get("waiter_id")
    if waiter_id is not None:
        waiter = User.query.get(waiter_id)
        if not waiter or waiter.role != "waiter":
            abort(400, "Invalid waiter_id")
        table.waiter_id = waiter_id

    db.session.commit()
    return jsonify(table_to_dict(table))

@tables2_bp.route("/<int:table_id>", methods=["DELETE"])
@jwt_required()
@roles_required("admin", "manager")
def delete_table(table_id):
    table = Table.query.get_or_404(table_id)
    db.session.delete(table)
    db.session.commit()
    return jsonify({"message": "Table deleted"})
