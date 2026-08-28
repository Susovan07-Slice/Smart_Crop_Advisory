import requests

api_key = '5a34408e122db6b3df181c1376a69e33'
url = f'http://api.weatherstack.com/current?access_key={api_key}&query=Cuttack'
print("Sending request...", flush=True)
try:
    res = requests.get(url, timeout=5).json()
    print("Response received:", flush=True)
    print(res, flush=True)
except Exception as e:
    print("Error:", e, flush=True)
