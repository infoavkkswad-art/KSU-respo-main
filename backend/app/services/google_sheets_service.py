import os
import logging
import httpx

logger = logging.getLogger(__name__)

APPS_SCRIPT_URL = os.getenv(
    "GOOGLE_APPS_SCRIPT_URL",
    "https://script.google.com/macros/s/AKfycbyjXg2koadtfs7Bew2WSBk0reyfBXywGrPN4TPx2oSHRXakuVg14c2CKo2LdKcI2qjoRA/exec"
)

async def post_to_google_apps_script(payload: dict) -> None:
    token = os.getenv("GOOGLE_APPS_SCRIPT_TOKEN")
    if not token:
        logger.error("GOOGLE_APPS_SCRIPT_TOKEN is missing from environment variables.")
        return

    body = {
        "token": token,
        **payload
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.post(APPS_SCRIPT_URL, json=body)
            result = response.json()
            if not result.get("success"):
                logger.error(f"Google Apps Script returned an error: {result}")
            else:
                logger.info(f"Successfully synced {payload.get('type')} to Google Sheets.")
    except Exception as e:
        # Non-blocking catch to ensure MongoDB/Customer flow remains completely unaffected
        logger.exception(f"Failed to communicate with Google Apps Script Web App: {str(e)}")
