import os
from app import app, db
from models import User
with app.app_context():
    # Verify the specific admin email
    admin = User.query.filter_by(email="amstrongmutethia@gmail.com").first()
    if admin:
        admin.is_verified = True
        db.session.commit()
        print("? SUCCESS: Your Admin account is now verified!")
    else:
        print("? ERROR: Admin account not found in database.")
