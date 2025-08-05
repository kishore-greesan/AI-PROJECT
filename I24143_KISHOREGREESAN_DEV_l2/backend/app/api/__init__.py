from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .goal import router as goals_router
from .review import router as reviews_router
from .skills import router as skills_router
from .notifications import router as notifications_router
from .reports import router as reports_router
from .profile import router as profile_router

router = APIRouter()

router.include_router(auth_router, tags=["Authentication"])
router.include_router(users_router, tags=["Users"])
router.include_router(goals_router, tags=["Goals"])
router.include_router(reviews_router, tags=["Reviews"])
router.include_router(skills_router, prefix="/skills", tags=["Skills"])
router.include_router(notifications_router, tags=["Notifications"])
router.include_router(reports_router, prefix="/reports", tags=["Reports"])
router.include_router(profile_router, prefix="/profile", tags=["Profile"]) 