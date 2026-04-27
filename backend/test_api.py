import requests
import json

def test_api():
    print("🔍 Testing /api/products...")
    try:
        response = requests.get("http://127.0.0.1:5000/api/products")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Successfully fetched {len(products)} products.")
            if products:
                print("First product sample:")
                print(json.dumps(products[0], indent=2))
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Could not reach backend: {e}")

if __name__ == '__main__':
    test_api()
