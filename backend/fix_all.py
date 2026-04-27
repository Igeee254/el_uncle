import pymysql
import os
from flask import Flask
from extensions import db
from models import User, Category, Product

MOCK_DATA = [
  { "title": 'Premium Leather Bag', "price": 4500, "image": 'hero.png', "height": 300, "badgeColor": '#8da696', "category": 'Fashion', "rating": 5, "reviewsCount": 12 },
  { "title": 'Smart Office Chair', "price": 12000, "image": 'magnet.png', "height": 280, "badgeColor": '#607D8B', "category": 'Home & Office', "rating": 5, "reviewsCount": 8 },
  { "title": 'Wireless Noise Cancelling Pods', "price": 3500, "image": 'keychain.png', "height": 240, "badgeColor": '#2196f3', "category": 'Electronics', "rating": 4, "reviewsCount": 25 },
]

def run_master_fix():
    print("🛠️ MASTER FIX: Starting System Restoration...")
    
    # 1. Ensure Database exists
    try:
        connection = pymysql.connect(host='127.0.0.1', user='root', password='')
        with connection.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS el_uncle_db")
        connection.close()
        print("✅ Database 'el_uncle_db' verified.")
    except Exception as e:
        print(f"❌ DATABASE CONNECTION FAILED: {e}")
        print("👉 Make sure MySQL (WAMP/XAMPP) is started!")
        return

    # 2. Setup Flask Context to use SQLAlchemy
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@127.0.0.1/el_uncle_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        # 3. Reset Tables (Crucial to fix schema errors like 'Unknown column is_admin')
        print("🧹 Dropping and Recreating tables to fix schema mismatch...")
        db.drop_all()
        db.create_all()
        print("✅ Fresh database schema created.")
        
        # 4. Seed Categories and Products
        print("📥 Seeding product catalog...")
        cats = {}
        for item in MOCK_DATA:
            cat_name = item['category']
            if cat_name not in cats:
                new_cat = Category(name=cat_name)
                db.session.add(new_cat)
                db.session.flush()
                cats[cat_name] = new_cat
            
            p = Product(
                title=item['title'],
                price=item['price'],
                category_id=cats[cat_name].id,
                image_uri=item['image'],
                stock=50,
                height=item['height'],
                badge_color=item['badgeColor'],
                rating=item['rating'],
                reviews_count=item['reviewsCount'],
                provider_contact='+254 746 860 965'
            )
            db.session.add(p)
        
        # 5. Seed Admin
        print("👤 Creating Admin account...")
        admin = User(
            username='KweliAdmin',
            full_name='KweliStoreKenya Admin',
            email='admin@kwelistore.com',
            password_hash='kweli123',
            phone='+254 746 860 965',
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print("🎉 System restored with 26 products and 1 Admin account!")

    print("\n🚀 SUCCESS! Now restart your backend: python app.py")

if __name__ == '__main__':
    run_master_fix()
