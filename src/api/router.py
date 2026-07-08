from fastapi import APIRouter
from src.api.v1 import auth, users, mood, feed

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(mood.router, prefix="/mood", tags=["mood"])
api_router.include_router(feed.router, prefix="/feed", tags=["feed"])
