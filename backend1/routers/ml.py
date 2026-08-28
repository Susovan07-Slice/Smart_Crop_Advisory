from fastapi import APIRouter, HTTPException
from schemas.ml import (
    CropRecommendationRequest, CropRecommendationResponse,
    YieldPredictionRequest, YieldPredictionResponse,
    FullFarmAnalysisRequest, FullFarmAnalysisResponse,
    ProfitCalculationRequest, ProfitCalculationResponse,
    ProductionPredictionRequest, ProductionPredictionResponse,
    MarketPriceRequest, MarketPriceResponse,
    PriceForecastRequest, PriceForecastResponse
)
from services import ml_service, weather_service
from services.yield_prediction_service import predict_yield_and_production
from services.profit_calculator_service import calculate_farm_profit
from services.price_forecast_service import get_price_forecast
import json
import os

router = APIRouter()

PROFILES_PATH = os.path.join(os.path.dirname(__file__), '..', 'odisha_district_profiles.json')
district_profiles = {}
if os.path.exists(PROFILES_PATH):
    with open(PROFILES_PATH, 'r') as f:
        district_profiles = json.load(f)

@router.get("/district-profile/{district}")
def get_district_profile(district: str):
    if district in district_profiles:
        return district_profiles[district]
    for dname, data in district_profiles.items():
        if dname.lower() == district.lower():
            return data
    raise HTTPException(status_code=404, detail=f"District '{district}' not found.")

@router.post("/crop-recommendation", response_model=CropRecommendationResponse)
def get_crop_recommendation(request: CropRecommendationRequest):
    try:
        return ml_service.recommend_crop(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/yield-prediction", response_model=YieldPredictionResponse)
def get_yield_prediction(request: YieldPredictionRequest):
    try:
        res = predict_yield_and_production(
            crop=request.crop,
            district=request.district,
            area_ha=request.area_ha,
            season=request.season or "Kharif",
            nitrogen=request.nitrogen or 55.0,
            phosphorus=request.phosphorus or 32.0,
            potassium=request.potassium or 45.0,
            ph=request.ph or 6.4,
            rainfall_mm=request.rainfall_mm or 1100.0,
            temperature_c=request.temperature_c or 27.5,
            humidity=request.humidity or 75.0
        )
        return YieldPredictionResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profit-calculation", response_model=ProfitCalculationResponse)
def compute_profit(request: ProfitCalculationRequest):
    try:
        res = calculate_farm_profit(
            crop=request.crop,
            district=request.district,
            area_ha=request.area_ha,
            production_tonnes=request.production_tonnes,
            mandi_price_per_quintal=request.mandi_price_per_quintal
        )
        return ProfitCalculationResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/full-farm-analysis", response_model=FullFarmAnalysisResponse)
def run_full_farm_analysis(request: FullFarmAnalysisRequest):
    """
    Master Cascading AI Pipeline:
    1. Input: District / GPS Location + Season + Land Area
    2. Resolves Soil & Weather features from datasets + Weatherstack API
    3. Model 1 (Crop Recommendation): Predicts best suited crop
    4. Model 2 (Yield Predictor): Takes Model 1 output -> Predicts Yield (t/ha) & Total Production (tonnes)
    5. Model 3 (Market Price): Takes Model 1 output + District -> Predicts Mandi Price (₹/quintal)
    6. Step 4 (Profit Calculator): Takes Model 2 Production + Model 3 Price + Cultivation Cost Dataset -> Calculates Net Profit & ROI %
    """
    try:
        district_name = request.district or "Cuttack"
        season_name = request.season or "Kharif"
        area_ha = request.area_ha or 2.5

        profile = district_profiles.get(district_name, district_profiles.get("Cuttack", {}))
        soil_info = profile.get("soil", {"N": 56.6, "P": 31.7, "K": 42.8, "pH": 6.39})
        season_info = profile.get("seasons", {}).get(season_name, {"rainfall": 1150.0, "temperature": 27.5, "humidity": 76.0})

        # Fetch Live Weather
        w_data = weather_service.get_current_weather(district_name)
        live_temp = w_data.get("temperature", season_info["temperature"])
        live_hum = w_data.get("humidity", season_info["humidity"])
        live_rain = season_info["rainfall"]

        # STEP 1: Crop Recommendation Model
        rec_req = CropRecommendationRequest(
            N=soil_info["N"],
            P=soil_info["P"],
            K=soil_info["K"],
            ph=soil_info["pH"],
            district=district_name,
            latitude=request.latitude,
            longitude=request.longitude,
            temperature=live_temp,
            humidity=live_hum,
            rainfall=live_rain,
            season=season_name,
            top_k=3
        )
        rec_res = ml_service.recommend_crop(rec_req)
        best_crop = rec_res.recommended_crop

        # STEP 2: Yield & Production Predictor (Takes Model 1 Output as Input)
        yield_res_dict = predict_yield_and_production(
            crop=best_crop,
            district=district_name,
            area_ha=area_ha,
            season=season_name,
            nitrogen=soil_info["N"],
            phosphorus=soil_info["P"],
            potassium=soil_info["K"],
            ph=soil_info["pH"],
            rainfall_mm=live_rain,
            temperature_c=live_temp,
            humidity=live_hum
        )
        yield_res = YieldPredictionResponse(**yield_res_dict)

        # STEP 3: Market Price Query (Takes Model 1 Output + District as Input)
        price_info = weather_service.get_market_price(best_crop, district_name)
        price_per_quintal = price_info.get("price_per_quintal", 2500.0)

        # STEP 4: Profit Calculator (Takes Model 2 Production + Model 3 Price + Cost Dataset)
        profit_res = calculate_farm_profit(
            crop=best_crop,
            district=district_name,
            area_ha=area_ha,
            production_tonnes=yield_res.predicted_total_production_tonnes,
            mandi_price_per_quintal=price_per_quintal
        )

        # STEP 5: Price Forecast (15/30/90 day predictions)
        try:
            price_forecast_data = get_price_forecast(best_crop, district_name)
        except Exception:
            price_forecast_data = None

        return FullFarmAnalysisResponse(
            location_summary={
                "district": district_name,
                "season": season_name,
                "area_ha": area_ha,
                "area_acres": round(area_ha * 2.47, 1),
                "weather_source": w_data.get("condition", "Live Weatherstack Feed")
            },
            crop_recommendation=rec_res,
            yield_prediction=yield_res,
            market_price_summary={
                "crop": best_crop,
                "district": district_name,
                "mandi_price_per_quintal": price_per_quintal,
                "mandi_price_per_tonne": price_per_quintal * 10.0,
                "price_date": price_info.get("date", "2024-08-26")
            },
            profit_analysis=profit_res,
            price_forecast=price_forecast_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/production-prediction", response_model=ProductionPredictionResponse)
def get_production_prediction(request: ProductionPredictionRequest):
    try:
        return ml_service.predict_production(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/market-price", response_model=MarketPriceResponse)
def get_market_price(request: MarketPriceRequest):
    try:
        data = weather_service.get_market_price(request.crop, request.district)
        return MarketPriceResponse(
            crop=data["crop"],
            market=request.market or data["district"],
            current_price_per_quintal=data["price_per_quintal"],
            date=data["date"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/price-forecast", response_model=PriceForecastResponse)
def get_price_forecast_endpoint(request: PriceForecastRequest):
    """Get current price + 15/30/90 day price forecast with historical trend data."""
    try:
        result = get_price_forecast(request.crop, request.district)
        return PriceForecastResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
