# server/routes/gemini_routes.py
import os
import requests
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/gemini", tags=["Gemini"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


@router.post("/generate")
async def generate_feedback(request: Request):
    body = await request.json()
    headers = {"Content-Type": "application/json"}

    try:
        r = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", headers=headers, json=body)
        return JSONResponse(status_code=r.status_code, content=r.json())
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
