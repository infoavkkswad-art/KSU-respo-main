import os
import logging
import httpx

logger = logging.getLogger(__name__)

async def post_to_google_apps_script(payload: dict) -> None:
    url = os.getenv("GOOGLE_APPS_SCRIPT_URL")
    token = os.getenv("GOOGLE_APPS_SCRIPT_TOKEN")

    if not url:
        logger.error("Configuration error: GOOGLE_APPS_SCRIPT_URL environment variable is missing.")
        return

    if not token:
        logger.error("Configuration error: GOOGLE_APPS_SCRIPT_TOKEN environment variable is missing.")
        return

    request_type = payload.get("type", "unknown")

    body = {
        "type": request_type,
        "token": token,
        "data": payload.get("data", {})
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.post(url, json=body)
            
            if response.status_code != 200:
                logger.error(f"Google Apps Script sync failed: {request_type}, HTTP status {response.status_code}")
                return

            try:
                result = response.json()
            except Exception:
                logger.error(f"Google Apps Script returned non-JSON response for: {request_type}")
                return

            if not isinstance(result, dict) or not result.get("success"):
                logger.error(f"Google Apps Script returned unsuccessful response for {request_type}")
            else:
                logger.info(f"Google Apps Script sync succeeded: {request_type}")

    except httpx.HTTPStatusError as e:
        logger.error(f"Google Apps Script sync failed: {request_type}, HTTP status {e.response.status_code}")
    except Exception:
        logger.error(f"Google Apps Script sync failed due to network or connection error for: {request_type}")
