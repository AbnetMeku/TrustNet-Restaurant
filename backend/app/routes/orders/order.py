# routes/orders/order.py
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Order, OrderItem, MenuItem, Table, User
from app.utils.decorators import roles_required
from datetime import datetime
from .kitchen_tag import generate_kitchen_tag  # tag generation helper
from decimal import Decimal

orders_bp = Blueprint("orders_bp", __name__, url_prefix="/orders")

# --- Helpers ---
def serialize_datetime(dt):
    return dt.isoformat() if dt else None

def order_item_to_dict(item):
    return {
        "id": item.id,
        "order_id": item.order_id,
        "menu_item_id": item.menu_item_id,
        "quantity": item.quantity,
        "price": float(item.price),
        "notes": item.notes,
        "prep_tag": item.prep_tag,
        "status": item.status,
        "station": item.station,
        "created_at": serialize_datetime(item.created_at),
        "updated_at": serialize_datetime(item.updated_at),
    }

def order_to_dict(order):
    return {
        "id": order.id,
        "table_id": order.table_id,
        "user_id": order.user_id,
        "status": order.status,
        "total_amount": float(order.total_amount or 0),
        "created_at": serialize_datetime(order.created_at),
        "updated_at": serialize_datetime(order.updated_at),
        "items": [order_item_to_dict(i) for i in order.items]
    }

# --- Routes ---

@orders_bp.route("/", methods=["GET"])
@jwt_required()
@roles_required("admin", "manager", "waiter", "cashier", "kitchen", "butchery", "bar")
def get_orders():
    """Get all orders (optionally filter by status or table)."""
    query = Order.query
    status = request.args.get("status")
    table_id = request.args.get("table_id")

    if status:
        query = query.filter_by(status=status)
    if table_id:
        query = query.filter_by(table_id=table_id)

    orders = query.all()
    return jsonify([order_to_dict(o) for o in orders]), 200


@orders_bp.route("/<int:order_id>", methods=["GET"])
@jwt_required()
@roles_required("admin", "manager", "waiter", "cashier", "kitchen", "butchery", "bar")
def get_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        abort(404, description="Order not found")
    return jsonify(order_to_dict(order)), 200


@orders_bp.route("/", methods=["POST"])
@jwt_required()
@roles_required("admin", "manager", "waiter")
def create_order():
    """Create a new order (status=open)."""
    data = request.get_json() or {}
    table_id = data.get("table_id")
    if not table_id:
        abort(400, description="Table ID is required")

    table = db.session.get(Table, table_id)
    if not table:
        abort(404, description="Table not found")

    user_id = get_jwt_identity()  # user creating order

    order = Order(table_id=table_id, user_id=user_id, status="open", total_amount=Decimal("0.00"))
    db.session.add(order)
    db.session.commit()

    return jsonify(order_to_dict(order)), 201


@orders_bp.route("/<int:order_id>/items", methods=["POST"])
@jwt_required()
@roles_required("admin", "manager", "waiter")
def add_order_item(order_id):
    """Add an item to an existing order, determine station and generate prep tag."""
    order = db.session.get(Order, order_id)
    if not order:
        abort(404, description="Order not found")

    data = request.get_json() or {}
    menu_item_id = data.get("menu_item_id")
    if menu_item_id is None:
        abort(400, description="menu_item_id is required")

    quantity = data.get("quantity", 1)
    if not isinstance(quantity, int) or quantity <= 0:
        abort(400, description="quantity must be a positive integer")

    notes = data.get("notes", "")

    menu_item = db.session.get(MenuItem, menu_item_id)
    if not menu_item or not menu_item.is_available:
        abort(400, description="Menu item not available")

    # Determine station based on category
    category_station_map = {"raw meat": "butchery", "food": "kitchen", "drinks": "bar"}
    station = category_station_map.get(menu_item.category.lower(), "kitchen")

    prep_tag = generate_kitchen_tag(station) if station != "bar" else None  # bar doesn't need tag

    item = OrderItem(
        order_id=order.id,
        menu_item_id=menu_item.id,
        quantity=quantity,
        price=menu_item.price,
        notes=notes,
        prep_tag=prep_tag,
        status="pending",
        station=station,
    )

    db.session.add(item)
    order.total_amount += menu_item.price * quantity
    db.session.commit()

    return jsonify(order_item_to_dict(item)), 201


@orders_bp.route("/<int:order_id>/status", methods=["PUT"])
@jwt_required()
@roles_required("waiter", "cashier", "admin", "manager")
def update_order_status(order_id):
    """Update order status: open → closed → paid with role checks."""
    order = db.session.get(Order, order_id)
    if not order:
        abort(404, description="Order not found")

    data = request.get_json() or {}
    new_status = data.get("status")
    valid_statuses = {"open", "closed", "paid"}

    if new_status not in valid_statuses:
        abort(400, description=f"Status must be one of {sorted(valid_statuses)}")

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    # Only waiter can close, only cashier can pay
    if new_status == "closed" and user.role != "waiter":
        abort(403, description="Only waiter can close an order")
    if new_status == "paid" and user.role != "cashier":
        abort(403, description="Only cashier can mark order as paid")
    if new_status == "paid" and order.status != "closed":
        abort(400, description="Order must be closed before marking as paid")

    order.status = new_status
    db.session.commit()

    return jsonify(order_to_dict(order)), 200


@orders_bp.route("/items/<int:item_id>/status", methods=["PUT"])
@jwt_required()
@roles_required("butchery", "kitchen", "bar")
def update_order_item_status(item_id):
    """Update individual order item status by station role."""
    item = db.session.get(OrderItem, item_id)
    if not item:
        abort(404, description="Order item not found")

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user or user.role != item.station:
        abort(403, description="You are not authorized to update this item")

    data = request.get_json() or {}
    new_status = data.get("status")
    valid_item_statuses = {"pending", "ready"}

    if new_status not in valid_item_statuses:
        abort(400, description=f"Item status must be one of {sorted(valid_item_statuses)}")

    item.status = new_status
    db.session.commit()

    return jsonify(order_item_to_dict(item)), 200
