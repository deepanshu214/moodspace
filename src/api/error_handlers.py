from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from src.api.exceptions import MoodLensException
from src.utils.logger import logger
import uuid

def register_error_handlers(app: FastAPI):
    @app.exception_handler(MoodLensException)
    async def moodlens_exception_handler(request: Request, exc: MoodLensException):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        
        logger.warning(
            f"MoodLensException: {exc.message}",
            extra={"request_id": req_id, "status_code": exc.status_code}
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "status": exc.status_code,
                    "message": exc.message,
                    "details": exc.details,
                    "help_url": f"https://docs.moodlens.app/errors/{exc.code}"
                },
                "meta": {
                    "request_id": req_id,
                    "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        
        details = [
            {"field": ".".join([str(loc) for loc in err["loc"]]), "message": err["msg"], "code": err["type"]}
            for err in exc.errors()
        ]
        
        logger.warning(
            "Validation Error",
            extra={"request_id": req_id, "status_code": 400}
        )
        
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "status": 400,
                    "message": "Validation failed",
                    "details": details,
                    "help_url": "https://docs.moodlens.app/errors/VALIDATION_ERROR"
                },
                "meta": {
                    "request_id": req_id,
                    "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        
        logger.error(
            f"Unhandled server error: {str(exc)}",
            exc_info=True,
            extra={"request_id": req_id, "status_code": 500}
        )
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "status": 500,
                    "message": "Something went wrong on our end. Please try again.",
                    "details": []
                },
                "meta": {
                    "request_id": req_id,
                    "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
                }
            }
        )
