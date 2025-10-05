from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from server.db.connection import users_collection
from server.auth.verify_jwt import verify_jwt

router = APIRouter()

@router.post("/placement")
async def save_placement_results(request: Request, payload: dict = Depends(verify_jwt)):
    body = await request.json()
    user_id = body.get("user_id")

    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    update = {
        "$set": {
            "readingScore": body.get("readingScore"),
            "writingScore": body.get("writingScore"),
            "speakingScore": body.get("speakingScore"),
        }
    }

    # ✅ Try to update existing user
    result = users_collection.update_one({"_id": user_id}, update)

    # ✅ If not found, create a new document
    if result.matched_count == 0:
        new_user = {
            "_id": user_id,
            "readingScore": body.get("readingScore"),
            "writingScore": body.get("writingScore"),
            "speakingScore": body.get("speakingScore"),
        }
        users_collection.insert_one(new_user)

    # Example logic: compute placement level
    avg = (body["readingScore"] + body["writingScore"] + body["speakingScore"]) / 3
    if avg >= 80:
        level = "Advanced"
    elif avg >= 50:
        level = "Intermediate"
    else:
        level = "Beginner"

    return JSONResponse({"message": "Placement saved successfully", "level": level})



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
