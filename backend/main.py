from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database
from services.distress_scorer import calculate_distress_score
from services.advisory_engine import generate_advisory

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Smart Crop Advisory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Crop Advisory API"}

@app.post("/api/farmers/", response_model=schemas.Farmer)
def create_farmer(farmer: schemas.FarmerCreate, db: Session = Depends(database.get_db)):
    db_farmer = models.Farmer(**farmer.dict())
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer

@app.get("/api/farmers/", response_model=List[schemas.Farmer])
def get_farmers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    farmers = db.query(models.Farmer).offset(skip).limit(limit).all()
    return farmers

@app.post("/api/farmers/{farmer_id}/records/", response_model=schemas.FarmerRecord)
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

@app.post("/api/advisory/")
def get_advisory(request: schemas.AdvisoryRequest):
    advice = generate_advisory(
        crop=request.crop,
        soil_type=request.soil_type,
        rainfall_dev=request.rainfall_deviation_percent,
        language=request.language
    )
    return {"advisory": advice}

@app.get("/api/dashboard-data/")
def get_dashboard_data(db: Session = Depends(database.get_db)):
    farmers = db.query(models.Farmer).all()
    
    high_risk = []
    for f in farmers:
        if f.records:
            latest_record = f.records[-1] # Simplistic way to get latest
            if latest_record.distress_score > 60: # Threshold for high risk
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

import os
import time
import secrets
import random

from services.sms_service import send_otp_sms, send_sms

# In-memory OTP Cache: { (phone, role): {"otp": str, "expires_at": float, "attempts": int, "last_sent_at": float} }
OTP_STORE = {}
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))
OTP_RESEND_COOLDOWN = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "30"))
OTP_LENGTH = int(os.getenv("OTP_LENGTH", "6"))

@app.post("/api/alert/{farmer_id}")
def send_alert(farmer_id: int, db: Session = Depends(database.get_db)):
    db_farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not db_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    message = "SmartCrop Alert: You have been identified as high distress risk. An agricultural officer will contact you shortly."
    send_sms(db_farmer.phone, message, role="farmer")
    
    return {"status": "Alert sent successfully"}

@app.post("/api/auth/request-otp", response_model=schemas.OTPResponse)
def request_otp(req: schemas.OTPRequest):
    phone = req.phone.strip()
    role = (req.role or "farmer").lower()
    
    if len("".join(filter(str.isdigit, phone))) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
        
    key = (phone, role)
    now = time.time()
    
    # 1. Rate Limiting Check (30s cooldown)
    if key in OTP_STORE:
        elapsed = now - OTP_STORE[key].get("last_sent_at", 0)
        if elapsed < OTP_RESEND_COOLDOWN:
            remaining = int(OTP_RESEND_COOLDOWN - elapsed)
            raise HTTPException(
                status_code=429, 
                detail=f"Please wait {remaining} seconds before requesting a new OTP."
            )
            
    # 2. Generate Secure Random OTP (6-digit default)
    if OTP_LENGTH == 4:
        generated_otp = f"{secrets.randbelow(9000) + 1000}"
    else:
        generated_otp = f"{secrets.randbelow(900000) + 100000}"
        
    # 3. Store in TTL cache
    OTP_STORE[key] = {
        "otp": generated_otp,
        "expires_at": now + OTP_EXPIRY_SECONDS,
        "attempts": 0,
        "last_sent_at": now
    }
    
    # 4. Dispatch Real SMS via SMS Service
    sms_res = send_otp_sms(phone, generated_otp, role=role)
    
    response_payload = {
        "status": "success",
        "message": f"OTP successfully sent to {phone} via SMS.",
        "expires_in": OTP_EXPIRY_SECONDS,
        "resend_cooldown": OTP_RESEND_COOLDOWN
    }
    
    # If in sandbox mode, send the OTP to the frontend so the user isn't blocked
    if sms_res and sms_res.get("provider") == "sandbox":
        response_payload["message"] = "Sandbox Mode: Real SMS disabled. Test OTP generated."
        response_payload["test_otp"] = sms_res.get("otp")
        
    return response_payload

@app.post("/api/auth/verify-otp", response_model=schemas.AuthTokenResponse)
def verify_otp(req: schemas.OTPVerify):
    phone = req.phone.strip()
    role = (req.role or "farmer").lower()
    key = (phone, role)
    now = time.time()
    
    # Master test OTP support for offline testing/demo fallback
    is_master_test_otp = (req.otp in ["1234", "123456"])
    record = OTP_STORE.get(key)
    
    if not record and not is_master_test_otp:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request an OTP first.")
        
    if record:
        # Check Expiration (5 min)
        if now > record["expires_at"]:
            del OTP_STORE[key]
            raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
            
        # Check Attempt Limit (3 max)
        if record["attempts"] >= 3:
            del OTP_STORE[key]
            raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new OTP.")
            
        # Validate OTP
        if req.otp != record["otp"] and not is_master_test_otp:
            record["attempts"] += 1
            remaining = 3 - record["attempts"]
            raise HTTPException(status_code=400, detail=f"Invalid OTP code. {remaining} attempt(s) remaining.")
            
        # Successful Verification -> Invalidate OTP to prevent replay
        del OTP_STORE[key]
        
    token = f"smartcrop-{role}-token-{secrets.token_hex(16)}"
    return {
        "status": "success",
        "token": token,
        "role": role,
        "phone": phone,
        "message": f"Successfully authenticated as {role.capitalize()}."
    }

@app.post("/api/auth/officer-login")
def officer_login(req: schemas.OfficerLogin):
    if req.username == "admin" and req.password == "123":
        return {
            "status": "success", 
            "token": f"smartcrop-officer-token-{secrets.token_hex(16)}",
            "role": "officer"
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/chat")
def chat_with_assistant(req: schemas.ChatMessage):
    from services.chat_engine import generate_response
    
    # Convert history to list of dicts if provided
    history = None
    if req.history:
        history = [{"role": item.role, "text": item.text} for item in req.history]
    
    reply = generate_response(req.message, history=history, language=req.language or "en")
    return {"reply": reply}
