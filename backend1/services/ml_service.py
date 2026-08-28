from schemas.ml import (
    CropRecommendationRequest, CropRecommendationResponse,
    ProductionPredictionRequest, ProductionPredictionResponse
)
from services.crop_recommendation_service import recommend_crop as run_crop_recommendation
from services.yield_prediction_service import predict_yield_and_production

def recommend_crop(data: CropRecommendationRequest) -> CropRecommendationResponse:
    """
    Executes the trained Odisha Crop Recommendation ML Pipeline (XGBoost / Random Forest)
    using soil parameters, GPS location / Odisha District, and real-time Weatherstack data.
    """
    result = run_crop_recommendation(
        N=data.N,
        P=data.P,
        K=data.K,
        ph=data.ph,
        district=data.district,
        latitude=data.latitude,
        longitude=data.longitude,
        rainfall=data.rainfall,
        temperature=data.temperature,
        humidity=data.humidity,
        season=data.season,
        top_k=data.top_k or 3
    )
    
    return CropRecommendationResponse(
        recommended_crop=result['recommended_crop'],
        confidence=result['confidence'],
        top_recommendations=result['top_recommendations'],
        input_summary=result['input_summary']
    )

def predict_production(data: ProductionPredictionRequest) -> ProductionPredictionResponse:
    """
    Executes the trained Yield & Production Prediction Model.
    """
    res = predict_yield_and_production(
        crop=data.crop,
        district=data.district,
        area_ha=data.area,
        season=data.season or 'Kharif',
        rainfall_mm=data.rainfall or 1100.0
    )
    
    return ProductionPredictionResponse(
        expected_production_tonnes=res['predicted_total_production_tonnes']
    )
