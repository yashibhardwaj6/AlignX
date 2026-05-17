from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.config import get_settings
from app.database.session import Base, SessionLocal, engine
from app.routers import admin, analytics, auth, checkins, goals, notifications, reports
from app.seed import seed_demo_data


settings = get_settings()
app = FastAPI(title="AlignX API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "AlignX"}


app.include_router(auth.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
