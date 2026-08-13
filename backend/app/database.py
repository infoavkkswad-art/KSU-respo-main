from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    # Add serverSelectionTimeoutMS to prevent indefinite blocking during startup timeout on Render
    db.client = AsyncIOMotorClient(
        settings.mongodb_uri, 
        serverSelectionTimeoutMS=5000, 
        connectTimeoutMS=5000
    )
    db.db = db.client[settings.mongodb_database]
    
    # Ping with try/except to prevent startup crash if network/DNS experiences temporary latency
    try:
        await db.client.admin.command('ping')
    except Exception as e:
        print(f"Warning: MongoDB initial ping failed or timed out: {str(e)}")
    
    # Ensure indexes for order lookups, idempotency, and Razorpay
    try:
        orders_col = db.db["orders"]
        await orders_col.create_index("orderId", unique=True)
        await orders_col.create_index("razorpayOrderId", unique=True, sparse=True)
        await orders_col.create_index("idempotencyKey", unique=True, sparse=True)

        # Ensure indexes for enquiries collection
        enquiries_col = db.db["enquiries"]
        await enquiries_col.create_index("enquiryId", unique=True)
        await enquiries_col.create_index("createdAt")
        await enquiries_col.create_index("idempotencyKey", unique=True, sparse=True)

        # Ensure index for webhook event idempotency
        webhooks_col = db.db["webhook_events"]
        await webhooks_col.create_index("eventId", unique=True)
        
        print("Connected to MongoDB & indexes verified successfully!")
    except Exception as idx_err:
        print(f"Warning: Index creation deferred or failed: {str(idx_err)}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection.")

def get_database():
    return db.db
