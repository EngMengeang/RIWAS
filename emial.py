import requests
import json
import time

url_post = "https://menux-production.up.railway.app/api/v1/business"
url_delete_base = "https://menux-production.up.railway.app/api/v1/business/"

payload = json.dumps({
  "name": "elong_sl_reaksa",
  "business_type": "gaming_gear",
  "description": "nothing"
})

headers = {
  'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjRiZTUzOTZiLWUwNmMtNDk2NS1iYjFkLWIwNTFlMWZjMjI2MiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2p4aHJodmpsaHp2amNlZ2tocHBrLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIzYzQ3ZWJhOC1iYWRkLTRjZDgtYTQ0ZC1mN2I1MTRkYTkwNzkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxMTg1NDgyLCJpYXQiOjE3NzExODE4ODIsImVtYWlsIjoia3J1eWVyZGF2aWRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJdmVheVg5OUtpamtMUTc4R2tBZzZjeFNkLVdHZklfdURjc0puZGtfQkNMYi0zUWc9czk2LWMiLCJlbWFpbCI6ImtydXllcmRhdmlkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJEYXZpZCBLcnV5ZXIiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiRGF2aWQgS3J1eWVyIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSXZlYXlYOTlLaWprTFE3OEdrQWc2Y3hTZC1XR2ZJX3VEY3NKbmRrX0JDTGItM1FnPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMTQwMjU2MTY3MzMyMzY1MDE3NDMiLCJzdWIiOiIxMTQwMjU2MTY3MzMyMzY1MDE3NDMifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc3MTE4MTg4Mn1dLCJzZXNzaW9uX2lkIjoiYTE3ZjBiYzctZTA3OS00Nzc2LThlNjEtZjUyMjViOTM1NmE3IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.8wGKDXBoeagFJbrZUeWckkPktl-frxlSq7CDW1O04U0xD0cqPKektznzYWwHRAlUxWj0m2AJjcj2yL51Zn6r9w',
  'Content-Type': 'application/json'
}

cycle = 1
try:
    while True:
        print(f"\n{'='*50}")
        print(f"CYCLE {cycle} - Starting POST requests")
        print(f"{'='*50}")
        
        # Store IDs from POST requests
        created_ids = []
        
        # Send 5 POST requests
        for i in range(1, 6):
            try:
                response = requests.post(url_post, headers=headers, data=payload)
                print(f"POST {i}/5 - Status: {response.status_code}")
                
                # Try to extract ID from response
                if response.status_code in [200, 201]:
                    try:
                        response_data = response.json()
                        # Adjust this based on your API's response structure
                        business_id = response_data.get('id') or response_data.get('data', {}).get('id')
                        if business_id:
                            created_ids.append(business_id)
                            print(f"  Created ID: {business_id}")
                        else:
                            print(f"  Response: {response.text[:200]}")
                    except:
                        print(f"  Could not parse response")
                else:
                    print(f"  Error: {response.text[:200]}")
            except Exception as e:
                print(f"POST {i}/5 - Error: {str(e)}")
        
        print(f"\n{'='*50}")
        print(f"CYCLE {cycle} - Starting DELETE requests")
        print(f"{'='*50}")
        
        # Send 5 DELETE requests
        for i in range(1, 6):
            try:
                # Use created IDs if available, otherwise you'll need to provide them
                if i <= len(created_ids):
                    url_delete = url_delete_base + created_ids[i-1]
                else:
                    # If we don't have enough IDs, skip or use a default
                    print(f"DELETE {i}/5 - Skipped (no ID available)")
                    continue
                
                response = requests.delete(url_delete, headers=headers)
                print(f"DELETE {i}/5 - Status: {response.status_code} - ID: {created_ids[i-1]}")
                
                if response.status_code not in [200, 204]:
                    print(f"  Response: {response.text[:200]}")
            except Exception as e:
                print(f"DELETE {i}/5 - Error: {str(e)}")
        
        cycle += 1
        time.sleep(0.5)  # Small delay between cycles to avoid overwhelming the server
        
except KeyboardInterrupt:
    print(f"\n\n{'='*50}")
    print(f"Stopped by user after {cycle-1} complete cycles")
    print(f"{'='*50}")