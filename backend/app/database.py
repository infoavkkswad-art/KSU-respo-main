from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings


class Database:
    client: AsyncIOMotorClient = None
    db = None


db = Database()


async def connect_to_mongo():
    # Add serverSelectionTimeoutMS to prevent indefinite blocking
    # during startup timeout on Render.
    db.client = AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )

    db.db = db.client[
        settings.mongodb_database
    ]

    # Ping with try/except to prevent startup crash if
    # network/DNS experiences temporary latency.
    try:
        await db.client.admin.command("ping")

    except Exception as e:
        print(
            "Warning: MongoDB initial ping failed "
            f"or timed out: {str(e)}"
        )

    # Ensure indexes for orders, enquiries,
    # webhook events, and product reviews.
    try:

        # =========================================================
        # ORDERS
        # =========================================================

        orders_col = db.db["orders"]

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

        # =========================================================
        # ENQUIRIES
        # =========================================================

        enquiries_col = db.db["enquiries"]

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

        # =========================================================
        # RAZORPAY WEBHOOK EVENTS
        # =========================================================

        webhooks_col = db.db[
            "webhook_events"
        ]

        await webhooks_col.create_index(
            "eventId",
            unique=True,
        )

        # =========================================================
        # PRODUCT REVIEWS
        # =========================================================

        reviews_col = db.db["reviews"]

        # Every review gets one unique public/internal ID.
        await reviews_col.create_index(
            "reviewId",
            unique=True,
        )

        # Main lookup:
        # product -> reviews
        await reviews_col.create_index(
            "productId",
        )

        # SKU-level lookup is required for
        # verified-purchase checking.
        await reviews_col.create_index(
            "sku",
        )

        # Order-level lookup prevents the same
        # purchase from being used repeatedly.
        await reviews_col.create_index(
            "orderId",
        )

        # Used when displaying only approved reviews.
        await reviews_col.create_index(
            "status",
        )

        # Newest reviews first.
        await reviews_col.create_index(
            "createdAt",
        )

        # Fast lookup for:
        # approved reviews belonging to a product.
        await reviews_col.create_index(
            [
                ("productId", 1),
                ("status", 1),
                ("createdAt", -1),
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


async def close_mongo_connection():

    if db.client:

        db.client.close()

        print(
            "Closed MongoDB connection."
        )


def get_database():
    return db.db
