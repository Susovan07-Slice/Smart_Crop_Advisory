import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers import chat, ml, weather

app = FastAPI(
    title="SmartCrop AI Agriculture API",
    description="Backend for AI-Powered Smart Agriculture Assistant & Cascading ML Pipeline",
    version="1.0.0"
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
app.include_router(chat.router, prefix="/api", tags=["Chatbot"])
app.include_router(ml.router, prefix="/api", tags=["Machine Learning"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])

# Path to the frontend directory
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if os.path.exists(frontend_dir):
    # Mount static assets (assets folder)
    assets_dir = os.path.join(frontend_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for root and React SPA client-side routes
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Allow /api routes to be handled by FastAPI routers
        if full_path.startswith("api"):
            return None
        
        file_path = os.path.join(frontend_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to SmartCrop AI Agriculture API"}
