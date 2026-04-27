import urllib.request
import json
import traceback

with open("test_log.txt", "w") as f:
    try:
        url = "http://192.168.1.186:5000/api/admin/signup"
        data = json.dumps({
            "username": "admin_test",
            "full_name": "Admin Test",
            "email": "testadmin@test.com",
            "password": "password123"
        }).encode('utf-8')

        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            f.write("Success: " + str(result))
    except urllib.error.HTTPError as e:
        error_data = e.read().decode()
        f.write(f"HTTP Error {e.code}: {error_data}")
    except Exception as e:
        f.write("Other Error: " + str(e) + "\n" + traceback.format_exc())
