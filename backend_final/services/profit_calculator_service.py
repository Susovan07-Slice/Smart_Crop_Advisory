import os
import pandas as pd
from typing import Dict, Any

COST_CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'Odisha_Synthetic_Cost_of_Cultivation_District_Crop.csv')

cost_df = None
if os.path.exists(COST_CSV_PATH):
    try:
        cost_df = pd.read_csv(COST_CSV_PATH)
        print("Loaded Cost of Cultivation Dataset (Odisha)")
    except Exception as e:
        print(f"Error loading cost dataset: {e}")

DEFAULT_COST_PER_HA = {
    'Potato': 125000.0,
    'Sugarcane': 140000.0,
    'Rice': 75000.0,
    'Maize': 65000.0,
    'Wheat': 60000.0,
    'Groundnut': 60000.0,
    'Jute': 55000.0,
    'Rapeseed &Mustard': 52000.0,
    'Ragi': 48000.0,
    'Urad': 42000.0,
    'Moong(Green Gram)': 41000.0,
    'Sesamum': 38000.0,
    'Horse Gram': 35000.0
}

def get_cost_per_hectare(crop: str, district: str) -> float:
    global cost_df
    if cost_df is None and os.path.exists(COST_CSV_PATH):
        cost_df = pd.read_csv(COST_CSV_PATH)

    if cost_df is not None:
        try:
            match = cost_df[
                (cost_df['District'].str.lower() == district.lower()) &
                (cost_df['Crop'].str.lower() == crop.lower())
            ]
            if not match.empty:
                return float(match.iloc[0]['Cost_of_Cultivation_INR_per_ha'])
            
            crop_match = cost_df[cost_df['Crop'].str.lower() == crop.lower()]
            if not crop_match.empty:
                return float(crop_match['Cost_of_Cultivation_INR_per_ha'].mean())
        except Exception as e:
            print(f"Cost lookup error: {e}")

    return DEFAULT_COST_PER_HA.get(crop, 55000.0)

def calculate_farm_profit(
    crop: str,
    district: str,
    area_ha: float,
    production_tonnes: float,
    mandi_price_per_quintal: float = None
) -> Dict[str, Any]:
    if mandi_price_per_quintal is None:
        from services.weather_service import get_market_price
        p_info = get_market_price(crop, district)
        mandi_price_per_quintal = p_info.get("price_per_quintal", 2300.0)

    cost_per_ha = get_cost_per_hectare(crop, district)
    total_cost_inr = round(area_ha * cost_per_ha, 2)

    price_per_tonne = mandi_price_per_quintal * 10.0
    total_revenue_inr = round(production_tonnes * price_per_tonne, 2)

    net_profit_inr = round(total_revenue_inr - total_cost_inr, 2)
    
    roi_percent = round((net_profit_inr / total_cost_inr) * 100.0, 2) if total_cost_inr > 0 else 0.0

    return {
        'crop': crop,
        'district': district,
        'area_ha': area_ha,
        'cost_per_ha_inr': cost_per_ha,
        'total_cost_inr': total_cost_inr,
        'mandi_price_per_quintal': mandi_price_per_quintal,
        'mandi_price_per_tonne': price_per_tonne,
        'total_revenue_inr': total_revenue_inr,
        'net_profit_inr': net_profit_inr,
        'roi_percent': roi_percent,
        'formatted_cost': f"₹{total_cost_inr:,.2f}",
        'formatted_revenue': f"₹{total_revenue_inr:,.2f}",
        'formatted_profit': f"₹{net_profit_inr:,.2f}",
        'status': 'Profitable' if net_profit_inr >= 0 else 'Loss'
    }

calculate_cost_revenue_profit = calculate_farm_profit
