from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.upload import router as upload_router
from app.api.goal import router as goal_router
from app.api.review import router as review_router
from app.api.notifications import router as notifications_router
from app.api.skills import router as skills_router

# Create main API router
api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(upload_router)
api_router.include_router(goal_router)
api_router.include_router(review_router)
api_router.include_router(notifications_router)
api_router.include_router(skills_router, prefix="/skills")

__all__ = [
    "api_router",
    "auth_router",
    "users_router", 
    "upload_router",
    "goal_router",
    "review_router",
    "notifications_router",
    "skills_router"
] 