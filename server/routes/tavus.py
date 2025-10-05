# server/routes/tavus_routes.py
import os
import requests
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/tavus", tags=["Tavus"])

TAVUS_API_KEY = os.getenv("TAVUS_API_KEY")
TAVUS_API_URL = "https://tavusapi.com/v2"


@router.post("/conversations")
async def create_conversation(request: Request):
    data = await request.json()
    headers = {"x-api-key": TAVUS_API_KEY, "Content-Type": "application/json"}
    try:
        r = requests.post(f"{TAVUS_API_URL}/conversations", headers=headers, json=data)
        return JSONResponse(status_code=r.status_code, content=r.json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, request: Request):
    data = await request.json()
    headers = {"x-api-key": TAVUS_API_KEY, "Content-Type": "application/json"}
    try:
        r = requests.post(
            f"{TAVUS_API_URL}/conversations/{conversation_id}/messages",
            headers=headers,
            json=data,
        )
        return JSONResponse(status_code=r.status_code, content=r.json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversations/{conversation_id}/end")
async def end_conversation(conversation_id: str):
    headers = {"x-api-key": TAVUS_API_KEY}
    try:
        r = requests.post(f"{TAVUS_API_URL}/conversations/{conversation_id}/end", headers=headers)
        return JSONResponse(status_code=r.status_code, content=r.json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/conversations/active")
async def get_active_conversations():
    headers = {"x-api-key": TAVUS_API_KEY}
    try:
        r = requests.get(f"{TAVUS_API_URL}/conversations", headers=headers)
        return JSONResponse(status_code=r.status_code, content=r.json())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversations/cleanup_all")
async def cleanup_all_conversations():
    headers = {"x-api-key": TAVUS_API_KEY}
    try:
        # Get all active conversations
        r = requests.get(f"{TAVUS_API_URL}/conversations", headers=headers)
        data = r.json()
        if isinstance(data, list):
            for conv in data:
                conv_id = conv.get("conversation_id")
                if conv_id:
                    requests.post(f"{TAVUS_API_URL}/conversations/{conv_id}/end", headers=headers)
        return {"status": "cleaned", "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
