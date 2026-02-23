import requests
import json

url = "https://menux-production.up.railway.app/api/v1/business"

payload = json.dumps({
  "name": "elong_sl_reaksa",
  "business_type": "gaming_gear",
  "description": "nothing"
})
headers = {
  'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjRiZTUzOTZiLWUwNmMtNDk2NS1iYjFkLWIwNTFlMWZjMjI2MiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2p4aHJodmpsaHp2amNlZ2tocHBrLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIzYzQ3ZWJhOC1iYWRkLTRjZDgtYTQ0ZC1mN2I1MTRkYTkwNzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxMTgxOTczLCJpYXQiOjE3NzExNzgzNzMsImVtYWlsIjoia3J1eWVyZGF2aWRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJdmVheVg5OUtpamtMUTc4R2tBZzZjeFNkLVdHZklfdURjc0puZGtfQkNMYi0zUWc9czk2LWMiLCJlbWFpbCI6ImtydXllcmRhdmlkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJEYXZpZCBLcnV5ZXIiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiRGF2aWQgS3J1eWVyIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSXZlYXlYOTlLaWprTFE3OEdrQWc2Y3hTZC1XR2ZJX3VEY3NKbmRrX0JDTGItM1FnPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMTQwMjU2MTY3MzMyMzY1MDE3NDMiLCJzdWIiOiIxMTQwMjU2MTY3MzMyMzY1MDE3NDMifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc3MTE3ODM3M31dLCJzZXNzaW9uX2lkIjoiZmUyZjA2ZGEtYmVkMi00NjFiLWE2ZjItMTU0ZDAzZmIxODEwIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.28w9o9f9V49BN7UAjjNHTDMphtv-a9JtjFHyvK0tI26lLn5GR6xK4ZNVQ_v2W1vPqzQhgVTQvqbDoJHQ-j15Ow',
  'Content-Type': 'application/json'
}

# Loop 1000 times
for i in range(1, 1001):
    response = requests.request("POST", url, headers=headers, data=payload)
    print(f"Request {i}/1000 - Status: {response.status_code} - Response: {response.text}")
    if i % 100 == 0:  # Progress update every 100 requests
        print(f"--- Progress: {i}/1000 completed ---")

print("All 1000 requests completed!")
