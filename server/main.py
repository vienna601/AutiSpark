from fastapi import FastAPI
from server.routes import users, placement
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# BEFORE mounting routers or define endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(placement.router, prefix="/api", tags=["Placement"])
