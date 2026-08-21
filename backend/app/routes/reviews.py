from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, status

from ..database import get_database
from ..models.review import (
    CreateReviewRequest,
    ReviewResponse,
    ReviewStatus,
    ReviewSummary,
)
from ..services.google_sheets_service import (
    get_reviews_from_google_sheets,
    post_to_google_apps_script,
)


router = APIRouter(
    prefix="/api/reviews",
    tags=["reviews"],
)


# ============================================================================
# HELPERS
# ============================================================================


def utc_now() -> datetime:
    """
    Return a timezone-aware UTC datetime.
    """
    return datetime.now(timezone.utc)


def serialize_review(
    document: Dict[str, Any],
) -> ReviewResponse:
    """
    Convert a Google-Sheets review record into the
    public ReviewResponse model.
    """

    created_at = document.get(
        "createdAt"
    )

    if isinstance(created_at, str):

        try:
            created_at = datetime.fromisoformat(
                created_at.replace(
                    "Z",
                    "+00:00",
                )
            )

        except Exception:
            created_at = utc_now()

    if not isinstance(
        created_at,
        datetime,
    ):
        created_at = utc_now()

    status_value = document.get(
        "status",
        ReviewStatus.PENDING.value,
    )

    try:
        review_status = ReviewStatus(
            str(status_value).lower()
        )

    except ValueError:
        review_status = ReviewStatus.PENDING

    return ReviewResponse(
        reviewId=str(
            document.get(
                "reviewId",
                "",
            )
        ),
        productId=str(
            document.get(
                "productId",
                "",
            )
        ),
        sku=str(
            document.get(
                "sku",
                "",
            )
        ),
        rating=int(
            document.get(
                "rating",
                0,
            )
        ),
        title=(
            document.get(
                "title"
            )
            or None
        ),
        comment=str(
            document.get(
                "comment",
                "",
            )
        ),
        customerName=str(
            document.get(
                "customerName",
                "",
            )
        ),
        verifiedPurchase=bool(
            document.get(
                "verifiedPurchase",
                False,
            )
        ),
        status=review_status,
        createdAt=created_at,
    )


