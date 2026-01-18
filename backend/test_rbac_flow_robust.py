import requests
import time
import sys

BASE_URL = "http://localhost:8000/auth"
MAX_RETRIES = 30
RETRY_DELAY = 2

def wait_for_backend():
    print(f"Waiting for backend at {BASE_URL}...")
    for i in range(MAX_RETRIES):
        try:
            # Check root or docs or just a connection
            requests.get("http://localhost:8000/docs", timeout=1)
            print("Backend is UP!")
            return True
        except requests.exceptions.RequestException:
            print(f"Backend not ready yet... ({i+1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)
    return False

def test_rbac_flow():
    if not wait_for_backend():
        print("X Failed to connect to backend after multiple retries.")
        sys.exit(1)

    username = f"test_{int(time.time())}"
    password = "password123"

    print(f"--- Testing RBAC for user: {username} ---")

    # 1. Register
    print("[1] Registering...")
    resp = requests.post(f"{BASE_URL}/register", json={"username": username, "password": password})
    if resp.status_code == 200:
        print("    V Registration Successful")
    else:
        print(f"    X Registration Failed: {resp.text}")
        sys.exit(1)

    # 2. Try Login (Should Fail)
    print("[2] Attempting Login (Expecting Failure)...")
    resp = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 403:
        print("    V Login Failed as expected (Pending Approval)")
    else:
        print(f"    X Unexpected Status: {resp.status_code} (Should be 403)")
        sys.exit(1)

    # 3. Check Pending List
    print("[3] Checking Pending List...")
    resp = requests.get(f"{BASE_URL}/pending")
    pending_list = resp.json()
    if username in pending_list:
        print("    V User found in pending list")
    else:
        print(f"    X User NOT found in pending list: {pending_list}")
        sys.exit(1)

    # 4. Approve User
    print("[4] Approving User...")
    resp = requests.post(f"{BASE_URL}/approve/{username}")
    if resp.status_code == 200:
        print("    V Approval Successful")
    else:
        print(f"    X Approval Failed: {resp.text}")
        sys.exit(1)

    # 5. Try Login Again (Should Succeed)
    print("[5] Attempting Login (Expecting Success)...")
    resp = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 200:
        token = resp.json().get("token")
        print(f"    V Login Successful! Token: {token}")
    else:
        print(f"    X Login Failed: {resp.text}")
        sys.exit(1)

if __name__ == "__main__":
    test_rbac_flow()
