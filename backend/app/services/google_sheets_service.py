import os
import logging
from typing import Any, Dict, Optional

import httpx


logger = logging.getLogger(__name__)


# ==============================================================
# CONFIGURATION
# ==============================================================

GOOGLE_APPS_SCRIPT_URL_ENV = "GOOGLE_APPS_SCRIPT_URL"
GOOGLE_APPS_SCRIPT_TOKEN_ENV = "GOOGLE_APPS_SCRIPT_TOKEN"

REQUEST_TIMEOUT_SECONDS = 30.0
MAX_RESPONSE_LOG_LENGTH = 1000


# ==============================================================
# ENVIRONMENT HELPERS
# ==============================================================

def get_google_apps_script_config():
    """
    Read Google Apps Script configuration from environment.

    Required Render environment variables:

    GOOGLE_APPS_SCRIPT_URL
    GOOGLE_APPS_SCRIPT_TOKEN
    """

    url = os.getenv(
        GOOGLE_APPS_SCRIPT_URL_ENV
    )

    token = os.getenv(
        GOOGLE_APPS_SCRIPT_TOKEN_ENV
    )

    if not url:

        raise RuntimeError(
            "GOOGLE_APPS_SCRIPT_URL environment "
            "variable is missing."
        )

    if not token:

        raise RuntimeError(
            "GOOGLE_APPS_SCRIPT_TOKEN environment "
            "variable is missing."
        )

    return url, token


# ==============================================================
# PAYLOAD NORMALIZATION
# ==============================================================

