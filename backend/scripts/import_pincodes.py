"""
KAWAD SWAD
INDIA PINCODE IMPORTER

Purpose:
    Import the complete India PIN directory into MongoDB.

Source:
    All-India-Pincode-Directory dataset.

Input:
    backend/data/pincode/all-india-pincode.csv

Collections:
    pincodes

Important:
    This script imports postal directory data only.

    It does NOT decide:
        - MANUAL
        - SHIPPING
        - pricing
        - shipping charges

Those are Kawad Swad business rules and are stored separately.
"""

import asyncio
import csv
import os
import sys
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CSV_PATH = (
    PROJECT_ROOT
    / "data"
    / "pincode"
    / "all-india-pincode.csv"
)


# ============================================================
# ENVIRONMENT
# ============================================================

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017",
)

MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "kawad_swad_db",
)


# ============================================================
# CSV HEADER NORMALIZATION
# ============================================================

HEADER_ALIASES = {
    "officename": "officeName",
    "officeName": "officeName",

    "pincode": "pincode",
    "PINCODE": "pincode",

    "officetype": "officeType",
    "officeType": "officeType",

    "deliverystatus": "deliveryStatus",
    "Deliverystatus": "deliveryStatus",
    "DELIVERYSTATUS": "deliveryStatus",

    "divisionname": "divisionName",
    "divisionName": "divisionName",

    "regionname": "regionName",
    "regionName": "regionName",

    "circlename": "circleName",
    "circlename ": "circleName",
    "circleName": "circleName",

    "taluk": "taluk",
    "Taluk": "taluk",

    "districtname": "districtName",
    "Districtname": "districtName",

    "statename": "stateName",
    "statename ": "stateName",
    "STATE": "stateName",

    "telephone": "telephone",
    "Telephone": "telephone",

    "relatedsuboffice": "relatedSuboffice",
    "relatedSuboffice": "relatedSuboffice",

    "relatedheadoffice": "relatedHeadOffice",
    "relatedHeadoffice": "relatedHeadOffice",
}


def normalize_header(value: str) -> str:
    value = (
        str(value)
        .strip()
    )

    return HEADER_ALIASES.get(
        value,
        value,
    )


# ============================================================
# VALUE NORMALIZATION
# ============================================================

def clean_value(value):
    if value is None:
        return ""

    return (
        str(value)
        .strip()
    )


def normalize_pincode(value):
    value = clean_value(value)

    digits = "".join(
        char
        for char in value
        if char.isdigit()
    )

    if len(digits) != 6:
        return None

    return digits


# ============================================================
# ROW CONVERSION
# ============================================================

def convert_row(row: dict):
    normalized = {}

    for key, value in row.items():

        clean_key = normalize_header(
            key
        )

        normalized[
            clean_key
        ] = clean_value(value)

    pincode = normalize_pincode(
        normalized.get(
            "pincode"
        )
    )

    if not pincode:
        return None

    return {
        "pincode": pincode,

        "officeName":
            normalized.get(
                "officeName",
                "",
            ),

        "officeType":
            normalized.get(
                "officeType",
                "",
            ),

        "deliveryStatus":
            normalized.get(
                "deliveryStatus",
                "",
            ),

        "divisionName":
            normalized.get(
                "divisionName",
                "",
            ),

        "regionName":
            normalized.get(
                "regionName",
                "",
            ),

        "circleName":
            normalized.get(
                "circleName",
                "",
            ),

        "taluk":
            normalized.get(
                "taluk",
                "",
            ),

        "districtName":
            normalized.get(
                "districtName",
                "",
            ),

        "stateName":
            normalized.get(
                "stateName",
                "",
            ),

        "telephone":
            normalized.get(
                "telephone",
                "",
            ),

        "relatedSuboffice":
            normalized.get(
                "relatedSuboffice",
                "",
            ),

        "relatedHeadOffice":
            normalized.get(
                "relatedHeadOffice",
                "",
            ),
    }


# ============================================================
# CSV READER
# ============================================================

