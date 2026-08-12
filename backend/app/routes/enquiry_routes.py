from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.database import get_database
from backend.app.models.enquiry import CreateEnquiryRequest, EnquiryResponse
from backend.app.services.enquiry_service import create_enquiry_record

router = APIRouter(prefix="/api/enquiries", tags=["Enquiries"])

@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_enquiry(
    payload: CreateEnquiryRequest, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Submit a B2B, bulk, distributor, food-business, or general enquiry with idempotency support.
    """
    return await create_enquiry_record(db, payload)
