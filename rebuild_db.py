from backend.app import app
from backend.extensions import db
# Ensure all models are imported so SQLAlchemy knows their complete schema!
from backend.models import User, Category, Product, Order, OrderItem, Address, Feedback

with app.app_context():
    print("Dropping all tables safely...")
    db.session.commit() # Clear any transactions
    db.drop_all()
    print("Recreating tables with fully loaded schemas...")
    db.create_all()
    print("Done! Database is perfectly synchronized.")
