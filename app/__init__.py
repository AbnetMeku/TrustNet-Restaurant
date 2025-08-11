from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from .config import DevelopmentConfig, TestingConfig, ProductionConfig
from .extensions import db, migrate, jwt

config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}

def create_app(config_name="development"):
    app = Flask(__name__)
    config_class = config_map.get(config_name, DevelopmentConfig)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    from . import models  # Import models so migrations see them

    # Register Blueprints...
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    from .routes.auth.auth import auth_bp
    app.register_blueprint(auth_bp)

    from .routes.users.users import users_bp
    app.register_blueprint(users_bp)

    from .routes.tables.tables import tables_bp
    app.register_blueprint(tables_bp)

    return app
