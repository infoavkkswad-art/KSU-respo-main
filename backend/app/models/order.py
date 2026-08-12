from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class CustomerSchema(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., pattern=r"^[6-9]\d{9}$")
    email: EmailStr
    address: str = Field(..., min_length=1, max_length=300)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")

class CartItemInput(BaseModel):
    sku: str = Field(..., min_length=1)
    quantity: int = Field(..., ge=1, le=100)

class CreateOrderRequest(BaseModel):
    customer: CustomerSchema
    items: List[CartItemInput]
    idempotencyKey: Optional[str] = None

class OrderItemSnapshot(BaseModel):
    sku: str
    quantity: int
    unitPrice: int
    productNameSnapshot: str
    packSizeSnapshot: int

class OrderDocument(BaseModel):
    orderId: str
    customer: CustomerSchema
    items: List[OrderItemSnapshot]
    subtotal: int
    shipping: int
    total: int
    status: OrderStatus = OrderStatus.PENDING
    idempotencyKey: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class PublicCustomerSnapshot(BaseModel):
    fullName: str
    phoneMasked: str
    city: str
    state: str

class OrderTrackingResponse(BaseModel):
    orderId: str
    status: OrderStatus
    customer: PublicCustomerSnapshot
    items: List[OrderItemSnapshot]
    subtotal: int
    shipping: int
    total: int
    createdAt: datetime
