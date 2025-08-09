from dotenv import load_dotenv
load_dotenv()  # <-- load env vars first

from flask import Flask
import os

from .config import DevelopmentConfig
from .extensions import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
