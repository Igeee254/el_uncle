import requests
import base64
import os
import datetime

# Credentials
consumer_key = "KSJuKaX5MO3Vmb3dsT8MsnDlryfGtmyfMgkSWJjH9c0rgtj5"
consumer_secret = "cnVWAbtJcppA857nAtEAaVmWHFmgaSFe3jB80Gz8suilKDbziSm0ffzETy6ZRFoH"
shortcode = "174379"
passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
phone = "254746860965"

# 1. Get OAuth Token
print("Generating OAuth Token...")
auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
auth_response = requests.get(auth_url, auth=(consumer_key, consumer_secret))

if not auth_response.ok:
    print(f"Failed to get token: {auth_response.text}")
    exit(1)

access_token = auth_response.json()["access_token"]
print("Token acquired.")

# 2. Trigger STK Push
print(f"Triggering STK Push for {phone}...")
stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
password_str = f"{shortcode}{passkey}{timestamp}"
password = base64.b64encode(password_str.encode('utf-8')).decode('utf-8')

payload = {
    "BusinessShortCode": shortcode,
    "Password": password,
    "Timestamp": timestamp,
    "TransactionType": "CustomerPayBillOnline",
    "Amount": 1,
    "PartyA": phone,
    "PartyB": shortcode,
    "PhoneNumber": phone,
    "CallBackURL": "https://el-uncle.onrender.com/api/mpesa/callback", # doesn't exist yet but valid URL
    "AccountReference": "KweliStore",
    "TransactionDesc": "Test Payment"
}

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

response = requests.post(stk_url, json=payload, headers=headers)
with open('mpesa_log.txt', 'w', encoding='utf-8') as f:
    f.write(f"Response Status Code: {response.status_code}\n")
    f.write(f"Response Body: {response.json()}\n")

