import requests
import time

BASE_URL = "http://localhost:8000/auth"

def test_rbac_flow():
    username = f"test_emp_{int(time.time())}"
    password = "password123"

    print(f"--- Testing RBAC for user: {username} ---")

    # 1. Register
    print("[1] Registering...")
    resp = requests.post(f"{BASE_URL}/register", json={"username": username, "password": password})
    if resp.status_code == 200:
        print("    ✅ Registration Successful")
    else:
        print(f"    ❌ Registration Failed: {resp.text}")
        return

    # 2. Try Login (Should Fail)
    print("[2] Attempting Login (Expecting Failure)...")
    resp = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 403:
        print("    ✅ Login Failed as expected (Pending Approval)")
    else:
        print(f"    ❌ Unexpected Status: {resp.status_code} (Should be 403)")
        return

    # 3. Check Pending List
    print("[3] Checking Pending List...")
    resp = requests.get(f"{BASE_URL}/pending")
    pending_list = resp.json()
    if username in pending_list:
        print("    ✅ User found in pending list")
    else:
        print(f"    ❌ User NOT found in pending list: {pending_list}")
        return

    # 4. Approve User
    print("[4] Approving User...")
    resp = requests.post(f"{BASE_URL}/approve/{username}")
    if resp.status_code == 200:
        print("    ✅ Approval Successful")
    else:
        print(f"    ❌ Approval Failed: {resp.text}")
        return

    # 5. Try Login Again (Should Succeed)
    print("[5] Attempting Login (Expecting Success)...")
    resp = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 200:
        token = resp.json().get("token")
        print(f"    ✅ Login Successful! Token: {token}")
    else:
        print(f"    ❌ Login Failed: {resp.text}")

if __name__ == "__main__":
    try:
        test_rbac_flow()
    except requests.exceptions.ConnectionError:
        print("X Could not connect to backend. Is it running on port 8000?")
