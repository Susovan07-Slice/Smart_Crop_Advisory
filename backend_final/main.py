import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import models
import database

import models_login
import database_login

from routers import ml, weather, chat, auth, farmers, loan

# Initialize Main SQLite DB & Login Details SQLite DB (login_details.db)
models.Base.metadata.create_all(bind=database.engine)
database_login.init_login_db()

app = FastAPI(
    title="SmartCrop Unified AI Agriculture API",
    description="Unified Master Backend Combining ML Cascading Pipeline, Loan Financial Distress ML Model, 4-Digit PIN Auth with SQLite login_details.db, Weather & Chat Assistant",
    version="2.2.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers (prefixed with /api)
app.include_router(ml.router, prefix="/api", tags=["Machine Learning & Cascading Pipeline"])
app.include_router(loan.router, prefix="/api", tags=["Loan Financial Distress"])
app.include_router(auth.router, prefix="/api", tags=["4-Digit PIN & Registration Auth"])
app.include_router(farmers.router, prefix="/api", tags=["Farmer Records & Officer Dashboard"])
app.include_router(weather.router, prefix="/api", tags=["Weather & Soil Profiles"])
app.include_router(chat.router, prefix="/api", tags=["Chatbot Assistant"])

# Path to the React static frontend directory (targets dist build)
base_dir = os.path.dirname(os.path.dirname(__file__))
frontend_dist = os.path.abspath(os.path.join(base_dir, "SmartCrop-main", "SmartCrop-main", "frontend", "dist"))

if not os.path.exists(frontend_dist):
    frontend_dist = os.path.abspath(os.path.join(base_dir, "frontend", "dist"))
if not os.path.exists(frontend_dist):
    frontend_dist = os.path.abspath(os.path.join(base_dir, "frontend"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            return None
        
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to SmartCrop Unified Master AI API"}