def normalize_payload(
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Normalize the payload before sending it to Google Apps Script.

    The backend can send any supported data structure while
    preserving all fields.

    Expected structure:

    {
        "type": "order",
        "data": {
            ...
        }
    }
    """

    if not isinstance(
        payload,
        dict,
    ):

        raise RuntimeError(
            "Google Apps Script payload must be a dictionary."
        )

    request_type = (
        payload.get(
            "type",
            "unknown",
        )
    )

    data = (
        payload.get(
            "data",
            {},
        )
    )

    if not isinstance(
        data,
        dict,
    ):

        raise RuntimeError(
            "Google Apps Script payload 'data' "
            "must be a dictionary."
        )

    return {
        "type":
            request_type,

        "data":
            data,
    }


# ==============================================================
# GOOGLE APPS SCRIPT REQUEST
# ==============================================================

async def post_to_google_apps_script(
    payload: dict,
) -> dict:
    """
    Send backend data to Google Apps Script.

    MongoDB remains independent from this request.

    IMPORTANT:
    Google Sheets failure must never silently convert a
    successful payment into a failed payment.

    The caller decides whether the Google Sheets failure
    should be retried/logged.
    """

    url, token = (
        get_google_apps_script_config()
    )

    normalized = normalize_payload(
        payload
    )

    request_type = (
        normalized["type"]
    )

    data = (
        normalized["data"]
    )

    order_id = data.get(
        "orderId",
        "",
    )

    # ==========================================================
    # REQUEST BODY
    # ==========================================================

    body = {
        "type":
            request_type,

        "token":
            token,

        "data":
            data,
    }

    logger.info(
        "Sending %s to Google Apps Script | order=%s",
        request_type,
        order_id,
    )

    # ==========================================================
    # HTTP REQUEST
    # ==========================================================

    try:

        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT_SECONDS,
            follow_redirects=True,
        ) as client:

            response = await client.post(
                url,
                json=body,
                headers={
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json",
                },
            )

    except httpx.TimeoutException as exc:

        logger.exception(
            "Google Apps Script request timed out | order=%s",
            order_id,
        )

        raise RuntimeError(
            "Google Apps Script request timed out."
        ) from exc

    except httpx.RequestError as exc:

        logger.exception(
            "Google Apps Script network error | order=%s",
            order_id,
        )

        raise RuntimeError(
            "Unable to connect to Google Apps Script."
        ) from exc

    except Exception as exc:

        logger.exception(
            "Unexpected Google Apps Script request error | order=%s",
            order_id,
        )

        raise RuntimeError(
            "Unexpected Google Apps Script communication error."
        ) from exc

    # ==========================================================
    # HTTP STATUS
    # ==========================================================

    logger.info(
        "Google Apps Script response | type=%s | order=%s | HTTP=%s",
        request_type,
        order_id,
        response.status_code,
    )

    if response.status_code != 200:

        response_preview = (
            response.text[
                :MAX_RESPONSE_LOG_LENGTH
            ]
        )

        logger.error(
            "Google Apps Script HTTP error | order=%s | "
            "status=%s | response=%s",
            order_id,
            response.status_code,
            response_preview,
        )

        raise RuntimeError(
            "Google Apps Script HTTP "
            f"{response.status_code}: "
            f"{response_preview}"
        )

    # ==========================================================
    # JSON RESPONSE
    # ==========================================================

    try:

        result = response.json()

    except Exception as exc:

        response_preview = (
            response.text[
                :MAX_RESPONSE_LOG_LENGTH
            ]
        )

        logger.error(
            "Google Apps Script returned invalid JSON | "
            "order=%s | response=%s",
            order_id,
            response_preview,
        )

        raise RuntimeError(
            "Google Apps Script returned invalid JSON."
        ) from exc

    # ==========================================================
    # RESPONSE VALIDATION
    # ==========================================================

    if not isinstance(
        result,
        dict,
    ):

        logger.error(
            "Google Apps Script returned non-object response | "
            "order=%s",
            order_id,
        )

        raise RuntimeError(
            "Google Apps Script returned an invalid response."
        )

    if not result.get(
        "success"
    ):

        error_message = (
            result.get(
                "error",
                "Unknown error",
            )
        )

        logger.error(
            "Google Apps Script rejected request | "
            "type=%s | order=%s | error=%s",
            request_type,
            order_id,
            error_message,
        )

        raise RuntimeError(
            "Google Apps Script rejected request: "
            + str(error_message)
        )

    # ==========================================================
    # SUCCESS
    # ==========================================================

    logger.info(
        "Google Apps Script SUCCESS | type=%s | order=%s",
        request_type,
        order_id,
    )

    return result


# ==============================================================
# SPECIALIZED HELPERS
# ==============================================================

async def sync_order_to_google_sheets(
    data: Dict[str, Any],
) -> dict:
    """
    Send an order record to Google Sheets.
    """

    return await post_to_google_apps_script(
        {
            "type":
                "order",

            "data":
                data,
        }
    )


async def sync_payment_to_google_sheets(
    data: Dict[str, Any],
) -> dict:
    """
    Send a Razorpay payment record to Google Sheets.
    """

    return await post_to_google_apps_script(
        {
            "type":
                "payment",

            "data":
                data,
        }
    )


async def sync_shipment_to_google_sheets(
    data: Dict[str, Any],
) -> dict:
    """
    Send an India Post shipment record to Google Sheets.
    """

    return await post_to_google_apps_script(
        {
            "type":
                "shipment",

            "data":
                data,
        }
    )


async def sync_tracking_event_to_google_sheets(
    data: Dict[str, Any],
) -> dict:
    """
    Send an India Post tracking event to Google Sheets.
    """

    return await post_to_google_apps_script(
        {
            "type":
                "tracking_event",

            "data":
                data,
        }
    )


async def sync_webhook_to_google_sheets(
    data: Dict[str, Any],
) -> dict:
    """
    Store a webhook event in Google Sheets.
    """

    return await post_to_google_apps_script(
        {
            "type":
                "webhook",

            "data":
                data,
        }
    )
async def get_reviews_from_google_sheets(
    data: Dict[str, Any],
) -> dict:
    """
    Read approved product reviews from Google Sheets.
    """

    return await post_to_google_apps_script(
        {
            "type":
                "review_read",

            "data":
                data,
        }
    )
