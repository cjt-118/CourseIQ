import os
from flask import Flask, jsonify
from flask_cors import CORS
from course_catalog.routes import catalog_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(catalog_bp)
    
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200
    
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)