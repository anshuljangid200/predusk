from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import document
from app.core.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Processing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Async Document Processing API is running"}
