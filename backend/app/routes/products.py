"""Public commercial product master API."""

from fastapi import APIRouter

from ..services.product_master import list_products


router = APIRouter(
    prefix="/api",
    tags=["Products"],
)


@router.get("/products")
async def get_products():
    products = await list_products()
    return {
        "success": True,
        "products": products,
    }
