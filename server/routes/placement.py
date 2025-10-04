from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from server.db.connection import users_collection
from server.auth.verify_jwt import verify_jwt

router = APIRouter()

def determine_level(scores: dict):
    """Example logic to convert placement test scores into levels (1–5)."""
    avg = (scores["readingScore"] + scores["writingScore"] + scores["speakingScore"]) / 3

    if avg < 4:
        return 1
    elif avg < 7:
        return 2
    elif avg < 9:
        return 3
    elif avg < 11:
        return 4
    else:
        return 5


@router.post("/placement")
def save_placement_results(data: dict, user=Depends(verify_jwt)):
    """
    Save placement test results and update literacy levels in MongoDB.
    Requires a valid Auth0 token.
    """
    user_id = user["sub"]

    # Validate incoming data
    required_fields = {"readingScore", "writingScore", "speakingScore"}
    if not required_fields.issubset(data.keys()):
        raise HTTPException(status_code=400, detail="Missing placement test fields")

    # Calculate levels
    new_level = determine_level(data)

    # Update MongoDB record
    update = {
        "$set": {
            "placementResults": data,
            "level": {
                "reading": new_level,
                "writing": new_level,
                "speaking": new_level,
            },
            "updatedAt": datetime.utcnow()
        }
    }

    result = users_collection.update_one({"_id": user_id}, update)

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found in database")

    return {
        "message": "Placement results saved successfully",
        "level": new_level
    }


@router.get("/placement")
def get_placement_results(user=Depends(verify_jwt)):
    """
    Retrieve the logged-in user's placement test results.
    """
    user_id = user["sub"]
    user_record = users_collection.find_one({"_id": user_id}, {"placementResults": 1, "level": 1, "_id": 0})

    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "placementResults": user_record.get("placementResults"),
        "level": user_record.get("level")
    }
