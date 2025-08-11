from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from .config import DevelopmentConfig
from .extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # Import models so Alembic detects them
    from . import models  

    from .routes import main_bp
    app.register_blueprint(main_bp)

    # Import auth routes
    from .routes.auth.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Import user routes
    from .routes.users.users import users_bp
    app.register_blueprint(users_bp)

    # Import table routes
    from .routes.tables.tables import tables_bp
    app.register_blueprint(tables_bp)


    return app
