import requests
from core.config import settings
from typing import Dict, Any

def get_current_weather(district: str) -> Dict[str, Any]:
    """
    Fetch weather using an API like Weatherstack.
    Using mock data if API key is not set.
    """
    if not settings.WEATHERSTACK_API_KEY or settings.WEATHERSTACK_API_KEY == "your_weatherstack_api_key":
        # Mock Response
        return {
            "location": district,
            "temperature": 28,
            "humidity": 75,
            "rainfall_mm": 12.5,
            "condition": "Partly Cloudy"
        }
        
    url = f"http://api.weatherstack.com/current?access_key={settings.WEATHERSTACK_API_KEY}&query={district}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Parse data according to actual Weatherstack format
        return {
            "location": data.get("location", {}).get("name", district),
            "temperature": data.get("current", {}).get("temperature", 0),
            "humidity": data.get("current", {}).get("humidity", 0),
            "condition": data.get("current", {}).get("weather_descriptions", [""])[0],
            # Weatherstack doesn't always provide rainfall mm directly in current, but this is an example
            "rainfall_mm": data.get("current", {}).get("precip", 0.0) 
        }
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return {"error": "Could not fetch weather data."}

def get_market_price(crop: str, district: str) -> Dict[str, Any]:
    """
    Fetch market price from CSV-based price forecast service.
    Falls back to static estimates if forecast service fails.
    """
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
