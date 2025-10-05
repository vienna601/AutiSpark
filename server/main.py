from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes import tavus, gemini

app = FastAPI()

# Allow React app (localhost:5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(tavus.router)
app.include_router(gemini.router)
