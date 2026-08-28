import os
import secrets
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

import database_login
from models_login import FarmerLoginDetails
import schemas

router = APIRouter()

def get_db():
    db = database_login.LoginSessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/auth/check-mobile", response_model=schemas.PhoneCheckResponse)
def check_mobile(req: schemas.PhoneCheckRequest, db: Session = Depends(get_db)):
    phone = "".join(filter(str.isdigit, req.phone.strip()))
    
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
        
    farmer = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == phone).first()
    exists = farmer is not None
    msg = "Mobile number registered. Please enter your 4-digit PIN to log in." if exists else "New farmer account. Please enter your details and set a 4-digit PIN to register."
    
    return {
        "status": "success",
        "exists": exists,
        "phone": phone,
        "message": msg
    }


@router.post("/auth/register-pin", response_model=schemas.AuthTokenResponse)
def register_pin(req: schemas.PinRegisterRequest, db: Session = Depends(get_db)):
    phone = "".join(filter(str.isdigit, req.phone.strip()))
    pin = req.pin.strip()
    
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
    if len(pin) != 4 or not pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 4 numeric digits.")
        
    existing = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == phone).first()
    if existing:
        # Update existing profile and PIN
        existing.pin = pin
        existing.first_name = req.first_name or existing.first_name
        existing.last_name = req.last_name or existing.last_name
        existing.district = req.district or existing.district
        existing.dob = req.dob or existing.dob
        existing.land_area_ha = float(req.land_area_ha or 2.5)
        farmer = existing
    else:
        # Create new farmer login details record in SQLite login_details.db
        farmer = FarmerLoginDetails(
            phone=phone,
            pin=pin,
            first_name=req.first_name or "",
            last_name=req.last_name or "",
            district=req.district or "Cuttack",
            dob=req.dob or "",
            land_area_ha=float(req.land_area_ha or 2.5)
        )
        db.add(farmer)
        
    db.commit()
    db.refresh(farmer)
    
    token = f"smartcrop-farmer-token-{secrets.token_hex(16)}"
    return {
        "status": "success",
        "token": token,
        "role": "farmer",
        "phone": phone,
        "message": "4-digit PIN & Farmer Profile registered successfully in SQLite database (login_details.db)!",
        "profile": {
            "phone": farmer.phone,
            "first_name": farmer.first_name,
            "last_name": farmer.last_name,
            "district": farmer.district,
            "dob": farmer.dob,
            "land_area_ha": farmer.land_area_ha
        }
    }


@router.post("/auth/login-pin", response_model=schemas.AuthTokenResponse)
def login_pin(req: schemas.PinLoginRequest, db: Session = Depends(get_db)):
    phone = "".join(filter(str.isdigit, req.phone.strip()))
    pin = req.pin.strip()
    
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")
        
    farmer = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == phone).first()
    if not farmer:
        raise HTTPException(
            status_code=404, 
            detail="Mobile number not registered yet. Please set up your profile and 4-digit PIN."
        )
        
    # Strict PIN verification matching login_details.db record
    if farmer.pin != pin:
        raise HTTPException(
            status_code=401, 
            detail="Incorrect 4-digit PIN. Please enter your registered PIN."
        )
        
    token = f"smartcrop-farmer-token-{secrets.token_hex(16)}"
    return {
        "status": "success",
        "token": token,
        "role": "farmer",
        "phone": phone,
        "message": "PIN verified successfully. Logging in...",
        "profile": {
            "phone": farmer.phone,
            "first_name": farmer.first_name,
            "last_name": farmer.last_name,
            "district": farmer.district,
            "dob": farmer.dob,
            "land_area_ha": farmer.land_area_ha
        }
    }


@router.get("/auth/farmer-profile/{phone}")
def get_farmer_profile(phone: str, db: Session = Depends(get_db)):
    clean_phone = "".join(filter(str.isdigit, phone.strip()))
    farmer = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == clean_phone).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")
        
    return {
        "status": "success",
        "profile": {
            "phone": farmer.phone,
            "first_name": farmer.first_name,
            "last_name": farmer.last_name,
            "district": farmer.district,
            "dob": farmer.dob,
            "land_area_ha": farmer.land_area_ha
        }
    }


# Retain OTP Request & Verify for legacy compatibility
@router.post("/auth/request-otp", response_model=schemas.OTPResponse)
def request_otp(req: schemas.OTPRequest, db: Session = Depends(get_db)):
    phone = "".join(filter(str.isdigit, req.phone.strip()))
    farmer = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == phone).first()
    exists = farmer is not None
    return {
        "status": "success",
        "message": "Enter your 4-digit PIN to continue." if exists else "Set up a 4-digit PIN to register.",
        "expires_in": 300,
        "resend_cooldown": 30
    }


@router.post("/auth/verify-otp", response_model=schemas.AuthTokenResponse)
def verify_otp(req: schemas.OTPVerify, db: Session = Depends(get_db)):
    phone = "".join(filter(str.isdigit, req.phone.strip()))
    pin = req.otp.strip()
    
    farmer = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == phone).first()
    if farmer:
        if farmer.pin != pin:
            raise HTTPException(status_code=401, detail="Incorrect 4-digit PIN. Please enter your registered PIN.")
    else:
        if len(pin) == 4 and pin.isdigit():
            farmer = FarmerLoginDetails(phone=phone, pin=pin)
            db.add(farmer)
            db.commit()
            db.refresh(farmer)
            
    token = f"smartcrop-farmer-token-{secrets.token_hex(16)}"
    return {
        "status": "success",
        "token": token,
        "role": "farmer",
        "phone": phone,
        "message": "Authenticated successfully.",
        "profile": {
            "phone": farmer.phone,
            "first_name": farmer.first_name,
            "last_name": farmer.last_name,
            "district": farmer.district,
            "dob": farmer.dob,
            "land_area_ha": farmer.land_area_ha
        } if farmer else None
    }


@router.post("/auth/officer-login")
def officer_login(req: schemas.OfficerLogin):
    if req.username == "admin" and req.password == "123":
        return {
            "status": "success", 
            "token": f"smartcrop-officer-token-{secrets.token_hex(16)}",
            "role": "officer"
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")
