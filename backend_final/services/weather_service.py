import requests
from core.config import settings
from typing import Dict, Any

def get_current_weather(district: str) -> Dict[str, Any]:
    if not settings.WEATHERSTACK_API_KEY or settings.WEATHERSTACK_API_KEY == "your_weatherstack_api_key":
        return {
            "location": district,
            "temperature": 28,
            "humidity": 75,
            "rainfall_mm": 12.5,
            "condition": "Partly Cloudy"
        }
        
    url = f"http://api.weatherstack.com/current?access_key={settings.WEATHERSTACK_API_KEY}&query={district}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        return {
            "location": data.get("location", {}).get("name", district),
            "temperature": data.get("current", {}).get("temperature", 28),
            "humidity": data.get("current", {}).get("humidity", 75),
            "condition": data.get("current", {}).get("weather_descriptions", ["Partly Cloudy"])[0],
            "rainfall_mm": data.get("current", {}).get("precip", 12.5) 
        }
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return {
            "location": district,
            "temperature": 28,
            "humidity": 75,
            "rainfall_mm": 12.5,
            "condition": "Partly Cloudy"
        }

get_weather_for_district = get_current_weather

def get_market_price(crop: str, district: str) -> Dict[str, Any]:
    try:
        from services.price_forecast_service import get_price_forecast
        forecast = get_price_forecast(crop, district)
        return {
            "crop": forecast["crop"],
            "district": district,
            "price_per_quintal": forecast["current_price_per_quintal"],
            "date": forecast["data_date"]
        }
    except Exception as e:
        print(f"Market price fallback: {e}")
        return {
            "crop": crop,
            "district": district,
            "price_per_quintal": 2200.0 if crop.lower() == "rice" else 3000.0,
            "date": "2024-08-26"
        }
