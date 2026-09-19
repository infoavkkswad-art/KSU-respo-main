from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

from .database import (
    connect_to_mongo,
    close_mongo_connection,
)

from .routes.orders import (
    router as orders_router,
)

from .routes.enquiry_routes import (
    router as enquiries_router,
)

from .routes.indiapost_routes import (
    router as indiapost_router,
)

from .routes.reviews import (
    router as reviews_router,
)

from .routes.fulfillment import (
    router as fulfillment_router,
)


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(
    app: FastAPI,
):

    # --------------------------------------------------------
    # STARTUP
    # --------------------------------------------------------

    await connect_to_mongo()

    yield

    # --------------------------------------------------------
    # SHUTDOWN
    # --------------------------------------------------------

    await close_mongo_connection()


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Kawad Swad API",
    version="1.1.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=(
        settings.cors_origins_list
    ),

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(
    orders_router
)

app.include_router(
    enquiries_router
)

app.include_router(
    indiapost_router
)

app.include_router(
    reviews_router
)

app.include_router(
    fulfillment_router
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get(
    "/api/health"
)
async def health_check():

    return {
        "status": "ok"
    }
