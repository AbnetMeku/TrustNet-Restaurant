# app/utils/decorators.py

from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import jsonify

def roles_required(*allowed_roles):
    """
    Decorator to protect routes based on user roles.
    Usage: @roles_required('admin', 'manager')

    Checks that:
    - A valid JWT is present
    - The JWT contains a 'role' claim
    - The 'role' claim matches one of the allowed_roles
    """

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Ensure JWT is present and valid
            verify_jwt_in_request()

            # Get claims from the token
            claims = get_jwt()

            # Check if 'role' is present in claims and allowed
            user_role = claims.get('role', None)
            if user_role is None or user_role not in allowed_roles:
                return jsonify(msg="Forbidden: Insufficient role"), 403

            # Role allowed — proceed with the original function
            return fn(*args, **kwargs)

        return decorator
    return wrapper
