from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/webhooks",
    tags=["India Post"],
)


@router.post("/indiapost")
async def indiapost_webhook(request: Request):
    """
    India Post webhook endpoint.

    Receives booking, tracking, delivery and other
    shipment-event notifications from India Post.

    This initial version safely accepts and logs the
    webhook payload. Order/database mapping will be
    added after the Sandbox webhook connection is verified.
    """

    logger.info("========== INDIA POST WEBHOOK START ==========")

    try:
        payload = await request.json()

        logger.info(
            "India Post webhook received: %s",
            payload,
        )

        logger.info(
            "========== INDIA POST WEBHOOK END =========="
        )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "India Post webhook received successfully.",
            },
        )

    except Exception as exc:
        logger.exception(
            "India Post webhook processing error: %s",
            exc,
        )

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Invalid India Post webhook payload.",
            },
        )
