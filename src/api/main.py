"""
FastAPI application initialization for Body Recomp Backend.
"""
import logging
import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import NoResultFound

from src.api.routers import users, measurements, goals, progress, auth, plans
from src.core.config import settings
from src.core.database import async_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting up Body Recomp Backend")
    logger.info(f"Database URL: {settings.DATABASE_URL.split('@')[-1]}")

    # Test database connection
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down Body Recomp Backend")
    await async_engine.dispose()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Body Recomp Backend",
    description="API for tracking body recomposition goals and progress",
    version="0.1.0",
    lifespan=lifespan,
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Logging Middleware with Enhanced Context
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all incoming requests with detailed context.
    Implements T111: Enhanced request/response logging.
    """
    # Generate request ID for tracing
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Extract user ID from token if present
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            from src.core.security import decode_token
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            user_id = payload.get("sub")
        except Exception:
            pass  # Token might be invalid, will be handled by auth
    
    # Start timer
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request started: {request.method} {request.url.path}",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "user_id": user_id,
            "client_host": request.client.host if request.client else None,
        },
    )

    try:
        response = await call_next(request)
        
        # Calculate response time
        response_time_ms = (time.time() - start_time) * 1000
        
        # Log response
        logger.info(
            f"Request completed: {request.method} {request.url.path} "
            f"- {response.status_code} ({response_time_ms:.2f}ms)",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "response_time_ms": response_time_ms,
                "user_id": user_id,
            },
        )
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        return response
    except Exception as e:
        # Calculate response time for failed requests
        response_time_ms = (time.time() - start_time) * 1000
        
        logger.error(
            f"Request failed: {request.method} {request.url.path} "
            f"- Error: {e} ({response_time_ms:.2f}ms)",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "response_time_ms": response_time_ms,
                "user_id": user_id,
            },
            exc_info=True,
        )
        raise


# Exception Handlers (RFC 7807 Problem Details)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """Handle validation errors with RFC 7807 format."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append({"field": field, "message": message})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "about:blank",
            "title": "Validation Error",
            "status": 422,
            "detail": "One or more fields failed validation",
            "instance": str(request.url),
            "errors": errors,
        },
    )


@app.exception_handler(NoResultFound)
async def not_found_exception_handler(
    request: Request,
    exc: NoResultFound,
):
    """Handle not found errors with RFC 7807 format."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "type": "about:blank",
            "title": "Not Found",
            "status": 404,
            "detail": "The requested resource was not found",
            "instance": str(request.url),
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle ValueError exceptions with RFC 7807 format."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "type": "about:blank",
            "title": "Bad Request",
            "status": 400,
            "detail": str(exc),
            "instance": str(request.url),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions with RFC 7807 format."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "type": "about:blank",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred",
            "instance": str(request.url),
        },
    )


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Body Recomp Backend API",
        "version": "0.1.0",
        "docs": "/docs",
    }


# Mount API routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(measurements.router, prefix="/api/v1")
app.include_router(goals.router, prefix="/api/v1")
app.include_router(progress.router, prefix="/api/v1")
app.include_router(plans.router, prefix="/api/v1")
