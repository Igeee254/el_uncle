import smtplib
import sys
from email.mime.text import MIMEText

def test_smtp():
    gmail_user = 'amstrongmutethia@gmail.com'
    gmail_password = 'elfz ayzb lxld pukg'

    print(f"DEBUG: Starting SMTP test for {gmail_user}...")
    sys.stdout.flush()
    
    try:
        print("DEBUG: Connecting to smtp.gmail.com:587...")
        sys.stdout.flush()
        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=15)
        
        print("DEBUG: Starting TLS...")
        sys.stdout.flush()
        server.starttls()
        
        print(f"DEBUG: Attempting login for {gmail_user}...")
        sys.stdout.flush()
        server.login(gmail_user, gmail_password)
        
        print("DEBUG: Creating message...")
        sys.stdout.flush()
        msg = MIMEText("This is a diagnostic email from KweliStoreKenya.")
        msg['Subject'] = "KweliStoreKenya SMTP Test"
        msg['From'] = gmail_user
        msg['To'] = gmail_user
        
        print("DEBUG: Sending message...")
        sys.stdout.flush()
        server.send_message(msg)
        
        print("DEBUG: Quitting server...")
        sys.stdout.flush()
        server.quit()
        print("✅ SMTP Success! Email sent to yourself.")
    except smtplib.SMTPAuthenticationError:
        print("❌ SMTP Error: Authentication Failed. (Incorrect password or App Password required)")
    except Exception as e:
        print(f"❌ SMTP Error: {type(e).__name__}: {e}")
    finally:
        sys.stdout.flush()

if __name__ == "__main__":
    test_smtp()
