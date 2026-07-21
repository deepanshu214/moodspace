from typing import List, Dict, Any, Optional

class MoodLensException(Exception):
    def __init__(self, code: str, status_code: int, message: str, details: Optional[List[Dict[str, Any]]] = None):
        self.code = code
        self.status_code = status_code
        self.message = message
        self.details = details or []
        super().__init__(message)

class ValidationError(MoodLensException):
    def __init__(self, message: str = "Validation failed", details: Optional[List[Dict[str, Any]]] = None):
        super().__init__("VALIDATION_ERROR", 400, message, details)

class AuthenticationError(MoodLensException):
    def __init__(self, message: str = "Not authenticated"):
        super().__init__("UNAUTHORIZED", 401, message)

class AuthorizationError(MoodLensException):
    def __init__(self, message: str = "No permission"):
        super().__init__("FORBIDDEN", 403, message)

class ResourceNotFoundError(MoodLensException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__("NOT_FOUND", 404, message)

class ConflictError(MoodLensException):
    def __init__(self, message: str = "Conflict occurred"):
        super().__init__("CONFLICT", 409, message)

class RateLimitError(MoodLensException):
    def __init__(self, message: str = "Too many requests"):
        super().__init__("RATE_LIMITED", 429, message)

class BusinessLogicError(MoodLensException):
    def __init__(self, code: str, message: str):
        super().__init__(code, 422, message)
