from fastapi import APIRouter, Depends
from server.db.connection import users_collection
from server.models.user_model import new_user_document
from server.auth.verify_jwt import verify_jwt
from datetime import datetime

router = APIRouter()

@router.get("/me")
def get_or_create_user(user=Depends(verify_jwt)):
    """Check if user exists in MongoDB, else create new one"""
    user_id = user["sub"]
    existing_user = users_collection.find_one({"_id": user_id})

    if existing_user:
        # update last active time
        users_collection.update_one(
            {"_id": user_id},
            {"$set": {"updatedAt": datetime.utcnow()}}
        )
        return {"status": "existing", "user": existing_user}

    # create new user
    new_user = new_user_document(user)
    users_collection.insert_one(new_user)
    return {"status": "created", "user": new_user}
