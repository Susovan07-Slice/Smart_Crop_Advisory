from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
from services.distress_scorer import calculate_distress_score
from services.advisory_engine import generate_advisory
from services.sms_service import send_sms

router = APIRouter()

@router.post("/farmers/", response_model=schemas.Farmer)
def create_farmer(farmer: schemas.FarmerCreate, db: Session = Depends(database.get_db)):
    db_farmer = models.Farmer(**farmer.dict())
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer

@router.get("/farmers/", response_model=List[schemas.Farmer])
def get_farmers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    farmers = db.query(models.Farmer).offset(skip).limit(limit).all()
    return farmers

@router.post("/farmers/{farmer_id}/records/", response_model=schemas.FarmerRecord)
def create_record(farmer_id: int, record: schemas.FarmerRecordCreate, db: Session = Depends(database.get_db)):
    db_farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    distress = calculate_distress_score(
        record.rainfall_deviation_percent, 
        record.mandi_price_drop_percent, 
        db_farmer.days_to_loan_due
    )
    
    db_record = models.FarmerRecord(
        **record.dict(),
        farmer_id=farmer_id,
        distress_score=distress
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/advisory/")
def get_advisory(request: schemas.AdvisoryRequest):
    advice = generate_advisory(
        crop=request.crop,
        soil_type=request.soil_type,
        rainfall_dev=request.rainfall_deviation_percent,
        language=request.language
    )
    return {"advisory": advice}

@router.get("/dashboard-data/")
def get_dashboard_data(db: Session = Depends(database.get_db)):
    farmers = db.query(models.Farmer).all()
    
    high_risk = []
    for f in farmers:
        if f.records:
            latest_record = f.records[-1]
            if latest_record.distress_score > 60:
                high_risk.append({
                    "farmer_id": f.id,
                    "name": f.name,
                    "phone": f.phone,
                    "district": f.district,
                    "score": latest_record.distress_score
                })
    
    return {
        "total_farmers": len(farmers),
        "high_risk_count": len(high_risk),
        "high_risk_farmers": sorted(high_risk, key=lambda x: x["score"], reverse=True)
    }

@router.post("/alert/{farmer_id}")
def send_alert(farmer_id: int, db: Session = Depends(database.get_db)):
    db_farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    message = "SmartCrop Alert: You have been identified as high distress risk. An agricultural officer will contact you shortly."
    send_sms(db_farmer.phone, message, role="farmer")
    
    return {"status": "Alert sent successfully"}
