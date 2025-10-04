from fastapi import FastAPI
from server.routes import users, placement
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(placement.router, prefix="/api", tags=["Placement"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)