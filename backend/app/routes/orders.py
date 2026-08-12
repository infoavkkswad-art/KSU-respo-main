import time
from typing import Dict, List
from fastapi import APIRouter, status, Query, Request, HTTPException
from ..models.order import CreateOrderRequest, OrderTrackingResponse
from ..services.order_service import process_and_save_order, get_order_by_id_and_phone

router = APIRouter(prefix="/api", tags=["Orders"])

_RATE_LIMIT_STORE: Dict[str, List[float]] = {}
MAX_LOOKUPS_PER_MINUTE = 10

def apply_rate_limit(client_ip: str):
    now = time.time()
    history = _RATE_LIMIT_STORE.get(client_ip, [])
    history = [ts for ts in history if now - ts < 60]
    if len(history) >= MAX_LOOKUPS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many tracking lookup requests. Please wait a minute before trying again."
        )
    history.append(now)
    _RATE_LIMIT_STORE[client_ip] = history

@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(payload: CreateOrderRequest):
    order = await process_and_save_order(payload)
    return order

@router.get("/orders/{order_id}", response_model=OrderTrackingResponse)
async def track_order(
    order_id: str,
    request: Request,
    phone: str = Query(..., min_length=10, max_length=10, description="Customer 10-digit phone number for verification")
):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)
    order = await get_order_by_id_and_phone(order_id, phone)
    return order
