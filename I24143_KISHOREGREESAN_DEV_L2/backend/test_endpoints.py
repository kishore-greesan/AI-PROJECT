#!/usr/bin/env python3
"""
Test script to verify endpoints work correctly
"""

import requests
import json

# Test data with correct password
test_users = [
    {"email": "admin@test.com", "password": "password"},
    {"email": "greesan@test.com", "password": "password"},
    {"email": "reviewer@test.com", "password": "password"}
]

def test_login_and_endpoints():
    for user_data in test_users:
        print(f"\n🔍 Testing with user: {user_data['email']}")
        
        # Try to login
        try:
            response = requests.post("http://localhost:8000/api/auth/login", json=user_data)
            print(f"Login response: {response.status_code}")
            
            if response.status_code == 200:
                token = response.json()["access_token"]
                print(f"✅ Login successful, got token: {token[:20]}...")
                
                # Test the employees endpoint
                headers = {"Authorization": f"Bearer {token}"}
                
                # Test employees endpoint
                employees_response = requests.get("http://localhost:8000/api/users/employees", headers=headers)
                print(f"Employees endpoint: {employees_response.status_code}")
                if employees_response.status_code == 200:
                    employees = employees_response.json()
                    print(f"✅ Employees found: {len(employees)}")
                    for emp in employees:
                        print(f"  - {emp['name']} ({emp['email']}) - Manager: {emp.get('manager_id')}")
                else:
                    print(f"❌ Employees endpoint failed: {employees_response.text}")
                
                # Test goals endpoint
                goals_response = requests.get("http://localhost:8000/api/goals/", headers=headers)
                print(f"Goals endpoint: {goals_response.status_code}")
                if goals_response.status_code == 200:
                    goals = goals_response.json()
                    print(f"✅ Goals found: {len(goals)}")
                    for goal in goals:
                        print(f"  - {goal['title']} (User: {goal.get('user_id')})")
                else:
                    print(f"❌ Goals endpoint failed: {goals_response.text}")
                
                # Test new goals/all endpoint
                all_goals_response = requests.get("http://localhost:8000/api/goals/all", headers=headers)
                print(f"Goals/all endpoint: {all_goals_response.status_code}")
                if all_goals_response.status_code == 200:
                    all_goals = all_goals_response.json()
                    print(f"✅ All Goals found: {len(all_goals)}")
                    for goal in all_goals:
                        print(f"  - {goal['title']} (User: {goal.get('user_id')})")
                else:
                    print(f"❌ Goals/all endpoint failed: {all_goals_response.text}")
                
            else:
                print(f"❌ Login failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_login_and_endpoints() 