def read_csv_rows():
    if not CSV_PATH.exists():

        raise FileNotFoundError(
            "\nIndia PIN CSV not found.\n\n"
            f"Expected:\n{CSV_PATH}\n\n"
            "Download the repository CSV and place it "
            "at that exact path.\n"
        )

    print(
        "================================================="
    )

    print(
        "KAWAD SWAD PINCODE IMPORT"
    )

    print(
        "================================================="
    )

    print(
        f"Source: {CSV_PATH}"
    )

    print()

    # --------------------------------------------------------
    # Try UTF-8 first.
    # Fall back to cp1252/latin1 because some historical
    # postal datasets contain non-UTF8 characters.
    # --------------------------------------------------------

    encodings = [
        "utf-8-sig",
        "cp1252",
        "latin1",
    ]

    last_error = None

    for encoding in encodings:

        try:

            with open(
                CSV_PATH,
                "r",
                encoding=encoding,
                newline="",
            ) as file:

                reader = csv.DictReader(
                    file
                )

                if not reader.fieldnames:

                    raise ValueError(
                        "CSV has no header row."
                    )

                print(
                    "CSV columns detected:"
                )

                print(
                    ", ".join(
                        reader.fieldnames
                    )
                )

                print()

                for row in reader:

                    converted = convert_row(
                        row
                    )

                    if converted:
                        yield converted

            return

        except UnicodeDecodeError as error:

            last_error = error

            continue

    raise RuntimeError(
        "Unable to decode the PIN CSV."
    ) from last_error


# ============================================================
# IMPORT
# ============================================================

async def import_pincodes():

    client = AsyncIOMotorClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=10000,
    )

    db = client[
        MONGODB_DATABASE
    ]

    collection = db[
        "pincodes"
    ]

    try:

        await client.admin.command(
            "ping"
        )

        print(
            "MongoDB connection: OK"
        )

        print()

        # ----------------------------------------------------
        # We replace the imported directory.
        #
        # This prevents stale records from previous imports.
        # ----------------------------------------------------

        print(
            "Clearing previous PIN directory..."
        )

        await collection.delete_many({})

        operations = []

        total_rows = 0
        inserted_candidates = 0

        for row in read_csv_rows():

            total_rows += 1

            operations.append(
                UpdateOne(
                    {
                        "pincode":
                            row["pincode"],

                        "officeName":
                            row["officeName"],
                    },
                    {
                        "$set":
                            row
                    },
                    upsert=True,
                )
            )

            inserted_candidates += 1

            # ------------------------------------------------
            # Bulk write every 1000 records.
            # ------------------------------------------------

            if len(operations) >= 1000:

                await collection.bulk_write(
                    operations,
                    ordered=False,
                )

                operations = []

                print(
                    f"Imported approximately "
                    f"{total_rows:,} records..."
                )

        if operations:

            await collection.bulk_write(
                operations,
                ordered=False,
            )

        # ----------------------------------------------------
        # INDEXES
        # ----------------------------------------------------

        print()

        print(
            "Creating PIN indexes..."
        )

        await collection.create_index(
            "pincode"
        )

        await collection.create_index(
            [
                ("pincode", 1),
                ("deliveryStatus", 1),
            ]
        )

        await collection.create_index(
            [
                ("stateName", 1),
                ("districtName", 1),
            ]
        )

        # ----------------------------------------------------
        # Stats
        # ----------------------------------------------------

        total_documents = (
            await collection.count_documents({})
        )

        unique_pincodes = len(
            await collection.distinct(
                "pincode"
            )
        )

        print()

        print(
            "================================================="
        )

        print(
            "IMPORT COMPLETE"
        )

        print(
            "================================================="
        )

        print(
            f"Postal-office records: "
            f"{total_documents:,}"
        )

        print(
            f"Unique PIN codes: "
            f"{unique_pincodes:,}"
        )

        print()

    finally:

        client.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            import_pincodes()
        )

    except KeyboardInterrupt:

        print(
            "\nImport cancelled."
        )

        sys.exit(1)

    except Exception as error:

        print()

        print(
            "PIN IMPORT FAILED"
        )

        print(
            str(error)
        )

        sys.exit(1)"""
KAWAD SWAD
INDIA PINCODE IMPORTER

Purpose:
    Import the complete India PIN directory into MongoDB.

Source:
    All-India-Pincode-Directory dataset.

Input:
    backend/data/pincode/all-india-pincode.csv

Collections:
    pincodes

Important:
    This script imports postal directory data only.

    It does NOT decide:
        - MANUAL
        - SHIPPING
        - pricing
        - shipping charges

Those are Kawad Swad business rules and are stored separately.
"""

