import sys
from app import app, db
from models import Product, Category

def clean_shop():
    with app.app_context():
        print("🧹 Cleaning marketplace...", flush=True)
        
        # Get all products ordered by ID desc
        products = Product.query.order_by(Product.id.desc()).all()
        print(f"DEBUG: Found {len(products)} total products.", flush=True)
        
        if len(products) <= 3:
            print("✅ Already 3 or fewer items. No deletion needed.", flush=True)
            return

        # Items to keep
        to_keep = products[:3]
        keep_ids = [p.id for p in to_keep]
        print(f"DEBUG: Keeping IDs: {keep_ids}", flush=True)
        
        # Items to delete
        to_delete = products[3:]
        delete_count = len(to_delete)
        
        for p in to_delete:
            print(f"DEBUG: Deleting product {p.id}: {p.title}", flush=True)
            db.session.delete(p)
            
        db.session.commit()
        print(f"✅ Deleted {delete_count} old items. Kept 3 latest items.", flush=True)
        
        # Cleanup empty categories
        all_cats = Category.query.all()
        for cat in all_cats:
            if not cat.products:
                print(f"🗑️ Removing empty category: {cat.name}", flush=True)
                db.session.delete(cat)
        
        db.session.commit()
        print("✅ Category cleanup complete.", flush=True)

if __name__ == "__main__":
    clean_shop()
