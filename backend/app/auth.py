from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import json
import os
import secrets

router = APIRouter()
USERS_FILE = "users.json"

# Models
class UserRegister(BaseModel):
    username: str
    password: str # In production, hash this!

class UserLogin(BaseModel):
    username: str
    password: str

# Helpers
def load_users():
    if not os.path.exists(USERS_FILE):
        return {"admin": {"password": "admin", "role": "admin", "approved": True}}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

# Endpoints
@router.post("/register")
async def register(user: UserRegister):
    users = load_users()
    if user.username in users:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Defaults: Role=employee, Approved=False (Must be approved by admin)
    users[user.username] = {
        "password": user.password, 
        "role": "employee", 
        "approved": False
    }
    save_users(users)
    return {"message": "Registration successful. Please wait for Admin approval."}

@router.post("/login")
async def login(user: UserLogin):
    users = load_users()
    u = users.get(user.username)
    
    if not u or u["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not u.get("approved"):
        raise HTTPException(status_code=403, detail="Account pending approval by Admin")
        
    return {
        "username": user.username,
        "role": u["role"],
        "token": secrets.token_hex(16) # Dummy token
    }

@router.get("/users")
async def get_users():
    users = load_users()
    # Return list of {username, role, approved} for UI
    return [
        {"username": k, "role": v["role"], "approved": v.get("approved", False)}
        for k, v in users.items()
        if v["role"] != "admin"
    ]

@router.post("/approve/{username}")
async def approve_user(username: str):
    users = load_users()
    if username not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    users[username]["approved"] = True
    save_users(users)
    return {"message": f"User {username} approved"}

@router.post("/block/{username}")
async def block_user(username: str):
    users = load_users()
    if username not in users:
        raise HTTPException(status_code=404, detail="User not found")
    
    users[username]["approved"] = False
    save_users(users)
    return {"message": f"User {username} blocked"}