import asyncio
import csv
import os
import sys
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CSV_PATH = (
    PROJECT_ROOT
    / "data"
    / "pincode"
    / "all-india-pincode.csv"
)


# ============================================================
# ENVIRONMENT
# ============================================================

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017",
)

MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "kawad_swad_db",
)


# ============================================================
# CSV HEADER NORMALIZATION
# ============================================================

HEADER_ALIASES = {
    "officename": "officeName",
    "officeName": "officeName",

    "pincode": "pincode",
    "PINCODE": "pincode",

    "officetype": "officeType",
    "officeType": "officeType",

    "deliverystatus": "deliveryStatus",
    "Deliverystatus": "deliveryStatus",
    "DELIVERYSTATUS": "deliveryStatus",

    "divisionname": "divisionName",
    "divisionName": "divisionName",

    "regionname": "regionName",
    "regionName": "regionName",

    "circlename": "circleName",
    "circlename ": "circleName",
    "circleName": "circleName",

    "taluk": "taluk",
    "Taluk": "taluk",

    "districtname": "districtName",
    "Districtname": "districtName",

    "statename": "stateName",
    "statename ": "stateName",
    "STATE": "stateName",

    "telephone": "telephone",
    "Telephone": "telephone",

    "relatedsuboffice": "relatedSuboffice",
    "relatedSuboffice": "relatedSuboffice",

    "relatedheadoffice": "relatedHeadOffice",
    "relatedHeadoffice": "relatedHeadOffice",
}


def normalize_header(value: str) -> str:
    value = (
        str(value)
        .strip()
    )

    return HEADER_ALIASES.get(
        value,
        value,
    )


# ============================================================
# VALUE NORMALIZATION
# ============================================================

def clean_value(value):
    if value is None:
        return ""

    return (
        str(value)
        .strip()
    )


def normalize_pincode(value):
    value = clean_value(value)

    digits = "".join(
        char
        for char in value
        if char.isdigit()
    )

    if len(digits) != 6:
        return None

    return digits


# ============================================================
# ROW CONVERSION
# ============================================================

def convert_row(row: dict):
    normalized = {}

    for key, value in row.items():

        clean_key = normalize_header(
            key
        )

        normalized[
            clean_key
        ] = clean_value(value)

    pincode = normalize_pincode(
        normalized.get(
            "pincode"
        )
    )

    if not pincode:
        return None

    return {
        "pincode": pincode,

        "officeName":
            normalized.get(
                "officeName",
                "",
            ),

        "officeType":
            normalized.get(
                "officeType",
                "",
            ),

        "deliveryStatus":
            normalized.get(
                "deliveryStatus",
                "",
            ),

        "divisionName":
            normalized.get(
                "divisionName",
                "",
            ),

        "regionName":
            normalized.get(
                "regionName",
                "",
            ),

        "circleName":
            normalized.get(
                "circleName",
                "",
            ),

        "taluk":
            normalized.get(
                "taluk",
                "",
            ),

        "districtName":
            normalized.get(
                "districtName",
                "",
            ),

        "stateName":
            normalized.get(
                "stateName",
                "",
            ),

        "telephone":
            normalized.get(
                "telephone",
                "",
            ),

        "relatedSuboffice":
            normalized.get(
                "relatedSuboffice",
                "",
            ),

        "relatedHeadOffice":
            normalized.get(
                "relatedHeadOffice",
                "",
            ),
    }


# ============================================================
# CSV READER
# ============================================================

