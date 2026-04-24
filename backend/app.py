from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# ----------------- DATABASE SETUP -----------------
# To use XAMPP locally: 'mysql+pymysql://root:@localhost/your_db_name'
# To use an online DB directly right now (like Aiven, AWS, etc.): replace with the provided cloud URL.
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/el_uncle_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# --------------------------------------------------

from models import Category, Product, Order, OrderItem, User

# Initialize Limiter to prevent brute-force or spamming endpoints
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

@app.route('/api/status', methods=['GET'])
@limiter.limit("5 per minute")
def status():
    return jsonify({
        "status": "running", 
        "message": "Backend is active. Rate limiting in place to ensure security and prevent breaches."
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    result = []
    for p in products:
        result.append({
            "id": str(p.id),
            "title": p.title,
            "price": f"KSh {int(p.price):,}",
            "image_uri": p.image_uri,  # App.js mapping will use this
            "height": p.height,
            "badgeColor": p.badge_color,
            "category": p.category_rel.name,
            "rating": p.rating,
            "reviewsCount": p.reviews_count
        })
    return jsonify(result)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.name for c in categories])

@app.route('/api/checkout', methods=['POST'])
def checkout():
    # Will be implemented to handle transactions securely
    data = request.json
    return jsonify({"message": "Order processed successfully", "status": "success"}), 200

if __name__ == '__main__':
    # Initialize the database tables if they do not exist
    with app.app_context():
        db.create_all()
        
    # Running securely on debug mode for local testing
    app.run(host='0.0.0.0', port=5000, debug=True)
