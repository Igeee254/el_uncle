import pymysql

def ensure_db():
    print("🔍 Diagnostic: Checking MySQL Connection...")
    try:
        # Connect to MySQL WITHOUT specifying a database first
        connection = pymysql.connect(
            host='127.0.0.1',
            user='root',
            password=''
        )
        print("✅ Connection to MySQL Successful!")
        
        with connection.cursor() as cursor:
            # Check if el_uncle_db exists
            cursor.execute("SHOW DATABASES LIKE 'el_uncle_db'")
            result = cursor.fetchone()
            
            if result:
                print("✅ Database 'el_uncle_db' already exists.")
            else:
                print("🚧 Database 'el_uncle_db' missing. Creating it now...")
                cursor.execute("CREATE DATABASE el_uncle_db")
                print("🎉 Database 'el_uncle_db' created successfully!")
                
        connection.close()
        print("\n🚀 YOU ARE READY! Now run: python app.py")
        
    except Exception as e:
        print("\n❌ FAILED TO CONNECT TO MYSQL.")
        print("👉 Make sure XAMPP Control Panel is OPEN.")
        print("👉 Make sure 'Start' is clicked next to MySQL.")
        print(f"\nError details: {e}")

if __name__ == '__main__':
    ensure_db()
