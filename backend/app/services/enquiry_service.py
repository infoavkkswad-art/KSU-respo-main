from datetime import datetime
import random
import string
import os
import smtplib
from email.message import EmailMessage

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.enquiry import CreateEnquiryRequest, EnquiryInDB, EnquiryResponse

INVALID_PHONE_PLACEHOLDERS = {"9999999999", "0000000000", "1111111111", "1234567890"}

def generate_enquiry_id() -> str:
    letters = "".join(random.choices(string.ascii_uppercase, k=2))
    digits = "".join(random.choices(string.digits, k=6))
    return f"KS-ENQ-{letters}{digits}"

def send_enquiry_email(enquiry_id: str, payload: CreateEnquiryRequest) -> None:
    message = EmailMessage()
    message["Subject"] = f"New Kawad Swad Enquiry - {enquiry_id}"
    message["From"] = os.environ["SMTP_USERNAME"]
    message["To"] = os.environ["ENQUIRY_RECEIVER_EMAIL"]

    body = f"""
New enquiry received on the Kawad Swad website.

Enquiry ID: {enquiry_id}
Type: {payload.type}

Contact Person: {payload.contactPerson}
Phone: {payload.phone or "Not provided"}
Email: {payload.email}

Business Name: {payload.businessName or "Not provided"}
Business Type: {payload.businessType or "Not provided"}
Location: {payload.location}

Products of Interest: {payload.productsOfInterest or "Not provided"}
Quantity: {payload.quantity or "Not provided"}

Message:
{payload.message}
"""

    message.set_content(body)

    with smtplib.SMTP_SSL(
        os.environ["SMTP_HOST"],
        int(os.environ["SMTP_PORT"]),
        timeout=20,
    ) as server:
        server.login(
            os.environ["SMTP_USERNAME"],
            os.environ["SMTP_PASSWORD"],
        )
        server.send_message(message)

async def create_enquiry_record(
    db: AsyncIOMotorDatabase, payload: CreateEnquiryRequest
) -> EnquiryResponse:
    # 1. Idempotency pre-check
    if payload.idempotencyKey:
        existing = await db.enquiries.find_one({"idempotencyKey": payload.idempotencyKey})
        if existing:
            return EnquiryResponse(
                success=True,
                enquiryId=existing["enquiryId"],
                message="Your enquiry has been received. We'll be in touch soon.",
                createdAt=existing["createdAt"].isoformat() if isinstance(existing["createdAt"], datetime) else str(existing["createdAt"]),
            )

    # 2. Phone validation and sanitization
    cleaned_phone = None
    if payload.phone:
        cleaned_phone = "".join(c for c in payload.phone if c.isdigit() or c == "+")
        digits_only = cleaned_phone.replace("+", "")
        if payload.type != "general":
            if len(digits_only) < 10 or digits_only in INVALID_PHONE_PLACEHOLDERS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid Indian phone number for business enquiries.",
                )
        else:
            if digits_only in INVALID_PHONE_PLACEHOLDERS:
                cleaned_phone = None

    if payload.type != "general" and not cleaned_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is required for business enquiries.",
        )

    # 3. Business Name validation for B2B types
    if payload.type in ["bulk", "distributor", "food-business"] and not payload.businessName:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business name is required for business enquiries.",
        )

    enquiry_id = generate_enquiry_id()
    while await db.enquiries.find_one({"enquiryId": enquiry_id}):
        enquiry_id = generate_enquiry_id()

    now = datetime.utcnow()

    enquiry_doc = EnquiryInDB(
        enquiryId=enquiry_id,
        type=payload.type,
        businessName=payload.businessName.strip() if payload.businessName else None,
        contactPerson=payload.contactPerson.strip(),
        phone=cleaned_phone,
        email=payload.email.strip().lower(),
        businessType=payload.businessType.strip() if payload.businessType else None,
        location=payload.location.strip(),
        productsOfInterest=payload.productsOfInterest.strip() if payload.productsOfInterest else None,
        quantity=payload.quantity.strip() if payload.quantity else None,
        message=payload.message.strip(),
        createdAt=now,
        status="new",
        idempotencyKey=payload.idempotencyKey,
    )

    try:
        await db.enquiries.insert_one(enquiry_doc.dict())
    except DuplicateKeyError:
        if payload.idempotencyKey:
            existing = await db.enquiries.find_one({"idempotencyKey": payload.idempotencyKey})
            if existing:
                return EnquiryResponse(
                    success=True,
                    enquiryId=existing["enquiryId"],
                    message="Your enquiry has been received. We'll be in touch soon.",
                    createdAt=existing["createdAt"].isoformat() if isinstance(existing["createdAt"], datetime) else str(existing["createdAt"]),
                )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An enquiry with this reference already exists.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record enquiry. Please try again later.",
        )

    try:
        send_enquiry_email(enquiry_id, payload)
    except Exception:
        pass

    return EnquiryResponse(
        success=True,
        enquiryId=enquiry_id,
        message="Your enquiry has been received. We'll be in touch soon.",
        createdAt=now.isoformat(),
    )
