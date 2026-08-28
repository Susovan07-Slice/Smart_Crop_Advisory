from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    language = Column(String, default="en") # en, hi, mr
    district = Column(String, index=True)
    crop = Column(String)
    soil_type = Column(String)
    
    # Financial state
    loan_amount = Column(Float, default=0.0)
    days_to_loan_due = Column(Integer, default=365)
    
    # Relationships
    records = relationship("FarmerRecord", back_populates="farmer")


class FarmerRecord(Base):
    __tablename__ = "farmer_records"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    
    # Signals for Distress
    rainfall_deviation_percent = Column(Float, default=0.0) # e.g. -20 for 20% below normal
    mandi_price_drop_percent = Column(Float, default=0.0) # e.g. 15 for 15% price drop
    
    # Computed risk score (0-100)
    distress_score = Column(Float, default=0.0)
    
    farmer = relationship("Farmer", back_populates="records")
