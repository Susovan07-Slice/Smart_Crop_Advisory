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
    msg = "Mobile number registered. Please enter your 4-digit PIN to log in." if exists else "New farmer account. Please set a 4-digit PIN to register."
    
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
        
    first_name = (req.first_name and req.first_name.strip()) or "Farmer"
    last_name = (req.last_name and req.last_name.strip()) or (phone[-4:] if len(phone) >= 4 else "Node")
    district = req.district.strip() if (req.district and req.district.strip()) else "Cuttack"
    dob = req.dob.strip() if (req.dob and req.dob.strip()) else "1990-01-01"
    land_area = float(req.land_area_ha or 2.5)
    pref_lang = (req.preferred_language and req.preferred_language.strip()) or "en"

    existing = db.query(FarmerLoginDetails).filter(FarmerLoginDetails.phone == phone).first()
    if existing:
        # Update existing profile and PIN
        existing.pin = pin
        existing.first_name = first_name if first_name != "Farmer" else (existing.first_name or first_name)
        existing.last_name = last_name if last_name != phone[-4:] else (existing.last_name or last_name)
        existing.district = district or existing.district
        existing.dob = dob or existing.dob
        existing.land_area_ha = land_area or existing.land_area_ha
        existing.preferred_language = pref_lang or existing.preferred_language or "en"
        farmer = existing
    else:
        # Create new farmer login details record in SQLite login_details.db
        farmer = FarmerLoginDetails(
            phone=phone,
            pin=pin,
            first_name=first_name,
            last_name=last_name,
            district=district,
            dob=dob,
            land_area_ha=land_area,
            preferred_language=pref_lang
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
        "message": f"Farmer account for mobile {phone} registered successfully!",
        "profile": {
            "phone": farmer.phone,
            "first_name": farmer.first_name,
            "last_name": farmer.last_name,
            "district": farmer.district,
            "dob": farmer.dob,
            "land_area_ha": farmer.land_area_ha,
            "preferred_language": farmer.preferred_language or "en"
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
            detail=f"Mobile number {phone} is not registered yet. Click 'Sign Up' below to create your account in 5 seconds!"
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
            "land_area_ha": farmer.land_area_ha,
            "preferred_language": farmer.preferred_language or "en"
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
            "land_area_ha": farmer.land_area_ha,
            "preferred_language": farmer.preferred_language or "en"
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
            farmer = FarmerLoginDetails(phone=phone, pin=pin, first_name="Farmer", last_name=phone[-4:])
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
