from backend.app import app
from backend.extensions import db
from backend.models import User, Order, Address, Feedback

with app.app_context():
    print("Emptying user accounts...")
    # Safe delete starting from connected tables
    Order.query.delete()
    Address.query.delete()
    Feedback.query.delete()
    User.query.delete()
    db.session.commit()
    print("All user accounts have been completely wiped!")
