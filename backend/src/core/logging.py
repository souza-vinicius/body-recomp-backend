"""
Structured logging configuration for Body Recomp Backend.
Implements Principle IV (audit logging) with user context.
"""
import logging
import sys
from typing import Optional
from uuid import UUID

from pythonjson_logger import jsonlogger


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional context."""

    def add_fields(self, log_record, record, message_dict):
        """Add custom fields to log record."""
        super().add_fields(log_record, record, message_dict)
        
        # Add timestamp
        log_record["timestamp"] = self.formatTime(record, self.datefmt)
        
        # Add level name
        log_record["level"] = record.levelname
        
        # Add logger name
        log_record["logger"] = record.name
        
        # Add extra fields if present
        if hasattr(record, "user_id"):
            log_record["user_id"] = str(record.user_id)
        
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id
        
        if hasattr(record, "endpoint"):
            log_record["endpoint"] = record.endpoint
        
        if hasattr(record, "method"):
            log_record["method"] = record.method
        
        if hasattr(record, "status_code"):
            log_record["status_code"] = record.status_code
        
        if hasattr(record, "response_time_ms"):
            log_record["response_time_ms"] = record.response_time_ms


def setup_logging(
    log_level: str = "INFO",
    use_json: bool = True,
) -> None:
    """
    Configure structured logging for the application.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        use_json: Whether to use JSON formatter (True for production)
    """
    level = getattr(logging, log_level.upper())
    
    # Remove existing handlers
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    
    if use_json:
        # JSON formatter for production
        formatter = CustomJsonFormatter(
            "%(timestamp)s %(level)s %(name)s %(message)s"
        )
    else:
        # Human-readable formatter for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    root_logger.setLevel(level)
    
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("asyncpg").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (usually __name__)
    
    Returns:
        Logger instance
    """
    return logging.getLogger(name)


class AuditLogger:
    """Structured audit logger for security-relevant events."""

    def __init__(self, logger_name: str = "audit"):
        """Initialize audit logger."""
        self.logger = logging.getLogger(logger_name)

    def log_authentication(
        self,
        user_id: UUID,
        email: str,
        success: bool,
        ip_address: Optional[str] = None,
    ) -> None:
        """
        Log authentication attempt.
        
        Args:
            user_id: User ID (or None for failed attempts)
            email: Email used for login
            success: Whether authentication succeeded
            ip_address: Client IP address
        """
        self.logger.info(
            "Authentication attempt",
            extra={
                "event_type": "authentication",
                "user_id": str(user_id) if user_id else None,
                "email": email,
                "success": success,
                "ip_address": ip_address,
            },
        )

    def log_user_created(
        self,
        user_id: UUID,
        email: str,
    ) -> None:
        """
        Log user creation.
        
        Args:
            user_id: New user's ID
            email: User's email
        """
        self.logger.info(
            "User created",
            extra={
                "event_type": "user_created",
                "user_id": str(user_id),
                "email": email,
            },
        )

    def log_data_access(
        self,
        user_id: UUID,
        resource_type: str,
        resource_id: UUID,
        action: str,
    ) -> None:
        """
        Log data access event.
        
        Args:
            user_id: User accessing data
            resource_type: Type of resource (goal, measurement, etc.)
            resource_id: ID of resource accessed
            action: Action performed (read, create, update, delete)
        """
        self.logger.info(
            f"Data access: {action} {resource_type}",
            extra={
                "event_type": "data_access",
                "user_id": str(user_id),
                "resource_type": resource_type,
                "resource_id": str(resource_id),
                "action": action,
            },
        )

    def log_goal_created(
        self,
        user_id: UUID,
        goal_id: UUID,
        goal_type: str,
    ) -> None:
        """
        Log goal creation.
        
        Args:
            user_id: User creating goal
            goal_id: New goal's ID
            goal_type: Type of goal (cutting/bulking)
        """
        self.logger.info(
            f"Goal created: {goal_type}",
            extra={
                "event_type": "goal_created",
                "user_id": str(user_id),
                "goal_id": str(goal_id),
                "goal_type": goal_type,
            },
        )

    def log_goal_completed(
        self,
        user_id: UUID,
        goal_id: UUID,
        goal_type: str,
    ) -> None:
        """
        Log goal completion.
        
        Args:
            user_id: User completing goal
            goal_id: Goal's ID
            goal_type: Type of goal
        """
        self.logger.info(
            f"Goal completed: {goal_type}",
            extra={
                "event_type": "goal_completed",
                "user_id": str(user_id),
                "goal_id": str(goal_id),
                "goal_type": goal_type,
            },
        )

    def log_error(
        self,
        user_id: Optional[UUID],
        error_type: str,
        error_message: str,
        endpoint: Optional[str] = None,
    ) -> None:
        """
        Log error event.
        
        Args:
            user_id: User associated with error (if any)
            error_type: Type of error
            error_message: Error message
            endpoint: API endpoint where error occurred
        """
        self.logger.error(
            f"Error: {error_type}",
            extra={
                "event_type": "error",
                "user_id": str(user_id) if user_id else None,
                "error_type": error_type,
                "error_message": error_message,
                "endpoint": endpoint,
            },
        )
