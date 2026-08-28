import os
import time
import secrets
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import database
import models
import schemas
from services.sms_service import send_otp_sms, send_sms

router = APIRouter()

# In-memory OTP Cache: { (phone, role): {"otp": str, "expires_at": float, "attempts": int, "last_sent_at": float} }
OTP_STORE = {}
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))
OTP_RESEND_COOLDOWN = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "30"))
OTP_LENGTH = int(os.getenv("OTP_LENGTH", "6"))

@router.post("/auth/request-otp", response_model=schemas.OTPResponse)
def request_otp(req: schemas.OTPRequest):
    phone = req.phone.strip()
    role = (req.role or "farmer").lower()
    
    digits_only = "".join(filter(str.isdigit, phone))
    if len(digits_only) < 10:
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
    
    # If in sandbox mode, send the OTP to the frontend so user isn't blocked
    if sms_res and sms_res.get("provider") == "sandbox":
        response_payload["message"] = "Sandbox Mode: Real SMS disabled. Test OTP generated."
        response_payload["test_otp"] = sms_res.get("otp")
        
    return response_payload

@router.post("/auth/verify-otp", response_model=schemas.AuthTokenResponse)
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

@router.post("/auth/officer-login")
def officer_login(req: schemas.OfficerLogin):
    if req.username == "admin" and req.password == "123":
        return {
            "status": "success", 
            "token": f"smartcrop-officer-token-{secrets.token_hex(16)}",
            "role": "officer"
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")
