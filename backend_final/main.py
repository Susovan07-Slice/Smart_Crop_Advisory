import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import models
import database
from routers import ml, weather, chat, auth, farmers, loan

# Initialize SQLite DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="SmartCrop Unified AI Agriculture API",
    description="Unified Master Backend Combining ML Cascading Pipeline, Loan Financial Distress ML Model, OTP Auth, Farmer Records DB, Weather & Chat Assistant",
    version="2.1.0"
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
app.include_router(auth.router, prefix="/api", tags=["OTP Authentication & Login"])
app.include_router(farmers.router, prefix="/api", tags=["Farmer Records & Officer Dashboard"])
app.include_router(weather.router, prefix="/api", tags=["Weather & Soil Profiles"])
app.include_router(chat.router, prefix="/api", tags=["Chatbot Assistant"])

# Path to the React static frontend directory
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if os.path.exists(frontend_dir):
    assets_dir = os.path.join(frontend_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api"):
            return None
        
        file_path = os.path.join(frontend_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to SmartCrop Unified Master AI API"}
