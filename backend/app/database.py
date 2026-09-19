from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings


class Database:

    client: AsyncIOMotorClient = None

    db = None


db = Database()


# ============================================================
# CONNECT
# ============================================================

async def connect_to_mongo():

    db.client = AsyncIOMotorClient(
        settings.mongodb_uri,

        serverSelectionTimeoutMS=5000,

        connectTimeoutMS=5000,
    )

    db.db = db.client[
        settings.mongodb_database
    ]

    # --------------------------------------------------------
    # DATABASE PING
    # --------------------------------------------------------

    try:

        await db.client.admin.command(
            "ping"
        )

    except Exception as e:

        print(
            "Warning: MongoDB initial ping failed "
            f"or timed out: {str(e)}"
        )

    # --------------------------------------------------------
    # INDEXES
    # --------------------------------------------------------

    try:

        # ====================================================
        # ORDERS
        # ====================================================

        orders_col = db.db[
            "orders"
        ]

        await orders_col.create_index(
            "orderId",
            unique=True,
        )

        await orders_col.create_index(
            "razorpayOrderId",
            unique=True,
            sparse=True,
        )

        await orders_col.create_index(
            "idempotencyKey",
            unique=True,
            sparse=True,
        )

        # ====================================================
        # ENQUIRIES
        # ====================================================

        enquiries_col = db.db[
            "enquiries"
        ]

        await enquiries_col.create_index(
            "enquiryId",
            unique=True,
        )

        await enquiries_col.create_index(
            "createdAt",
        )

        await enquiries_col.create_index(
            "idempotencyKey",
            unique=True,
            sparse=True,
        )

        # ====================================================
        # RAZORPAY WEBHOOK EVENTS
        # ====================================================

        webhooks_col = db.db[
            "webhook_events"
        ]

        await webhooks_col.create_index(
            "eventId",
            unique=True,
        )

        # ====================================================
        # PRODUCT REVIEWS
        # ====================================================

        reviews_col = db.db[
            "reviews"
        ]

        await reviews_col.create_index(
            "reviewId",
            unique=True,
        )

        await reviews_col.create_index(
            "productId",
        )

        await reviews_col.create_index(
            "sku",
        )

        await reviews_col.create_index(
            "orderId",
        )

        await reviews_col.create_index(
            "status",
        )

        await reviews_col.create_index(
            "createdAt",
        )

        await reviews_col.create_index(
            [
                ("productId", 1),
                ("status", 1),
                ("createdAt", -1),
            ],
        )

        # ====================================================
        # INDIA PIN DIRECTORY
        # ====================================================

        pincodes_col = db.db[
            "pincodes"
        ]

        await pincodes_col.create_index(
            "pincode",
        )

        await pincodes_col.create_index(
            [
                ("pincode", 1),
                ("deliveryStatus", 1),
            ],
        )

        await pincodes_col.create_index(
            [
                ("stateName", 1),
                ("districtName", 1),
            ],
        )

        # ====================================================
        # KAWAD SWAD FULFILMENT RULES
        # ====================================================

        fulfillment_col = db.db[
            "fulfillment_rules"
        ]

        await fulfillment_col.create_index(
            "pincode",
            unique=True,
        )

        await fulfillment_col.create_index(
            [
                ("fulfillmentType", 1),
                ("active", 1),
            ],
        )

        print(
            "Connected to MongoDB & indexes "
            "verified successfully!"
        )

    except Exception as idx_err:

        print(
            "Warning: Index creation deferred "
            f"or failed: {str(idx_err)}"
        )


# ============================================================
# CLOSE
# ============================================================

async def close_mongo_connection():

    if db.client:

        db.client.close()

        print(
            "Closed MongoDB connection."
        )


# ============================================================
# DATABASE ACCESS
# ============================================================

def get_database():

    return db.db
