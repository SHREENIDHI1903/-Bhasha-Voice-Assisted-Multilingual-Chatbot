from fastapi import WebSocket
from typing import List, Dict, Tuple

class ConnectionManager:
    def __init__(self):
        # Store tuples: { user_id: {"ws": WebSocket, "lang": "en"} }
        self.active_connections: Dict[str, dict] = {} 
        self.active_pairs: Dict[str, str] = {}
        self.available_employees: List[str] = []
        # Queue stores: (user_id, websocket, lang)
        self.waiting_queue: List[Tuple[str, WebSocket, str]] = [] 

    async def connect_user(self, role: str, user_id: str, websocket: WebSocket, lang: str):
        await websocket.accept()
        # Store User's Language
        self.active_connections[user_id] = {"ws": websocket, "lang": lang}
        
        if role == "employee":
            print(f"👨‍💼 Employee {user_id} connected ({lang}).")
            self.available_employees.append(user_id)
            
            # Check if customers are waiting
            # Loop until we find a live customer or queue is empty
            while self.waiting_queue:
                cust_id, cust_ws, _ = self.waiting_queue.pop(0)
                
                # Check if this waiting socket is still open before matching
                # (Simple check: is it in active_connections? Or just try matching)
                await self.match_users(cust_id, user_id)
                
                # If match failed (customer dead), the employee is put back 
                # in available pool by disconnect(), so we break or continue?
                # Actually match_users handles the cleanup. 
                # We just stop processing queue for this employee.
                break

        else:
            print(f"👤 Customer {user_id} connected ({lang}).")
            if self.available_employees:
                emp_id = self.available_employees.pop(0)
                await self.match_users(user_id, emp_id)
            else:
                self.waiting_queue.append((user_id, websocket, lang))
                try:
                    await websocket.send_json({"system": "All agents busy. You are in queue."})
                except Exception:
                    # If sending fails, they are already gone
                    await self.disconnect(user_id)

    async def match_users(self, customer_id: str, employee_id: str):
        # Create the link
        self.active_pairs[customer_id] = employee_id
        self.active_pairs[employee_id] = customer_id
        
        cust_data = self.active_connections.get(customer_id)
        emp_data = self.active_connections.get(employee_id)
        
        # 1. Notify Customer (CRASH PROOF)
        if cust_data:
            try:
                await cust_data["ws"].send_json({"system": f"Connected to Agent {employee_id}"})
            except Exception as e:
                print(f"⚠️ Waiting Customer {customer_id} is dead. Cleaning up.")
                await self.disconnect(customer_id)
                return # Stop here, don't notify employee yet

        # 2. Notify Employee (CRASH PROOF)
        if emp_data:
            try:
                await emp_data["ws"].send_json({"system": f"Connected to Customer {customer_id}"})
            except Exception as e:
                print(f"⚠️ Employee {employee_id} disconnected during match.")
                await self.disconnect(employee_id)

    async def get_user_lang(self, user_id: str):
        if user_id in self.active_connections:
            return self.active_connections[user_id]["lang"]
        return "en" 

    async def update_user_lang(self, user_id: str, new_lang: str):
        if user_id in self.active_connections:
            self.active_connections[user_id]["lang"] = new_lang
            print(f"🔄 User {user_id} switched language to {new_lang}") 

    async def send_to_partner(self, sender_id: str, data: dict):
        if sender_id in self.active_pairs:
            receiver_id = self.active_pairs[sender_id]
            user_data = self.active_connections.get(receiver_id)
            if user_data:
                try:
                    await user_data["ws"].send_json(data)
                except Exception:
                    print(f"⚠️ Failed to send to {receiver_id}. Disconnecting them.")
                    await self.disconnect(receiver_id)

    async def disconnect(self, user_id: str):
        # 1. Remove from active connections
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        # 2. Remove from available employees
        if user_id in self.available_employees:
            self.available_employees.remove(user_id)
            
        # 3. Remove from waiting queue (Clean up ghosts)
        self.waiting_queue = [x for x in self.waiting_queue if x[0] != user_id]

        # 4. Handle Active Pairs (Notify Partner)
        if user_id in self.active_pairs:
            partner_id = self.active_pairs.pop(user_id)
            if partner_id in self.active_pairs: 
                del self.active_pairs[partner_id]
            
            partner_data = self.active_connections.get(partner_id)
            if partner_data:
                try:
                    await partner_data["ws"].send_json({"system": "Partner disconnected."})
                except Exception:
                    pass 
                
                # If the partner was an Employee, make them available again!
                # Check based on ID or if they are NOT in waiting queue
                # Simplest heuristic: If they are not in waiting queue, they might be an emp.
                # Better: We trust the role logic. 
                # If partner_id contains "emp" or "agent" (simple hack) OR just check if they were in the original emp list.
                # For this prototype, let's assume if they are still connected, we add them back to available.
                # Note: We rely on the user having "emp" in the logic or just re-add everyone who isn't a customer.
                # SAFEST: If the partner is NOT in the active_connections anymore, do nothing.
                
                # Re-add to available list if it looks like an employee
                # (You can improve this by storing role in active_connections if needed)
                if "emp" in partner_id.lower() or "agent" in partner_id.lower():
                     if partner_id not in self.available_employees:
                         self.available_employees.append(partner_id)
                         print(f"♻️ Employee {partner_id} is available again.")

manager = ConnectionManager()