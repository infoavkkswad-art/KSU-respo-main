from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, status

from ..database import get_database
from ..models.review import (
    CreateReviewRequest,
    ReviewResponse,
    ReviewStatus,
    ReviewSummary,
)


router = APIRouter(
    prefix="/api/reviews",
    tags=["reviews"],
)


# ============================================================================
# HELPERS
# ============================================================================


def serialize_review(document: dict) -> ReviewResponse:
    return ReviewResponse(
        reviewId=document["reviewId"],
        productId=document["productId"],
        sku=document["sku"],
        rating=document["rating"],
        title=document.get("title"),
        comment=document["comment"],
        customerName=document["customerName"],
        verifiedPurchase=document.get(
            "verifiedPurchase",
            False,
        ),
        status=document.get(
            "status",
            ReviewStatus.PENDING,
        ),
        createdAt=document["createdAt"],
    )


async def verify_purchase(
    order_id: str | None,
    sku: str,
) -> bool:
    """
    Verify that the supplied order contains the
    supplied SKU and has a successful payment.

    The frontend cannot directly set verifiedPurchase.
    This value is determined only by the backend.
    """

    if not order_id:
        return False

    db = get_database()

    if db is None:
        return False

    order = await db["orders"].find_one(
        {
            "orderId": order_id.strip(),
            "paymentStatus": "paid",
        },
        {
            "orderId": 1,
            "items": 1,
        },
    )

    if not order:
        return False

    purchased_skus = {
        str(item.get("sku", "")).strip()
        for item in order.get("items", [])
    }

    return sku.strip() in purchased_skus


# ============================================================================
# GET PRODUCT REVIEWS
# ============================================================================


@router.get(
    "/{product_id}",
    response_model=list[ReviewResponse],
)
async def get_product_reviews(
    product_id: str,
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    skip: int = Query(
        default=0,
        ge=0,
    ),
):
    """
    Return approved reviews for a product.

    Only approved reviews are publicly visible.
    """

    db = get_database()

    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Review service is temporarily unavailable.",
        )

    reviews = (
        await db["reviews"]
        .find(
            {
                "productId": product_id,
                "status": ReviewStatus.APPROVED.value,
            }
        )
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    return [
        serialize_review(review)
        for review in reviews
    ]


# ============================================================================
# GET PRODUCT REVIEW SUMMARY
# ============================================================================


@router.get(
    "/{product_id}/summary",
    response_model=ReviewSummary,
)
async def get_product_review_summary(
    product_id: str,
):
    """
    Return average rating and review count
    for approved reviews of a product.
    """

    db = get_database()

    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Review service is temporarily unavailable.",
        )

    pipeline = [
        {
            "$match": {
                "productId": product_id,
                "status": ReviewStatus.APPROVED.value,
            }
        },
        {
            "$group": {
                "_id": None,
                "averageRating": {
                    "$avg": "$rating",
                },
                "reviewCount": {
                    "$sum": 1,
                },
            }
        },
    ]

    results = await db[
        "reviews"
    ].aggregate(pipeline).to_list(
        length=1,
    )

    if not results:
        return ReviewSummary(
            productId=product_id,
            averageRating=0,
            reviewCount=0,
        )

    result = results[0]

    average_rating = round(
        float(
            result.get(
                "averageRating",
                0,
            )
        ),
        1,
    )

    review_count = int(
        result.get(
            "reviewCount",
            0,
        )
    )

    return ReviewSummary(
        productId=product_id,
        averageRating=average_rating,
        reviewCount=review_count,
    )


# ============================================================================
# CREATE REVIEW
# ============================================================================


@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    payload: CreateReviewRequest,
):
    """
    Submit a new product review.

    New reviews are created as PENDING and are not
    publicly displayed until approved.

    verifiedPurchase is determined by the backend
    from the supplied order ID and purchased SKU.
    """

    db = get_database()

    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Review service is temporarily unavailable.",
        )

    product_id = payload.productId.strip()
    sku = payload.sku.strip()
    customer_name = payload.customerName.strip()
    comment = payload.comment.strip()

    if not product_id:
        raise HTTPException(
            status_code=400,
            detail="Product ID is required.",
        )

    if not sku:
        raise HTTPException(
            status_code=400,
            detail="SKU is required.",
        )

    if not customer_name:
        raise HTTPException(
            status_code=400,
            detail="Customer name is required.",
        )

    if not comment:
        raise HTTPException(
            status_code=400,
            detail="Review comment is required.",
        )

    # ------------------------------------------------------------
    # Verify purchase
    # ------------------------------------------------------------

    verified_purchase = await verify_purchase(
        payload.orderId,
        sku,
    )

    # ------------------------------------------------------------
    # Prepare review document
    # ------------------------------------------------------------

    now = datetime.utcnow()

    review_document = {
        "reviewId": f"REV-{uuid4().hex[:12].upper()}",
        "productId": product_id,
        "sku": sku,
        "rating": payload.rating,
        "title": (
            payload.title.strip()
            if payload.title
            else None
        ),
        "comment": comment,
        "customerName": customer_name,
        "orderId": (
            payload.orderId.strip()
            if payload.orderId
            else None
        ),
        "verifiedPurchase": verified_purchase,
        "status": ReviewStatus.PENDING.value,
        "createdAt": now,
        "updatedAt": now,
    }

    # ------------------------------------------------------------
    # Save review
    # ------------------------------------------------------------

    try:
        await db["reviews"].insert_one(
            review_document
        )

    except Exception as exc:
        print(
            "Failed to create review:",
            str(exc),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to submit review right now.",
        )

    return serialize_review(
        review_document
    )
