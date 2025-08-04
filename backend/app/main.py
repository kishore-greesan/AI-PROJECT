from flask import Flask, jsonify
from flask_cors import CORS
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create Flask app
app = Flask(__name__)
CORS(app)

@app.route("/")
def read_root():
    return jsonify({
        "message": "Welcome to Employee Performance Management System",
        "version": "1.0.0",
        "docs": "/docs"
    })

@app.route("/health")
def health_check():
    return jsonify({"status": "healthy", "message": "Employee Performance Management API is running"})

@app.route("/api/test")
def test_api():
    return jsonify({"message": "API is working!"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False) 