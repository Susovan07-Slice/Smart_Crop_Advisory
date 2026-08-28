from pydantic import BaseModel
from typing import Optional, List

class FarmerBase(BaseModel):
    name: str
    phone: str
    language: str = "en"
    district: str
    crop: str
    soil_type: str
    loan_amount: float = 0.0
    days_to_loan_due: int = 365

class FarmerCreate(FarmerBase):
    pass

class FarmerRecordBase(BaseModel):
    rainfall_deviation_percent: float = 0.0
    mandi_price_drop_percent: float = 0.0
    
class FarmerRecordCreate(FarmerRecordBase):
    pass

class FarmerRecord(FarmerRecordBase):
    id: int
    farmer_id: int
    distress_score: float

    class Config:
        from_attributes = True

class Farmer(FarmerBase):
    id: int
    records: List[FarmerRecord] = []

    class Config:
        from_attributes = True

class AdvisoryRequest(BaseModel):
    crop: str
    soil_type: str
    rainfall_deviation_percent: float
    language: str = "en"

# Auth and Chat Schemas
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

class AuthTokenResponse(BaseModel):
    status: str
    token: str
    role: str
    phone: Optional[str] = None
    message: Optional[str] = None

class ChatHistoryItem(BaseModel):
    role: str  # "user" or "assistant"
    text: str

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[ChatHistoryItem]] = None
    language: Optional[str] = "en"  # "en", "hi", or "or"

class OfficerLogin(BaseModel):
    username: str
    password: str
