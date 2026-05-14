import requests

url = "https://el-uncle.onrender.com/api/admin/users"
params = {"email": "amstrongmutethia@gmail.com"} # Assuming this is the super admin email from app.py

try:
    response = requests.get(url, params=params)
    if response.status_code == 200:
        users = response.json()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"ID: {u['id']} | Name: {u['full_name']} | Email: {u['email']} | Admin: {u['is_admin']}")
            
        with open('user_list.txt', 'w', encoding='utf-8') as f:
            f.write(f"Total Users: {len(users)}\n\n")
            for u in users:
                f.write(f"ID: {u['id']} | Name: {u.get('full_name', 'N/A')} | Email: {u['email']} | Admin: {u['is_admin']}\n")
    else:
        print(f"Failed to fetch users: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
