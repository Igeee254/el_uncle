import psycopg2
db_url = "postgresql://el_uncle_db_user:rx8c6W3NXYV8pgtPQX2d6oLz2FnrL+A0adng_d7nt20i8aa2s72aflp6a_a_oregon_db@dpg-cng8p1ol7l4s73fsv030-a.oregon-postgres.render.com/el_uncle_db"
try:
    # Explicitly requesting SSL in the connection parameters
    conn = psycopg2.connect(db_url, sslmode='require')
    cur = conn.cursor()
    cur.execute("UPDATE users SET is_verified = TRUE WHERE email = 'amstrongmutethia@gmail.com';")
    if cur.rowcount > 0:
        conn.commit()
        print("? SUCCESS: Your LIVE account on Render is now verified!")
    else:
        print("? ERROR: Email not found. Did you sign up on the website today?")
    cur.close()
    conn.close()
except Exception as e:
    print(f"? DATABASE ERROR: {e}")
