from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from .config import DevelopmentConfig
from .extensions import db, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so Alembic detects them
    from . import models  

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
