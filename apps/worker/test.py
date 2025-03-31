import requests
import os

# URL of your processor API
url = "http://localhost:8000/process-interview"

# Assuming your video is in the same directory
video_path = os.path.join(os.path.dirname(__file__), "interview4.webm")

# Sample metadata
payload = {
    "interviewId": "abc123",
    "video_url": video_path,
    "timestamps": [
        {
            "questionId": "q123",
            "start": 0.0,
            "end": 25000.0
        },
        {
            "questionId": "q124",
            "start": 35000.0,
            "end": 40000.0
        }
    ],
    "questions": {
        "q123": "Tell me about yourself.",
        "q124": "Why do you want to work here?"
    },
    "callback_url": None  # Optional, you can remove this
}

# Make the request
response = requests.post(url, json=payload)

# Print response
print(f"Status Code: {response.status_code}")
print(response.json())
