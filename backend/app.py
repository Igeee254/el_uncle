from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from extensions import db
from datetime import datetime
import uuid
from flask_mail import Mail, Message
import threading
import cloudinary
import cloudinary.uploader
import cloudinary.api

app = Flask(__name__)
CORS(app)

# ----------------- DATABASE SETUP -----------------
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/el_uncle_db')
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'kweli_secret_123')

# ----------------- MAIL SETUP -----------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'amstrongmutethia@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'elfz ayzb lxld pukg')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME', 'amstrongmutethia@gmail.com')

mail = Mail(app)

# ----------------- CLOUDINARY SETUP -----------------
cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME', 'Root'),
  api_key = os.getenv('CLOUDINARY_API_KEY', '477191774921971'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET', 'sIpLN2GwghfpYVthAB_D9l4DbkA'),
  secure = True
)

db.init_app(app)

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    from flask import send_from_directory
    # Clean filename to avoid path traversal
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(Exception)
def handle_exception(e):
    # Handle all-other exceptions to return JSON instead of HTML
    print(f"🔥 UNHANDLED ERROR: {e}")
    return jsonify({
        "error": "Server Error",
        "details": str(e),
        "hint": "Check if MySQL is running in XAMPP"
    }), 500

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        from models import Feedback
        data = request.json
        name = data.get('name')
        rating = data.get('rating', 5)
        comment = data.get('comment')
        suggestion = data.get('suggestion')

        new_feedback = Feedback(
            name=name,
            rating=rating,
            comment=comment,
            suggestion=suggestion
        )
        db.session.add(new_feedback)
        db.session.commit()

        # Send alert if rating is low (<= 2)
        if rating <= 2:
            try:
                alert_msg = Message(
                    f"⚠️ LOW RATING ALERT ({rating} Stars) - KweliStoreKenya",
                    recipients=[app.config['MAIL_USERNAME']]
                )
                alert_msg.html = f"""
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ff7675; border-radius: 10px;">
                    <h2 style="color: #d63031;">New Low Rating Feedback</h2>
                    <p><strong>Customer:</strong> {name}</p>
                    <p><strong>Rating:</strong> {rating} / 5</p>
                    <p><strong>Comment:</strong> {comment}</p>
                    <p><strong>What they think we can do better:</strong></p>
                    <div style="background: #fff5f5; padding: 15px; border-radius: 8px; color: #c0392b;">
                        {suggestion if suggestion else "No suggestion provided."}
                    </div>
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 11px; color: #999;">This is an automated alert from KweliStoreKenya Backend.</p>
                </div>
                """
                mail.send(alert_msg)
            except Exception as e:
                print(f"❌ Failed to send alert email: {e}")

        return jsonify({"message": "Feedback submitted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/feedback', methods=['GET'])
def get_all_feedback():
    admin_email = request.args.get('email')
    if admin_email != "amstrongmutethia@gmail.com":
        return jsonify({"error": "Unauthorized. Only Super Admin can view reviews."}), 403
        
    try:
        from models import Feedback
        feedbacks = Feedback.query.order_by(Feedback.id.desc()).all()
        return jsonify([{
            "id": f.id,
            "name": f.name,
            "rating": f.rating,
            "comment": f.comment,
            "suggestion": f.suggestion,
            "date": f.created_at.strftime('%b %d, %Y')
        } for f in feedbacks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    try:
        from models import Product
        count = Product.query.count()
        return jsonify({
            "status": "online",
            "db": "connected",
            "product_count": count
        })
    except Exception as e:
        return jsonify({
            "status": "running",
            "db": "ERROR/OFFLINE",
            "details": str(e),
            "hint": "Start MySQL in XAMPP Control Panel!"
        })

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        from models import Product
        products = Product.query.all()
        result = []
        for p in products:
            result.append({
                "id": str(p.id),
                "title": p.title,
                "price": f"KSh {int(p.price):,}",
                "image_uri": p.image_uri,
                "height": p.height,
                "badgeColor": p.badge_color,
                "category": p.category_rel.name if p.category_rel else "General",
                "rating": p.rating,
                "reviewsCount": p.reviews_count,
                "provider_contact": p.provider_contact,
                "uploader_name": p.uploader.username if p.uploader_id else "KweliStoreKenya Admin"
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({"error": "Database offline", "hint": "Start MySQL in XAMPP"}), 503

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        try:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(file, folder="kwelistorekenya_products")
            # Return the secure URL
            return jsonify({"filename": upload_result['secure_url']}), 200
        except Exception as e:
            print(f"❌ Cloudinary Upload Error: {e}")
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Unknown error"}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    from models import Category
    categories = Category.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories])

@app.route('/api/products', methods=['POST'])
def add_product():
    from models import Product
    data = request.json
    try:
        new_product = Product(
            title=data.get('title'),
            price=float(data.get('price')),
            category_id=int(data.get('category_id')),
            image_uri=data.get('image_uri', 'bracelet.png'),
            stock=int(data.get('stock', 0)),
            height=int(data.get('height', 200)),
            badge_color=data.get('badgeColor', '#8da696'),
            provider_contact=data.get('provider_contact', ''),
            uploader_id=data.get('uploader_id'),
            rating=4.5,
            reviews_count=0
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully", "id": new_product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"❌ Failed to send async email: {e}")

def send_verification_email(email, username, token, is_admin=False):
    try:
        verify_url = f"https://el-uncle.onrender.com/api/admin/verify/{token}"
        msg = Message(
            "Account Verification - KweliStoreKenya",
            recipients=[email]
        )
        msg.html = f"""
        <div style="background-color: #f4f7f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="background-color: #2E7D32; padding: 30px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">KWELI STORE KENYA</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">MARKETPLACE & SERVICES</p>
                </div>
                <div style="padding: 40px; color: #444; line-height: 1.6;">
                    <h2 style="color: #333; margin-top: 0;">Hi {username},</h2>
                    <p style="font-size: 16px;">We're excited to have you on board! To finish setting up your account and ensure your security, please verify your email address by clicking the button below.</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{verify_url}" style="display: inline-block; padding: 16px 36px; background-color: #F15A24; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(241, 90, 36, 0.3); transition: all 0.3s ease;">Verify My Account</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #888;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #8da696; word-break: break-all;">{verify_url}</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 13px; color: #999; text-align: center; margin-bottom: 0;">
                        KweliStoreKenya - Excellence in Services and Goods.<br>
                        If you didn't create this account, please ignore this email.
                    </p>
                </div>
            </div>
        </div>
        """
        thread = threading.Thread(target=send_async_email, args=(app, msg))
        thread.start()
        return True
    except Exception as e:
        print(f"❌ Failed to initiate email thread: {e}")
        return False

@app.route('/api/admin/signup', methods=['POST'])
def admin_signup():
    from models import User
    data = request.json
    username = data.get('username')
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password or not full_name:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email, is_admin=True).first():
        return jsonify({"error": "Admin with this email already exists"}), 400
        
    token = str(uuid.uuid4())
    new_user = User(
        username=username,
        full_name=full_name,
        email=email,
        password_hash=password, # Use hash in production
        is_admin=True,
        is_verified=True,
        verification_token=token
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        email_sent = send_verification_email(email, username, token, is_admin=True)
        if not email_sent:
            return jsonify({"message": "Signup successful, but failed to send email. Check server logs.", "token": token}), 201
            
        return jsonify({"message": "Signup successful! You can now log in directly.", "token": token}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def client_signup():
    from models import User
    data = request.json
    username = data.get('username')
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password or not full_name:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email, is_admin=False).first():
        return jsonify({"error": "User with this email already exists"}), 400
        
    token = str(uuid.uuid4())
    new_user = User(
        username=username,
        full_name=full_name,
        email=email,
        password_hash=password,
        is_admin=False,
        is_verified=True,
        verification_token=token
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        email_sent = send_verification_email(email, username, token, is_admin=False)
        if not email_sent:
            return jsonify({"message": "Signup successful, but failed to send email.", "token": token}), 201
            
        return jsonify({
            "message": "Signup successful! Verify your email to start shopping.",
            "token": token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def client_login():
    from models import User
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    try:
        user = User.query.filter_by(email=email).first()
        if user and user.password_hash == password:
        # Email verification disabled globally as per owner request
                
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "secondary_phone": user.secondary_phone,
                    "email_notifications": user.email_notifications
                },
                "token": "mock-client-token-456"
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/admin/verify/<token>', methods=['GET'])
def verify_admin(token):
    from models import User
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return """
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1 style="color:#d81b60;">Invalid Token</h1>
            <p>This verification link is invalid or has expired.</p>
        </div>
        """, 404
        
    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    
    # Return a nice success page
    return f"""
    <div style="text-align:center; padding:50px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f7f6; min-height:100vh;">
        <div style="background:#fff; padding:60px 40px; border-radius:24px; display:inline-block; box-shadow:0 15px 35px rgba(0,0,0,0.05); max-width: 500px; width: 100%;">
            <div style="width: 80px; height: 80px; background-color: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                <span style="color:#4caf50; font-size:40px; line-height: 80px;">✓</span>
            </div>
            <h2 style="color:#333; margin-bottom: 10px; font-size: 28px;">Verification Successful!</h2>
            <p style="color:#666; font-size: 16px; margin-bottom: 40px;">Welcome, <strong>{user.username}</strong>. Your account is now active and ready to use.</p>
            
            <a href="https://kwelistorekenya.netlify.app" style="display: inline-block; background-color: #F15A24; color: white; padding: 18px 45px; border-radius: 40px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(241, 90, 36, 0.4);">CONTINUE TO MARKETPLACE</a>
            
            <p style="color:#888; font-size:14px; margin-top:30px;">You can now close this tab and return to the app.</p>
        </div>
    </div>
    """

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    admin_email = request.args.get('email')
    if admin_email != "amstrongmutethia@gmail.com":
        return jsonify({"error": "Unauthorized. Only Super Admin can view users."}), 403
    
    try:
        from models import User
        users = User.query.all()
        return jsonify([{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_verified": u.is_verified
        } for u in users]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/check-verification/<email>', methods=['GET'])
def check_verification(email):
    from models import User
    try:
        user = User.query.filter_by(email=email).first()
        if user and user.is_verified:
            return jsonify({
                "verified": True, 
                "user": {
                    "id": user.id, 
                    "username": user.username, 
                    "full_name": user.full_name, 
                    "email": user.email
                }
            }), 200
        return jsonify({"verified": False}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    from models import User
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    try:
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Update fields
        user.username = data.get('username', user.username)
        user.full_name = data.get('full_name', user.full_name)
        user.secondary_phone = data.get('secondary_phone', user.secondary_phone)
        user.email_notifications = data.get('email_notifications', user.email_notifications)
        user.push_notifications = data.get('push_notifications', user.push_notifications)
        user.sms_notifications = data.get('sms_notifications', user.sms_notifications)
        user.dark_mode = data.get('dark_mode', user.dark_mode)
        
        # Also allow password change if provided
        new_password = data.get('password')
        if new_password:
            user.password_hash = new_password
            
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "secondary_phone": user.secondary_phone,
                "email_notifications": user.email_notifications,
                "push_notifications": user.push_notifications,
                "sms_notifications": user.sms_notifications,
                "dark_mode": user.dark_mode
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/address', methods=['GET', 'POST', 'DELETE'])
def address_manager():
    from models import User, Address
    if request.method == 'GET':
        email = request.args.get('email')
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        addresses = Address.query.filter_by(user_id=user.id).all()
        return jsonify([{
            "id": a.id, "label": a.label, "street": a.street, 
            "city": a.city, "phone": a.phone, "is_default": a.is_default
        } for a in addresses]), 200
        
    elif request.method == 'POST':
        data = request.json
        user = User.query.filter_by(email=data.get('email')).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # If new is marked default, unset others
        if data.get('is_default'):
            Address.query.filter_by(user_id=user.id).update({"is_default": False})
            
        new_addr = Address(
            user_id=user.id,
            label=data.get('label', 'Home'),
            street=data.get('street', ''),
            city=data.get('city', ''),
            phone=data.get('phone', ''),
            is_default=bool(data.get('is_default', False))
        )
        db.session.add(new_addr)
        db.session.commit()
        return jsonify({"message": "Address added"}), 201

    elif request.method == 'DELETE':
        addr_id = request.args.get('id')
        Address.query.filter_by(id=addr_id).delete()
        db.session.commit()
        return jsonify({"message": "Address deleted"}), 200

@app.route('/api/user/orders', methods=['GET'])
def get_user_orders():
    from models import User, Order
    email = request.args.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.id.desc()).all()
    res = []
    for o in orders:
        items = [{"name": i.product.title, "qty": i.quantity, "price": i.price_at_purchase} for i in o.items] if o.items else []
        res.append({
            "id": o.id, "total": o.total_amount, "status": o.status, 
            "date": o.created_at.strftime('%b %d, %Y'), "items": items
        })
    return jsonify(res), 200

@app.route('/api/user/account', methods=['DELETE'])
def delete_account():
    from models import User, Order
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    try:
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Optional: Cascade delete orders or just unbind them?
        # For privacy, we usually delete them.
        Order.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Account and all associated data deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    from models import User
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    try:
        user = User.query.filter_by(email=email, is_admin=True).first()
        if user and user.password_hash == password:
            # Email verification disabled globally
                
            return jsonify({
                "message": "Login successful",
                "admin": {
                    "id": user.id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "email": user.email
                },
                "token": "mock-admin-token-123"
            }), 200
    except Exception as e:
        return jsonify({
            "error": "Login Service Offline",
            "hint": "Check if MySQL is started in XAMPP",
            "details": str(e)
        }), 503
    
    return jsonify({"error": "Invalid admin credentials"}), 401

@app.route('/api/admin/hard-reset-db-kweli', methods=['GET'])
def hard_reset_db():
    try:
        db.drop_all()
        db.create_all()
        return jsonify({"message": "DATABASE WIPED! All accounts are deleted. You can now sign up fresh."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    from models import Product, Order
    total_products = Product.query.count()
    new_orders = Order.query.filter_by(status='Pending').count()
    return jsonify({
        "totalProducts": total_products,
        "newOrders": new_orders
    })

if __name__ == '__main__':
    with app.app_context():
        from models import Category, Product, Order, OrderItem, User 
        try:
            db.create_all()
            print("✅ Database tables verified/created successfully.")
        except Exception as e:
            print("❌ DATABASE ERROR: Could not connect to MySQL.")
            print(f"Error details: {e}")

    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    # THIS PART IS CRITICAL FOR RENDER: Initialize DB when Gunicorn starts the app
    import sys
    import traceback
    with app.app_context():
        try:
            from models import Category, Product, Order, OrderItem, User 
            db.create_all()
            print("🚀 Database connected and tables created!", file=sys.stderr)
            sys.stderr.flush()
        except Exception as e:
            print("❌ FATAL DB ERROR DURING STARTUP:", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            sys.stderr.flush()
