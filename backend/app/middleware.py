"""
Global middleware for error handling, logging, and CORS.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
from typing import Callable
import traceback

logger = logging.getLogger(__name__)


def setup_middleware(app: FastAPI, allowed_origins: list) -> None:
    """
    Configure all middleware for the FastAPI app.

    Args:
        app: FastAPI application instance
        allowed_origins: List of allowed origins for CORS
    """

    # ========================================================================
    # CORS Middleware
    # ========================================================================
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods
        allow_headers=["*"],  # Allow all headers
        expose_headers=["Content-Length", "X-Total-Count"],  # Expose custom headers
    )

    # ========================================================================
    # Global Exception Handler
    # ========================================================================
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """
        Handle all unhandled exceptions globally.
        Logs error and returns consistent JSON response.
        """
        logger.error(
            f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "client": request.client.host if request.client else None,
            },
        )

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": str(exc) if True else "An unexpected error occurred",  # Hide in prod
            },
        )

    # ========================================================================
    # Request/Response Logging Middleware
    # ========================================================================
    @app.middleware("http")
    async def logging_middleware(request: Request, call_next: Callable):
        """Log all HTTP requests and responses."""
        import time

        start_time = time.time()

        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(
                f"Request failed: {str(e)}",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                },
            )
            raise

        process_time = time.time() - start_time

        # Log request/response
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "status_code": response.status_code,
                "process_time": f"{process_time:.3f}s",
                "client": request.client.host if request.client else None,
            },
        )

        # Add process time header
        response.headers["X-Process-Time"] = str(process_time)
        return response


def setup_logging(log_level: str) -> None:
    """
    Configure Python logging.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(),  # Console output
            # Optionally add file handler: logging.FileHandler("app.log")
        ],
    )


# Standard API response models
class APIResponse:
    """Standard API response wrapper."""

    @staticmethod
    def success(data, message: str = "Success", status_code: int = 200):
        """Return successful response."""
        return JSONResponse(
            status_code=status_code,
            content={
                "success": True,
                "message": message,
                "data": data,
            },
        )

    @staticmethod
    def error(message: str, status_code: int = 400, error: str = None):
        """Return error response."""
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "error": error or message,
                "message": message,
            },
        )

    @staticmethod
    def paginated(
        items: list,
        total: int,
        page: int,
        page_size: int,
        message: str = "Success",
    ):
        """Return paginated response."""
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": message,
                "data": items,
                "pagination": {
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": (total + page_size - 1) // page_size,
                },
            },
        )
