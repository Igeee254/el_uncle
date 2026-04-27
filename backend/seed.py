from app import app
from extensions import db
from models import Category, Product, User, Address, Order, OrderItem, Feedback

MOCK_DATA = [
  { "id": '1', "title": 'Arsenal Leather Bracelet', "price": 1500, "image": 'bracelet.png', "height": 260, "badgeColor": '#DB0007', "category": 'Bracelets', "rating": 5, "reviewsCount": 124 },
  { "id": '3', "title": 'Masai Beaded Bracelet', "price": 2000, "image": 'beaded.png', "height": 220, "badgeColor": '#000000', "category": 'Bracelets', "rating": 4, "reviewsCount": 89 },
  { "id": '5', "title": 'Kenya Flag Bracelet', "price": 1500, "image": 'bracelet.png', "height": 250, "badgeColor": '#000000', "category": 'Bracelets', "rating": 5, "reviewsCount": 45 },
  { "id": '14', "title": 'Savannah Sunset Cuff', "price": 1800, "image": 'beaded.png', "height": 240, "badgeColor": '#FF5722', "category": 'Bracelets', "rating": 4, "reviewsCount": 32 },
  { "id": '15', "title": 'Desert Rose Bangle', "price": 2200, "image": 'bracelet.png', "height": 260, "badgeColor": '#E91E63', "category": 'Bracelets', "rating": 5, "reviewsCount": 18 },
  { "id": '16', "title": 'Safari Braided Wristband', "price": 1300, "image": 'beaded.png', "height": 230, "badgeColor": '#795548', "category": 'Bracelets', "rating": 4, "reviewsCount": 67 },
  { "id": '17', "title": 'Tribal Bone Inlay Cuff', "price": 3500, "image": 'bracelet.png', "height": 280, "badgeColor": '#3E2723', "category": 'Bracelets', "rating": 5, "reviewsCount": 12 },
  { "id": '18', "title": 'Zebra Pattern Bracelet', "price": 1600, "image": 'beaded.png', "height": 210, "badgeColor": '#000', "category": 'Bracelets', "rating": 5, "reviewsCount": 94 },
  { "id": '19', "title": 'Mount Kenya Stone Beaded', "price": 2500, "image": 'bracelet.png', "height": 240, "badgeColor": '#607D8B', "category": 'Bracelets', "rating": 4, "reviewsCount": 56 },
  { "id": '7', "title": 'Safari Beaded Necklace', "price": 1800, "image": 'beaded.png', "height": 280, "badgeColor": '#795548', "category": 'Necklaces', "rating": 5, "reviewsCount": 210 },
  { "id": '9', "title": 'Gold Link Chain', "price": 5500, "image": 'keychain.png', "height": 320, "badgeColor": '#FFD700', "category": 'Necklaces', "rating": 5, "reviewsCount": 14 },
  { "id": '10', "title": 'Sterling Silver Chain', "price": 4200, "image": 'beaded.png', "height": 300, "badgeColor": '#C0C0C0', "category": 'Necklaces', "rating": 5, "reviewsCount": 22 },
  { "id": '11', "title": 'Antique Bronze Chain', "price": 2800, "image": 'bracelet.png', "height": 280, "badgeColor": '#CD7F32', "category": 'Necklaces', "rating": 4, "reviewsCount": 8 },
  { "id": '20', "title": 'Maasai Warrior Choker', "price": 3200, "image": 'beaded.png', "height": 340, "badgeColor": '#D32F2F', "category": 'Necklaces', "rating": 5, "reviewsCount": 41 },
  { "id": '21', "title": 'Hand-Carved Pendant', "price": 4800, "image": 'magnet.png', "height": 310, "badgeColor": '#5D4037', "category": 'Necklaces', "rating": 4, "reviewsCount": 5 },
  { "id": '12', "title": 'Crystal Charm Anklet', "price": 1200, "image": 'bracelet.png', "height": 220, "badgeColor": '#9c27b0', "category": 'Anklets', "rating": 5, "reviewsCount": 73 },
  { "id": '13', "title": 'Sea Shell Anklet', "price": 900, "image": 'beaded.png', "height": 250, "badgeColor": '#00bcd4', "category": 'Anklets', "rating": 4, "reviewsCount": 152 },
  { "id": '22', "title": 'Golden Sands Anklet', "price": 1500, "image": 'magnet.png', "height": 230, "badgeColor": '#FFB300', "category": 'Anklets', "rating": 5, "reviewsCount": 29 },
  { "id": '23', "title": 'Turquoise Breeze Anklet', "price": 1100, "image": 'bracelet.png', "height": 240, "badgeColor": '#26A69A', "category": 'Anklets', "rating": 4, "reviewsCount": 61 },
  { "id": '24', "title": 'Boho Tassel Anklet', "price": 800, "image": 'beaded.png', "height": 210, "badgeColor": '#FF4081', "category": 'Anklets', "rating": 5, "reviewsCount": 44 },
  { "id": '2', "title": 'Africa Map Wood Magnet', "price": 800, "image": 'magnet.png', "height": 320, "badgeColor": '#4caf50', "category": 'Souvenirs', "rating": 5, "reviewsCount": 341 },
  { "id": '4', "title": 'Arsenal Sport Keychain', "price": 1200, "image": 'keychain.png', "height": 290, "badgeColor": '#DB0007', "category": 'Souvenirs', "rating": 4, "reviewsCount": 112 },
  { "id": '6', "title": 'Hakuna Matata Magnet', "price": 800, "image": 'magnet.png', "height": 270, "badgeColor": '#ff9800', "category": 'Souvenirs', "rating": 5, "reviewsCount": 88 },
  { "id": '8', "title": 'Arsenal Vintage Badge', "price": 1400, "image": 'keychain.png', "height": 310, "badgeColor": '#DB0007', "category": 'Souvenirs', "rating": 5, "reviewsCount": 27 },
  { "id": '25', "title": 'Elephant Ebony Statue', "price": 2500, "image": 'magnet.png', "height": 340, "badgeColor": '#212121', "category": 'Souvenirs', "rating": 4, "reviewsCount": 15 },
  { "id": '26', "title": 'Baobab Tree Keychain', "price": 950, "image": 'keychain.png', "height": 280, "badgeColor": '#8D6E63', "category": 'Souvenirs', "rating": 5, "reviewsCount": 52 },
  { "id": '27', "title": 'Shea Butter Lotion', "price": 1200, "image": 'bracelet.png', "height": 250, "badgeColor": '#f48fb1', "category": 'Cosmetics', "rating": 4, "reviewsCount": 100 },
  { "id": '28', "title": 'Silver Diamond Ring', "price": 8500, "image": 'beaded.png', "height": 220, "badgeColor": '#E0E0E0', "category": 'Jewelries', "rating": 5, "reviewsCount": 42 },
  { "id": '29', "title": 'AirPods Pro Case', "price": 900, "image": 'keychain.png', "height": 200, "badgeColor": '#9e9e9e', "category": 'Electronics', "rating": 4, "reviewsCount": 210 },
  { "id": '30', "title": 'African Print Hoodie', "price": 3500, "image": 'beaded.png', "height": 300, "badgeColor": '#3f51b5', "category": 'Clothing', "rating": 5, "reviewsCount": 78 },
  { "id": '31', "title": 'Woven Wall Basket', "price": 1800, "image": 'magnet.png', "height": 310, "badgeColor": '#795548', "category": 'Home Decor', "rating": 4, "reviewsCount": 35 },
  { "id": '32', "title": 'Maasai Mara Canvas Print', "price": 4500, "image": 'beaded.png', "height": 350, "badgeColor": '#ff5722', "category": 'Art', "rating": 5, "reviewsCount": 12 },
]

def seed_db():
    with app.app_context():
        # Force recreation to apply schema changes (like provider_contact)
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        
        # Clear existing to prevent duplicates during testing
        Product.query.delete()
        Category.query.delete()
        
        cats = {}
        for item in MOCK_DATA:
            cat_name = item['category']
            if cat_name not in cats:
                new_cat = Category(name=cat_name)
                db.session.add(new_cat)
                db.session.flush() # get id
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
                provider_contact='+254 746 860 965' # Default mock contact
            )
            db.session.add(p)
            print(f"Added product: {p.title}")

        # Add Admin User
        from models import User
        if not User.query.filter_by(email='admin@kwelistore.com').first():
            admin = User(
                username='KweliAdmin',
                email='admin@kwelistore.com',
                password_hash='admin123',
                phone='+254 746 860 965',
                is_admin=True
            )
            db.session.add(admin)
            print("Added admin user: admin@kwelistore.com")
            
        db.session.commit()
        print(f"COMMITTED {len(MOCK_DATA)} products to the database.")
        print("Database seeded successfully with MOCK_DATA.")

if __name__ == '__main__':
    seed_db()
