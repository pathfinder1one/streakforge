import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.database import Base, engine
from app.core.config import settings
from app import models  # noqa: F401 - ensures models are registered before create_all
from app.api import (
    auth, profile, targets, dashboard, streak, history,
    analytics, badges, ai, calendar, squads, leaderboard,
    notifications, shop, ml, court
)
from sqlalchemy import text

# Auto-migrate missing columns for SQLite deployments
def apply_migrations():
    with engine.connect() as conn:
        # Add user_persona to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN user_persona VARCHAR"))
        except Exception:
            pass
        # Add is_demo to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT 0 NOT NULL"))
        except Exception:
            pass
        # Add deadline_date to targets
        try:
            conn.execute(text("ALTER TABLE targets ADD COLUMN deadline_date DATETIME"))
        except Exception:
            pass
        # Add target_id to ai_conversations
        try:
            conn.execute(text("ALTER TABLE ai_conversations ADD COLUMN target_id INTEGER"))
        except Exception:
            pass
        conn.commit()

apply_migrations()
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        from app.services.scheduler_service import start_scheduler
        start_scheduler()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Scheduler could not start: {e}")
    yield
    # Shutdown
    try:
        from app.services.scheduler_service import stop_scheduler
        stop_scheduler()
    except Exception:
        pass


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(targets.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(streak.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(badges.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(squads.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(shop.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(court.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "healthy"}


# Serve the built React frontend (app/static)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
AVATARS_DIR = os.path.join(UPLOADS_DIR, "avatars")

os.makedirs(AVATARS_DIR, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=AVATARS_DIR), name="avatars")

if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Let any real file in static/ (e.g. favicon) be served directly.
        candidate = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        # Otherwise fall back to index.html so React Router can handle the route.
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"status": "ok", "message": "Backend is running, but frontend build (index.html) is missing"}
else:
    @app.get("/")
    def root():
        return {"status": "ok", "app": settings.app_name, "note": "Frontend not built yet"}
