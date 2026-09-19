"""
Persist Razorpay webhook event IDs and decide whether an
incoming event may change an order.

Event IDs are recorded only after a terminal result
(processed or ignored). Missing-order retries must not
insert an eventId, or Razorpay would send the same id
again and we would skip recovery.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from pymongo.errors import DuplicateKeyError


STATUS_PROCESSED = "processed"
STATUS_IGNORED = "ignored"

CAPTURE_EVENTS = frozenset(
    {
        "payment.captured",
        "order.paid",
    }
)

FAILED_EVENT = "payment.failed"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_event_id(event_id: Optional[str]) -> Optional[str]:
    if event_id is None:
        return None

    clean = str(event_id).strip()
    return clean or None


def is_terminal_event_record(record: Optional[dict]) -> bool:
    if not record:
        return False

    return record.get("status") in {
        STATUS_PROCESSED,
        STATUS_IGNORED,
    }


def paid_order_may_be_overwritten(
    payment_status: Optional[str],
) -> bool:
    """Paid orders must not be rewritten by a later webhook."""
    return str(payment_status or "").strip().lower() != "paid"


def capture_may_mark_paid(payment_status: Optional[str]) -> bool:
    status = str(payment_status or "").strip().lower()
    return status in {"pending", "failed"}


def failure_may_mark_failed(payment_status: Optional[str]) -> bool:
    status = str(payment_status or "").strip().lower()
    return status == "pending"


async def get_recorded_event(
    db: Any,
    event_id: Optional[str],
) -> Optional[dict]:
    clean_id = normalize_event_id(event_id)
    if not clean_id:
        return None

    return await db["webhook_events"].find_one(
        {
            "eventId": clean_id,
        }
    )


async def record_webhook_event(
    db: Any,
    *,
    event_id: Optional[str],
    event_type: Optional[str],
    razorpay_order_id: Optional[str],
    status: str,
) -> bool:
    """
    Insert a terminal webhook event.

    Returns True when a new row was written.
    Returns False when eventId is missing or already stored.
    """

    clean_id = normalize_event_id(event_id)
    if not clean_id:
        return False

    document = {
        "eventId": clean_id,
        "eventType": event_type or "",
        "razorpayOrderId": razorpay_order_id or "",
        "status": status,
        "recordedAt": utc_now(),
    }

    try:
        await db["webhook_events"].insert_one(document)
        return True
    except DuplicateKeyError:
        return False
