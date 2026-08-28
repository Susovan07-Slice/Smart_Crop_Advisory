from pydantic import BaseModel
from typing import Optional

class OTPRequest(BaseModel):
    phone: str
    role: Optional[str] = "farmer"  # "farmer" or "officer"

class OTPVerify(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = "farmer"  # "farmer" or "officer"

class OTPResponse(BaseModel):
    status: str
    message: str
    expires_in: int = 300
    resend_cooldown: int = 30
    test_otp: Optional[str] = None

class AuthTokenResponse(BaseModel):
    status: str
    token: str
    role: str
    phone: Optional[str] = None
    message: Optional[str] = None

class OfficerLogin(BaseModel):
    username: str
    password: str