def normalize_google_sheet_review(
    raw: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Normalize a review returned by Google Apps Script.

    Apps Script may return spreadsheet values as strings,
    numbers, or booleans depending on the stored value.
    """

    verified_value = raw.get(
        "verifiedPurchase",
        False,
    )

    if isinstance(
        verified_value,
        str,
    ):
        verified_purchase = (
            verified_value.strip().lower()
            in {
                "true",
                "yes",
                "1",
            }
        )

    else:
        verified_purchase = bool(
            verified_value
        )

    try:
        rating = int(
            float(
                raw.get(
                    "rating",
                    0,
                )
            )
        )

    except Exception:
        rating = 0

    return {
        "reviewId": str(
            raw.get(
                "reviewId",
                "",
            )
        ).strip(),

        "productId": str(
            raw.get(
                "productId",
                "",
            )
        ).strip(),

        "sku": str(
            raw.get(
                "sku",
                "",
            )
        ).strip(),

        "rating": rating,

        "title": (
            str(
                raw.get(
                    "title",
                    "",
                )
            ).strip()
            or None
        ),

        "comment": str(
            raw.get(
                "comment",
                "",
            )
        ).strip(),

        "customerName": str(
            raw.get(
                "customerName",
                "",
            )
        ).strip(),

        "orderId": str(
            raw.get(
                "orderId",
                "",
            )
        ).strip(),

        "verifiedPurchase":
            verified_purchase,

        "status": str(
            raw.get(
                "status",
                ReviewStatus.PENDING.value,
            )
        ).strip().lower(),

        "createdAt": raw.get(
            "createdAt"
        ),

        "updatedAt": raw.get(
            "updatedAt"
        ),
    }


# ============================================================================
# PURCHASE VERIFICATION
# ============================================================================


async def verify_purchase(
    order_id: str | None,
    sku: str,
) -> bool:
    """
    Verify that the supplied order contains the supplied
    SKU and that the order has a successful payment.

    IMPORTANT:
    The frontend cannot set verifiedPurchase.
    """

    if not order_id:
        return False

    db = get_database()

    if db is None:
        return False

    clean_order_id = (
        order_id.strip()
    )

    clean_sku = (
        sku.strip()
    )

    if not clean_order_id:
        return False

    if not clean_sku:
        return False

    order = await db[
        "orders"
    ].find_one(
        {
            "orderId":
                clean_order_id,

            "paymentStatus":
                "paid",
        },
        {
            "orderId": 1,
            "items": 1,
        },
    )

    if not order:
        return False

    purchased_skus = {
        str(
            item.get(
                "sku",
                "",
            )
        ).strip()
        for item in order.get(
            "items",
            [],
        )
    }

    return clean_sku in purchased_skus


# ============================================================================
# GOOGLE APPS SCRIPT READ
# ============================================================================


async def get_reviews_from_google_sheet(
    product_id: str,
    *,
    sku: str | None = None,
    limit: int = 20,
    skip: int = 0,
) -> List[Dict[str, Any]]:
    """
    Read approved reviews from the private Google Sheet
    through the existing shared Google Apps Script service.

    The Google Sheet is never exposed directly to the frontend.
    """

    request_data = {
        "productId": product_id,
        "sku": sku or "",
        "limit": limit,
        "skip": skip,
    }

    try:
        result = await get_reviews_from_google_sheets(
            request_data
        )

    except Exception as exc:
        print(
            "Google Sheets review read failed:"
        )
        print(
            f"{type(exc).__name__}: {str(exc)}"
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to load product reviews right now."
            ),
        )

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=503,
            detail=(
                "Google review service returned an invalid response."
            ),
        )

    if not result.get("success", False):
        print(
            "Google review read unsuccessful:",
            result,
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to load product reviews right now."
            ),
        )

    reviews = result.get(
        "reviews",
        [],
    )

    if not isinstance(reviews, list):
        return []

    return [
        normalize_google_sheet_review(review)
        for review in reviews
        if isinstance(review, dict)
    ]


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

    Reviews are read from the private Google Sheet.
    Only APPROVED reviews are returned by the Apps Script layer.
    """

    clean_product_id = (
        product_id.strip()
    )

    if not clean_product_id:

        raise HTTPException(
            status_code=400,
            detail="Product ID is required.",
        )

    reviews = await get_reviews_from_google_sheet(
        clean_product_id,
        limit=limit,
        skip=skip,
    )

    approved_reviews = [
        review
        for review in reviews
        if review.get(
            "status"
        )
        == ReviewStatus.APPROVED.value
    ]

    return [
        serialize_review(
            review
        )
        for review in approved_reviews
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
    Calculate the average rating and review count
    from approved Google Sheet reviews.
    """

    clean_product_id = (
        product_id.strip()
    )

    if not clean_product_id:

        raise HTTPException(
            status_code=400,
            detail="Product ID is required.",
        )

    reviews = await get_reviews_from_google_sheet(
        clean_product_id,
        limit=100,
        skip=0,
    )

    approved_reviews = [
        review
        for review in reviews
        if review.get(
            "status"
        )
        == ReviewStatus.APPROVED.value
        and 1 <= int(
            review.get(
                "rating",
                0,
            )
        ) <= 5
    ]

    if not approved_reviews:

        return ReviewSummary(
            productId=
                clean_product_id,

            averageRating=0,

            reviewCount=0,
        )

    total_rating = sum(
        int(
            review.get(
                "rating",
                0,
            )
        )
        for review in approved_reviews
    )

    review_count = len(
        approved_reviews
    )

    average_rating = round(
        total_rating /
        review_count,
        1,
    )

    return ReviewSummary(
        productId=
            clean_product_id,

        averageRating=
            average_rating,

        reviewCount=
            review_count,
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

    Storage:
        Google Sheet -> Reviews

    Verification:
        MongoDB -> paid order + purchased SKU

    New reviews always start as PENDING.
    """

    product_id = (
        payload.productId.strip()
    )

    sku = (
        payload.sku.strip()
    )

    customer_name = (
        payload.customerName.strip()
    )

    comment = (
        payload.comment.strip()
    )

    title = (
        payload.title.strip()
        if payload.title
        else None
    )

    order_id = (
        payload.orderId.strip()
        if payload.orderId
        else None
    )

    # ------------------------------------------------------------
    # BASIC VALIDATION
    # ------------------------------------------------------------

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

    if len(comment) < 3:

        raise HTTPException(
            status_code=400,
            detail=(
                "Review comment must contain at least 3 characters."
            ),
        )

    # ------------------------------------------------------------
    # VERIFY PURCHASE
    # ------------------------------------------------------------

    verified_purchase = await verify_purchase(
        order_id,
        sku,
    )

    # ------------------------------------------------------------
    # CREATE REVIEW
    # ------------------------------------------------------------

    now = utc_now()

    review_id = (
        "REV-" +
        uuid4()
        .hex[:12]
        .upper()
    )

    review_document = {

        "reviewId":
            review_id,

        "productId":
            product_id,

        "sku":
            sku,

        "rating":
            int(
                payload.rating
            ),

        "title":
            title,

        "comment":
            comment,

        "customerName":
            customer_name,

        "orderId":
            order_id,

        "verifiedPurchase":
            verified_purchase,

        "status":
            ReviewStatus.PENDING.value,

        "createdAt":
            now.isoformat(),

        "updatedAt":
            now.isoformat(),

        "adminNote":
            "",
    }

    # ------------------------------------------------------------
    # SAVE TO PRIVATE GOOGLE SHEET
    # ------------------------------------------------------------

    try:

        result = await post_to_google_apps_script(
            {
                "type":
                    "review",

                "data":
                    review_document,
            }
        )

    except Exception as exc:

        print(
            "Failed to save review to Google Sheets:"
        )

        print(
            f"{type(exc).__name__}: {str(exc)}"
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to submit review right now. "
                "Please try again."
            ),
        )

    # ------------------------------------------------------------
    # VALIDATE GOOGLE RESPONSE
    # ------------------------------------------------------------

    if isinstance(
        result,
        dict,
    ):

        if not result.get(
            "success",
            False,
        ):

            print(
                "Google Apps Script rejected review:",
                result,
            )

            raise HTTPException(
                status_code=503,
                detail=(
                    "Unable to save review right now."
                ),
            )

    # ------------------------------------------------------------
    # RETURN PENDING REVIEW
    # ------------------------------------------------------------

    return serialize_review(
        review_document
    )
