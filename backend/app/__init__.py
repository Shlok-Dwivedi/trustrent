from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400 * 7  # 7 days

    # Global CORS Preflight Handler
    @app.before_request
    def handle_options_preflight():
        if request.method == "OPTIONS":
            return "", 200

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.listings import listings_bp
    from app.routes.bookings import bookings_bp
    from app.routes.reviews import reviews_bp
    from app.routes.search import search_bp
    from app.routes.saved import saved_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    from app.routes.photos import photos_bp
    from app.routes.admin import admin_bp
    from app.routes.tenancies import tenancies_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(listings_bp, url_prefix="/api/listings")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(search_bp, url_prefix="/api/search")
    app.register_blueprint(saved_bp, url_prefix="/api/saved")
    app.register_blueprint(messages_bp, url_prefix="/api/messages")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(photos_bp, url_prefix="/api/photos")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(tenancies_bp, url_prefix="/api/tenancies")

    @app.route("/")
    def index():
        return {
            "name": "TrustRent API",
            "version": "1.0.0",
            "status": "Running",
            "documentation": "https://github.com/Shlok-Dwivedi/trustrent"
        }

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
