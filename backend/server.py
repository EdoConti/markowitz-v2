from flask import Flask
from flask_cors import CORS
from db_config import db  # Import the MongoDB connection from your db_config file
from routes.SecurityRoutes import security_bp  # Import your security routes blueprint

# Initialize the Flask app
app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",        # dev
            "http://127.0.0.1:5173",        # dev
            "https://markowitz-optimization.netlify.app" # production
        ]
    }
})
# Register the blueprint for security-related routes
app.register_blueprint(security_bp, url_prefix='/api')

# Root route for health check or welcome message
@app.route('/')
def home():
    return "Welcome to the Securities API!"

# Error handler for 404 (Not Found)
@app.errorhandler(404)
def not_found(error):
    return {"error": "Not found"}, 404

# Error handler for 500 (Internal Server Error)
@app.errorhandler(500)
def internal_error(error):
    return {"error": "Internal Server Error"}, 500


# Run the app
if __name__ == "__main__":
    app.run(debug=True)
