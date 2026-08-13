import os
import logging
import httpx

logger = logging.getLogger(__name__)


async def post_to_google_apps_script(payload: dict) -> dict:
    url = os.getenv("GOOGLE_APPS_SCRIPT_URL")
    token = os.getenv("GOOGLE_APPS_SCRIPT_TOKEN")

    if not url:
        raise RuntimeError(
            "GOOGLE_APPS_SCRIPT_URL environment variable is missing."
        )

    if not token:
        raise RuntimeError(
            "GOOGLE_APPS_SCRIPT_TOKEN environment variable is missing."
        )

    request_type = payload.get("type", "unknown")

    body = {
        "type": request_type,
        "token": token,
        "data": payload.get("data", {}),
    }

    logger.info(
        "Sending %s to Google Apps Script for order=%s",
        request_type,
        body["data"].get("orderId"),
    )

    async with httpx.AsyncClient(
        timeout=20.0,
        follow_redirects=True,
    ) as client:

        response = await client.post(
            url,
            json=body,
        )

        logger.info(
            "Google Apps Script response: HTTP %s",
            response.status_code,
        )

        if response.status_code != 200:
            raise RuntimeError(
                f"Google Apps Script HTTP {response.status_code}: "
                f"{response.text[:500]}"
            )

        try:
            result = response.json()
        except Exception as exc:
            raise RuntimeError(
                "Google Apps Script returned invalid JSON."
            ) from exc

        if not isinstance(result, dict):
            raise RuntimeError(
                "Google Apps Script returned an invalid response."
            )

        if not result.get("success"):
            raise RuntimeError(
                "Google Apps Script rejected request: "
                + str(result.get("error", "Unknown error"))
            )

        logger.info(
            "Google Apps Script SUCCESS: type=%s order=%s",
            request_type,
            body["data"].get("orderId"),
        )

        return result
