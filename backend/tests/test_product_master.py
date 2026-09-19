"""Phase 1: 43-SKU commercial product master match."""

from __future__ import annotations

from typing import Any, Dict, List
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.models.fulfillment import FulfillmentQuote, FulfillmentType
from app.models.product import BACKEND_PRODUCTS, find_sku_in_backend
from app.services.product_master import (
    EXPECTED_SKU_COUNT,
    clear_memory_catalog,
    load_approved_catalog,
    public_product_document,
    seed_products_collection,
    use_memory_catalog,
)


PACKED_IN_MMP_200 = 102
APPROVED_MMP_200 = 55


def packed_in_website_prices() -> Dict[str, int]:
    prices = {}
    for family in BACKEND_PRODUCTS:
        for sku in family["skus"]:
            prices[sku["sku"]] = int(sku["websitePrice"])
    return prices


async def fake_manual_fulfillment(pincode: str) -> FulfillmentQuote:
    return FulfillmentQuote(
        validPincode=True,
        pincode=pincode,
        fulfillmentType=FulfillmentType.MANUAL,
        shippingCharge=0,
        officeName="Test Office",
        districtName="Test District",
        stateName="Madhya Pradesh",
        message="Test fulfilment stub for product unit prices only.",
    )


@pytest.fixture
def catalog() -> List[Dict[str, Any]]:
    loaded = load_approved_catalog()
    use_memory_catalog(loaded)
    yield loaded
    clear_memory_catalog()


@pytest.fixture
def client(catalog: List[Dict[str, Any]]) -> TestClient:
    async def noop() -> None:
        return None

    with patch("app.main.connect_to_mongo", new=noop), patch(
        "app.main.close_mongo_connection",
        new=noop,
    ), patch(
        "app.services.pricing_service.get_fulfillment_quote",
        new=AsyncMock(side_effect=fake_manual_fulfillment),
    ):
        from app.main import app

        with TestClient(app) as test_client:
            yield test_client


@pytest.mark.asyncio
async def test_seed_dry_run_matches_approved_sales_config(
    catalog: List[Dict[str, Any]],
):
    dry = await seed_products_collection(dry_run=True)
    assert dry == catalog
    assert len(dry) == EXPECTED_SKU_COUNT


def test_does_not_use_packed_in_product_py_prices(catalog: List[Dict[str, Any]]):
    packed = packed_in_website_prices()
    family, sku = find_sku_in_backend("KS-MMP-200")
    assert family is not None
    assert sku is not None
    assert int(sku["websitePrice"]) == PACKED_IN_MMP_200

    master = {item["sku"]: item for item in catalog}
    assert master["KS-MMP-200"]["selling_price"] == APPROVED_MMP_200

    for item in catalog:
        assert item["selling_price"] != packed[item["sku"]]


def test_forty_three_skus_frontend_backend_quote_match(client: TestClient, catalog):
    response = client.get("/api/products")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    api_products = {
        public_product_document(item)["sku"]: public_product_document(item)
        for item in body["products"]
    }
    assert len(api_products) == EXPECTED_SKU_COUNT

    approved = {item["sku"]: item for item in catalog}
    assert set(api_products) == set(approved)

    packed = packed_in_website_prices()

    for sku, expected in approved.items():
        api_row = api_products[sku]
        assert api_row["name"] == expected["name"]
        assert api_row["weight_g"] == expected["weight_g"]
        assert api_row["mrp"] == expected["mrp"]
        assert api_row["selling_price"] == expected["selling_price"]
        assert api_row["active"] == expected["active"]
        assert api_row["selling_price"] != packed[sku]

        quote_response = client.post(
            "/api/fulfillment/cart-quote",
            json={
                "pincode": "451220",
                "items": [
                    {
                        "sku": sku,
                        "quantity": 1,
                    }
                ],
            },
        )
        assert quote_response.status_code == 200, quote_response.text
        quote = quote_response.json()
        assert quote["success"] is True
        assert len(quote["items"]) == 1
        quoted = quote["items"][0]
        assert quoted["sku"] == sku
        assert quoted["unitPrice"] == expected["selling_price"]
        assert quoted["mrp"] == expected["mrp"]
        assert quoted["packSize"] == expected["weight_g"]
        assert quoted["productName"] == expected["name"]
        assert quoted["itemSubtotal"] == expected["selling_price"]
        assert quoted["unitPrice"] != packed[sku]
