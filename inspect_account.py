import psycopg2
db_url = "postgresql://el_uncle_db_user:rx8c6W3NXYV8pgtPQX2d6oLz2FnrL+A0adng_d7nt20i8aa2s72aflp6a_a_oregon_db@dpg-cng8p1ol7l4s73fsv030-a.oregon-postgres.render.com/el_uncle_db?sslmode=require"
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    # Look for your admin account
    cur.execute("SELECT id, username, email, is_admin, is_verified FROM users WHERE email = 'amstrongmutethia@gmail.com';")
    user = cur.fetchone()
    if user:
        print("--- ADMIN ACCOUNT FOUND ---")
        print(f"ID: {user[0]}")
        print(f"Username: {user[1]}")
        print(f"Email in DB: '{user[2]}'")
        print(f"Is Admin: {user[3]}")
        print(f"Is Verified: {user[4]}")
        print("---------------------------")
    else:
        print("? ERROR: No account found with that email. Are you sure you used this exact email to sign up?")
    cur.close()
    conn.close()
except Exception as e:
    print(f"? DATABASE ERROR: {e}")
