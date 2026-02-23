import os
import requests
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Load API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Please set GEMINI_API_KEY in your environment variables.")

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# The message you want to send
message = "Hello Gemini, can u correct this to polite text for conversation: 'My name is Pov Yanghai, i love cambodia so much'"

# Request payload
payload = {
    "contents": [
        {
            "parts": [
                {"text": message}
            ]
        }
    ]
}

try:
    response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload)
    if response.status_code == 429:
        print("🚨 Rate limit exceeded. Please check your API quota in Google Cloud Console.")
        exit(1)  # exit gracefully
    response.raise_for_status()  # Raise for other HTTP errors

    data = response.json()
    try:
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        print("Gemini Reply:")
        print(reply)
    except (KeyError, IndexError):
        print("Unexpected response structure:", data)

except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
