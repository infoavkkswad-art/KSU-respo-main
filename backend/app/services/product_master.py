"""
Commercial product master (Phase 1).

Checkout unit prices come from Mongo documents seeded from the approved
frontend file `src/data/sales-config.ts` (sellingPrice + MRP). Names and
pack weights come from `src/data/products.ts`.

Packed-in `backend/app/models/product.py` websitePrice values (₹102-style
SKU+shipping bundles) must never be used.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException


EXPECTED_SKU_COUNT = 43

_SKU_KEY_RE = re.compile(
    r"'((?:KS-)[A-Z0-9-]+)'\s*:\s*\{",
)

_memory_by_sku: Optional[Dict[str, Dict[str, Any]]] = None


def repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _read_text(path: Path) -> str:
    if not path.is_file():
        raise RuntimeError(f"Missing approved source file: {path}")
    return path.read_text(encoding="utf-8")


def _object_block_after(text: str, open_brace_index: int) -> str:
    if open_brace_index < 0 or open_brace_index >= len(text):
        raise RuntimeError("Invalid sales-config SKU block.")
    if text[open_brace_index] != "{":
        raise RuntimeError("Expected '{' at start of SKU block.")

    depth = 0
    for index in range(open_brace_index, len(text)):
        char = text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[open_brace_index + 1 : index]
    raise RuntimeError("Unclosed SKU block in sales-config.ts.")


def _required_number(block: str, field: str, sku: str) -> int:
    match = re.search(
        rf"{field}\s*:\s*([0-9]+)\s*,",
        block,
    )
    if not match:
        raise RuntimeError(f"{sku}: missing {field} in sales-config.ts.")
    return int(match.group(1))


def _required_bool(block: str, field: str, sku: str) -> bool:
    match = re.search(
        rf"{field}\s*:\s*(true|false)\s*,",
        block,
    )
    if not match:
        raise RuntimeError(f"{sku}: missing {field} in sales-config.ts.")
    return match.group(1) == "true"


def parse_sales_skus(sales_config_text: str) -> Dict[str, Dict[str, Any]]:
    parsed: Dict[str, Dict[str, Any]] = {}

    for match in _SKU_KEY_RE.finditer(sales_config_text):
        sku = match.group(1).strip().upper()
        brace_index = sales_config_text.find("{", match.end() - 1)
        block = _object_block_after(sales_config_text, brace_index)

        inner_sku_match = re.search(r"sku\s*:\s*'([^']+)'", block)
        if not inner_sku_match:
            raise RuntimeError(f"{sku}: missing sku field.")
        inner_sku = inner_sku_match.group(1).strip().upper()
        if inner_sku != sku:
            raise RuntimeError(
                f"{sku}: sales-config key does not match sku field."
            )

        if sku in parsed:
            raise RuntimeError(f"Duplicate SKU in sales-config.ts: {sku}")

        selling_price = _required_number(block, "sellingPrice", sku)
        mrp = _required_number(block, "mrp", sku)
        pack_size = _required_number(block, "packSize", sku)
        available = _required_bool(block, "available", sku)

        if selling_price > mrp:
            raise RuntimeError(
                f"{sku}: sellingPrice {selling_price} exceeds MRP {mrp}."
            )

        parsed[sku] = {
            "sku": sku,
            "weight_g": pack_size,
            "mrp": mrp,
            "selling_price": selling_price,
            "active": available,
        }

    if len(parsed) != EXPECTED_SKU_COUNT:
        raise RuntimeError(
            f"Expected {EXPECTED_SKU_COUNT} SKUs in sales-config.ts, "
            f"found {len(parsed)}."
        )

    return parsed


def parse_product_names(products_text: str) -> Dict[str, str]:
    names: Dict[str, str] = {}

    for skus_match in re.finditer(
        r"skus:\s*makeSkus\(\[([^\]]+)\]\)",
        products_text,
    ):
        before = products_text[: skus_match.start()]
        name_matches = re.findall(r"\n\s*name:\s*'([^']+)'", before)
        if not name_matches:
            raise RuntimeError("Could not find product family name for SKUs.")
        family_name = name_matches[-1]

        sku_codes = re.findall(r"'((?:KS-)[A-Z0-9-]+)'", skus_match.group(1))
        if not sku_codes:
            raise RuntimeError(
                f"{family_name}: makeSkus list has no SKUs."
            )

        for sku_code in sku_codes:
            sku = sku_code.strip().upper()
            if sku in names:
                raise RuntimeError(f"Duplicate product SKU: {sku}")
            names[sku] = family_name

    if len(names) != EXPECTED_SKU_COUNT:
        raise RuntimeError(
            f"Expected {EXPECTED_SKU_COUNT} named SKUs in products.ts, "
            f"found {len(names)}."
        )

    return names


def public_product_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "sku": str(doc["sku"]).strip().upper(),
        "name": str(doc["name"]).strip(),
        "weight_g": int(doc["weight_g"]),
        "mrp": int(doc["mrp"]),
        "selling_price": int(doc["selling_price"]),
        "active": bool(doc["active"]),
    }


def load_approved_catalog(
    root: Optional[Path] = None,
) -> List[Dict[str, Any]]:
    base = root or repo_root()
    sales_text = _read_text(base / "src" / "data" / "sales-config.ts")
    products_text = _read_text(base / "src" / "data" / "products.ts")

    sales = parse_sales_skus(sales_text)
    names = parse_product_names(products_text)

    missing = sorted(set(sales) - set(names))
    extra = sorted(set(names) - set(sales))
    if missing or extra:
        raise RuntimeError(
            "sales-config.ts and products.ts SKU sets differ. "
            f"Missing names: {missing}. Extra names: {extra}."
        )

    catalog = []
    for sku in sorted(sales):
        row = dict(sales[sku])
        row["name"] = names[sku]
        catalog.append(public_product_document(row))

    return catalog


def use_memory_catalog(products: List[Dict[str, Any]]) -> None:
    global _memory_by_sku
    _memory_by_sku = {
        public_product_document(item)["sku"]: public_product_document(item)
        for item in products
    }


def clear_memory_catalog() -> None:
    global _memory_by_sku
    _memory_by_sku = None


def _products_collection():
    from ..database import get_database

    database = get_database()
    if database is None:
        return None
    return database["products"]


async def seed_products_collection(
    products: Optional[List[Dict[str, Any]]] = None,
    *,
    dry_run: bool = False,
) -> List[Dict[str, Any]]:
    catalog = [
        public_product_document(item)
        for item in (products if products is not None else load_approved_catalog())
    ]

    if dry_run:
        return catalog

    collection = _products_collection()
    if collection is None:
        raise RuntimeError("MongoDB is not connected; cannot seed products.")

    for item in catalog:
        await collection.update_one(
            {"sku": item["sku"]},
            {"$set": item},
            upsert=True,
        )

    return catalog


async def list_products() -> List[Dict[str, Any]]:
    if _memory_by_sku is not None:
        return [
            public_product_document(_memory_by_sku[sku])
            for sku in sorted(_memory_by_sku)
        ]

    collection = _products_collection()
    if collection is None:
        raise HTTPException(
            status_code=503,
            detail="Product master is unavailable.",
        )

    documents = []
    async for raw in collection.find({}):
        try:
            documents.append(public_product_document(raw))
        except (KeyError, TypeError, ValueError):
            continue

    documents.sort(key=lambda item: item["sku"])
    return documents


async def get_product_by_sku(sku: str) -> Dict[str, Any]:
    normalized = str(sku).strip().upper()
    if not normalized:
        raise HTTPException(
            status_code=400,
            detail="SKU cannot be empty.",
        )

    if _memory_by_sku is not None:
        product = _memory_by_sku.get(normalized)
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid or unavailable SKU: {normalized}",
            )
        return public_product_document(product)

    collection = _products_collection()
    if collection is None:
        raise HTTPException(
            status_code=503,
            detail="Product master is unavailable.",
        )

    raw = await collection.find_one({"sku": normalized})
    if not raw:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or unavailable SKU: {normalized}",
        )

    try:
        return public_product_document(raw)
    except (KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=500,
            detail=f"Product master record is invalid for SKU {normalized}.",
        )
