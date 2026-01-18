import requests
import time
import sys

BASE_URL = "http://localhost:8000/auth"

def test_blocking():
    # 1. Register a user
    username = f"block_test_{int(time.time())}"
    password = "password123"
    print(f"--- Testing Block Flow for: {username} ---")

    requests.post(f"{BASE_URL}/register", json={"username": username, "password": password})
    
    # 2. Approve User
    print("[1] Approving User...")
    requests.post(f"{BASE_URL}/approve/{username}")
    
    # 3. Login (Should Succeed)
    print("[2] Login (Expect Success)...")
    resp = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 200:
        print("    V Login Successful")
    else:
        print(f"    X Login Failed Unexpectedly: {resp.text}")
        sys.exit(1)

    # 4. Block User
    print("[3] Blocking User...")
    resp = requests.post(f"{BASE_URL}/block/{username}")
    if resp.status_code == 200:
        print("    V Block Successful")
    else:
        print(f"    X Block Failed: {resp.text}")
        sys.exit(1)

    # 5. Login (Should Fail)
    print("[4] Login (Expect Failure)...")
    resp = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 403:
        print("    V Login Blocked Successfully (403)")
    else:
        print(f"    X User could still login! Status: {resp.status_code}")
        sys.exit(1)

if __name__ == "__main__":
    test_blocking()
