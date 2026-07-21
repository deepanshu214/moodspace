from fastapi import APIRouter
from src.api.v1 import auth, users, mood, feed, social, community, notification, map, matching, support

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(mood.router, prefix="/mood", tags=["mood"])
api_router.include_router(feed.router, prefix="/feed", tags=["feed"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(community.router, prefix="/community", tags=["community"])
api_router.include_router(notification.router, prefix="/notification", tags=["notification"])
api_router.include_router(map.router, prefix="/map", tags=["map"])
api_router.include_router(matching.router, prefix="/matching", tags=["matching"])
api_router.include_router(support.router, prefix="/support", tags=["support"])
