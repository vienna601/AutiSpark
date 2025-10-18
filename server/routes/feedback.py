from fastapi import APIRouter, Request, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from typing import Any, Dict, Union, Optional, List

from server.db.connection import db
from server.auth.verify_jwt import verify_jwt
from server.models.feedback_model import Feedback

router = APIRouter()

# ------------------------------------------------------
# Helper function to serialize Mongo documents
# ------------------------------------------------------
def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB _id to string and handle nested objects."""
    if not doc:
        return {}
    doc["_id"] = str(doc["_id"])
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


# ------------------------------------------------------
# Create new feedback (called by frontend)
# ------------------------------------------------------
@router.post("/")
async def save_feedback(request: Request, user: dict = Depends(verify_jwt)):
    """
    Save feedback from authenticated users.
    Automatically injects user_id from Auth0 token instead of requiring frontend to send it.
    """
    try:
        # ✅ Get Auth0 user_id from token
        user_sub = user.get("sub")
        print(f"✅ Saving feedback for user: {user_sub}")
        if not user_sub:
            raise HTTPException(status_code=401, detail="Invalid Auth0 token or missing 'sub' field")

        # ✅ Parse raw JSON
        body = await request.json()

        # ✅ Inject user_id
        body["user_id"] = user_sub
        body["created_at"] = datetime.utcnow()

        # ✅ Validate with Feedback model
        feedback_obj = Feedback(**body)

        # ✅ Insert into MongoDB
        result = db.feedback.insert_one(feedback_obj.dict())
        return {"message": "Feedback saved successfully", "id": str(result.inserted_id)}

    except Exception as e:
        print("❌ Error saving feedback:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------
# Retrieve feedback for the logged-in user
# ------------------------------------------------------
@router.get("/user")
async def get_user_feedback(user: dict = Depends(verify_jwt)):
    """
    Retrieve all feedback for the authenticated Auth0 user.
    """
    try:
        user_sub = user.get("sub")
        if not user_sub:
            raise HTTPException(status_code=401, detail="Invalid Auth0 token")

        feedback_docs = list(db.feedback.find({"user_id": user_sub}).sort("created_at", -1))
        for doc in feedback_docs:
            doc["_id"] = str(doc["_id"])
            if "created_at" in doc:
                doc["created_at"] = doc["created_at"].isoformat()
        return feedback_docs

    except Exception as e:
        print("❌ Error fetching user feedback:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------
# Optional: Teacher/Admin Dashboard (all users)
# ------------------------------------------------------
@router.get("/all")
async def get_all_feedback(user: dict = Depends(verify_jwt)):
    """
    Retrieve all feedback records (for admin dashboard or teachers).
    You can later extend this to check Auth0 role claims for admin privileges.
    """
    try:
        records = list(db.feedback.find().sort("created_at", -1))
        return [serialize_doc(r) for r in records]

    except Exception as e:
        print("❌ Error retrieving all feedback:", e)
        raise HTTPException(status_code=500, detail=str(e))
