"""Phase 1 + unification: one backend checkout price for all 43 SKUs."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.models.fulfillment import FulfillmentQuote, FulfillmentType
from app.services.product_master import (
    EXPECTED_SKU_COUNT,
    clear_memory_catalog,
    load_approved_catalog,
    public_product_document,
    repo_root,
    seed_products_collection,
    use_memory_catalog,
)


PACKED_IN_MMP_200 = 102
APPROVED_MMP_200 = 55


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


def test_packed_in_product_py_is_gone():
    retired = repo_root() / "backend" / "app" / "models" / "product.py"
    assert not retired.exists()


def test_frontend_does_not_import_getSellingPrice_for_checkout():
    root = repo_root()
    products_ts = (root / "src" / "data" / "products.ts").read_text(
        encoding="utf-8"
    )
    assert "getSellingPrice" not in products_ts

    for relative in (
        "src/services/product-service.ts",
        "src/utils/cart-calculations.ts",
        "src/pages/Checkout.tsx",
        "src/pages/Cart.tsx",
        "src/context/CartContext.tsx",
    ):
        text = (root / relative).read_text(encoding="utf-8")
        assert "data/sales-config" not in text, relative
        assert "from '../data/sales-config'" not in text, relative


def test_server_ts_does_not_quote_from_sales_config():
    text = (repo_root() / "server.ts").read_text(encoding="utf-8")
    assert "getSellingPrice" not in text
    assert "CHECKOUT_NOT_AUTHORITATIVE" in text
    assert "?? 55" not in text


def test_presentation_catalogue_does_not_bake_checkout_price():
    text = (repo_root() / "src" / "data" / "products.ts").read_text(
        encoding="utf-8"
    )
    assert "websitePrice: null" in text
    assert "websitePrice:\n      websiteSellingPrice" not in text


@pytest.mark.asyncio
async def test_seed_dry_run_matches_approved_sales_config(
    catalog: List[Dict[str, Any]],
):
    dry = await seed_products_collection(dry_run=True)
    assert dry == catalog
    assert len(dry) == EXPECTED_SKU_COUNT
    master = {item["sku"]: item for item in catalog}
    assert master["KS-MMP-200"]["selling_price"] == APPROVED_MMP_200
    assert master["KS-MMP-200"]["selling_price"] != PACKED_IN_MMP_200
    assert master["KS-MMP-200"]["mrp"] == 110
    assert master["KS-MMP-200"]["weight_g"] == 200
    assert master["KS-MMP-200"]["name"] == "Moong Master Papad"


def test_forty_three_skus_frontend_backend_quote_match(
    client: TestClient,
    catalog: List[Dict[str, Any]],
):
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

    for sku, expected in approved.items():
        api_row = api_products[sku]
        assert api_row["name"] == expected["name"]
        assert api_row["weight_g"] == expected["weight_g"]
        assert api_row["mrp"] == expected["mrp"]
        assert api_row["selling_price"] == expected["selling_price"]
        assert api_row["active"] == expected["active"]
        assert api_row["selling_price"] != PACKED_IN_MMP_200

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
        quoted = quote["items"][0]
        assert quoted["sku"] == sku
        assert quoted["unitPrice"] == expected["selling_price"]
        assert quoted["mrp"] == expected["mrp"]
        assert quoted["packSize"] == expected["weight_g"]
        assert quoted["productName"] == expected["name"]
        assert quoted["itemSubtotal"] == expected["selling_price"]
        assert quoted["unitPrice"] != PACKED_IN_MMP_200


def test_pricing_service_source_has_no_websitePrice_fallback():
    text = Path(
        repo_root()
        / "backend"
        / "app"
        / "services"
        / "pricing_service.py"
    ).read_text(encoding="utf-8")
    assert 'sku_obj.get("websitePrice")' not in text
    assert '"selling_price"' in text
