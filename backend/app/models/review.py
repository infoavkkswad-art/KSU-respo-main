from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ReviewStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class CreateReviewRequest(BaseModel):
    productId: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    sku: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    rating: int = Field(
        ...,
        ge=1,
        le=5,
    )

    title: Optional[str] = Field(
        default=None,
        max_length=120,
    )

    comment: str = Field(
        ...,
        min_length=3,
        max_length=2000,
    )

    customerName: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    orderId: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )


class ReviewResponse(BaseModel):
    reviewId: str
    productId: str
    sku: str
    rating: int
    title: Optional[str] = None
    comment: str
    customerName: str
    verifiedPurchase: bool = False
    status: ReviewStatus
    createdAt: datetime


class ReviewSummary(BaseModel):
    productId: str
    averageRating: float = 0
    reviewCount: int = 0
