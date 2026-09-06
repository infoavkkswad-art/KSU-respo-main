from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field

EnquiryType = Literal["bulk", "distributor", "food-business", "general"]

class CreateEnquiryRequest(BaseModel):
    type: EnquiryType
    businessName: Optional[str] = Field(None, max_length=150)
    contactPerson: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)
    email: EmailStr
    businessType: Optional[str] = Field(None, max_length=100)
    location: str = Field(..., min_length=2, max_length=150)
    productsOfInterest: Optional[str] = Field(None, max_length=250)
    quantity: Optional[str] = Field(None, max_length=100)
    message: str = Field(..., min_length=5, max_length=1000)
    idempotencyKey: Optional[str] = Field(None, max_length=100)

class EnquiryInDB(BaseModel):
    enquiryId: str
    type: EnquiryType
    businessName: Optional[str] = None
    contactPerson: str
    phone: Optional[str] = None
    email: str
    businessType: Optional[str] = None
    location: str
    productsOfInterest: Optional[str] = None
    quantity: Optional[str] = None
    message: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    status: str = "new"
    idempotencyKey: Optional[str] = None

class EnquiryResponse(BaseModel):
    success: bool
    enquiryId: str
    message: str
    createdAt: str