def read_csv_rows():
    if not CSV_PATH.exists():

        raise FileNotFoundError(
            "\nIndia PIN CSV not found.\n\n"
            f"Expected:\n{CSV_PATH}\n\n"
            "Download the repository CSV and place it "
            "at that exact path.\n"
        )

    print(
        "================================================="
    )

    print(
        "KAWAD SWAD PINCODE IMPORT"
    )

    print(
        "================================================="
    )

    print(
        f"Source: {CSV_PATH}"
    )

    print()

    # --------------------------------------------------------
    # Try UTF-8 first.
    # Fall back to cp1252/latin1 because some historical
    # postal datasets contain non-UTF8 characters.
    # --------------------------------------------------------

    encodings = [
        "utf-8-sig",
        "cp1252",
        "latin1",
    ]

    last_error = None

    for encoding in encodings:

        try:

            with open(
                CSV_PATH,
                "r",
                encoding=encoding,
                newline="",
            ) as file:

                reader = csv.DictReader(
                    file
                )

                if not reader.fieldnames:

                    raise ValueError(
                        "CSV has no header row."
                    )

                print(
                    "CSV columns detected:"
                )

                print(
                    ", ".join(
                        reader.fieldnames
                    )
                )

                print()

                for row in reader:

                    converted = convert_row(
                        row
                    )

                    if converted:
                        yield converted

            return

        except UnicodeDecodeError as error:

            last_error = error

            continue

    raise RuntimeError(
        "Unable to decode the PIN CSV."
    ) from last_error


# ============================================================
# IMPORT
# ============================================================

async def import_pincodes():

    client = AsyncIOMotorClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=10000,
    )

    db = client[
        MONGODB_DATABASE
    ]

    collection = db[
        "pincodes"
    ]

    try:

        await client.admin.command(
            "ping"
        )

        print(
            "MongoDB connection: OK"
        )

        print()

        # ----------------------------------------------------
        # We replace the imported directory.
        #
        # This prevents stale records from previous imports.
        # ----------------------------------------------------

        print(
            "Clearing previous PIN directory..."
        )

        await collection.delete_many({})

        operations = []

        total_rows = 0
        inserted_candidates = 0

        for row in read_csv_rows():

            total_rows += 1

            operations.append(
                UpdateOne(
                    {
                        "pincode":
                            row["pincode"],

                        "officeName":
                            row["officeName"],
                    },
                    {
                        "$set":
                            row
                    },
                    upsert=True,
                )
            )

            inserted_candidates += 1

            # ------------------------------------------------
            # Bulk write every 1000 records.
            # ------------------------------------------------

            if len(operations) >= 1000:

                await collection.bulk_write(
                    operations,
                    ordered=False,
                )

                operations = []

                print(
                    f"Imported approximately "
                    f"{total_rows:,} records..."
                )

        if operations:

            await collection.bulk_write(
                operations,
                ordered=False,
            )

        # ----------------------------------------------------
        # INDEXES
        # ----------------------------------------------------

        print()

        print(
            "Creating PIN indexes..."
        )

        await collection.create_index(
            "pincode"
        )

        await collection.create_index(
            [
                ("pincode", 1),
                ("deliveryStatus", 1),
            ]
        )

        await collection.create_index(
            [
                ("stateName", 1),
                ("districtName", 1),
            ]
        )

        # ----------------------------------------------------
        # Stats
        # ----------------------------------------------------

        total_documents = (
            await collection.count_documents({})
        )

        unique_pincodes = len(
            await collection.distinct(
                "pincode"
            )
        )

        print()

        print(
            "================================================="
        )

        print(
            "IMPORT COMPLETE"
        )

        print(
            "================================================="
        )

        print(
            f"Postal-office records: "
            f"{total_documents:,}"
        )

        print(
            f"Unique PIN codes: "
            f"{unique_pincodes:,}"
        )

        print()

    finally:

        client.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            import_pincodes()
        )

    except KeyboardInterrupt:

        print(
            "\nImport cancelled."
        )

        sys.exit(1)

    except Exception as error:

        print()

        print(
            "PIN IMPORT FAILED"
        )

        print(
            str(error)
        )

        sys.exit(1)
