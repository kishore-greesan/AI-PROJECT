#!/usr/bin/env python3
"""
Test script for the employees endpoint
"""

import requests
import json

# Test login
login_data = {
    "email": "admin@test.com",
    "password": "Admin123!"
}

# Try to login
response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
print("Login response:", response.status_code)
print("Login response body:", response.text)

if response.status_code == 200:
    token = response.json()["access_token"]
    print(f"Got token: {token[:20]}...")
    
    # Test the employees endpoint
    headers = {"Authorization": f"Bearer {token}"}
    employees_response = requests.get("http://localhost:8000/api/users/employees", headers=headers)
    print("Employees response:", employees_response.status_code)
    print("Employees response body:", employees_response.text)
else:
    print("Failed to login") 