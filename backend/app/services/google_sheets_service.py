import os
import logging
import httpx

logger = logging.getLogger(__name__)

# Read Google Apps Script Web App URL from environment variable
APPS_SCRIPT_URL = os.getenv(
    "GOOGLE_APPS_SCRIPT_URL",
    "https://script.google.com/macros/s/AKfycbyjXg2koadtfs7Bew2WSBk0reyfBXywGrPN4TPx2oSHRXakuVg14c2CKo2LdKcI2qjoRA/exec"
)

async def post_to_google_apps_script(payload: dict) -> None:
    """
    Sends data securely to the Google Apps Script Web App.
    Retrieves the secret token from the backend environment variable.
    Ensures errors are safely logged without exposing secrets or disrupting the customer flow.
    """
    token = os.getenv("GOOGLE_APPS_SCRIPT_TOKEN")
    if not token:
        logger.error("Security configuration error: GOOGLE_APPS_SCRIPT_TOKEN is missing from backend environment variables.")
        return

    # Structure the payload with the required token and type/data body
    body = {
        "type": payload.get("type"),
        "token": token,
        "data": payload.get("data", {})
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.post(APPS_SCRIPT_URL, json=body)
            result = response.json()
            
            if not result.get("success"):
                logger.error(f"Google Apps Script sync failed for type '{payload.get('type')}': {result.get('error', 'Unknown error')}")
            else:
                logger.info(f"Successfully synced {payload.get('type')} to Google Sheets via Apps Script.")
                
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error communicating with Google Apps Script Web App: Status {e.response.status_code}")
    except Exception as e:
        logger.error(f"Failed to communicate with Google Apps Script Web App due to an unexpected error: {type(e).__name__}")
