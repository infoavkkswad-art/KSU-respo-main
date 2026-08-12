from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.mongodb_uri)
    db.db = db.client[settings.mongodb_database]
    
    # Ping to verify connection
    await db.client.admin.command('ping')
    
    # Ensure indexes for order lookups & idempotency
    orders_col = db.db["orders"]
    await orders_col.create_index("orderId", unique=True)
    await orders_col.create_index("idempotencyKey", unique=True, sparse=True)

    # Ensure indexes for enquiries collection
    enquiries_col = db.db["enquiries"]
    await enquiries_col.create_index("enquiryId", unique=True)
    await enquiries_col.create_index("createdAt")
    await enquiries_col.create_index("idempotencyKey", unique=True, sparse=True)
    
    print("Connected to MongoDB & indexes verified successfully!")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection.")

def get_database():
    return db.db
