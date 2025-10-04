from datetime import datetime

def new_user_document(user_info):
    """Create default user record for new Auth0 logins"""
    return {
        "_id": user_info["sub"],  # Auth0's unique user ID
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture"),
        "role": (user_info.get("https://autispark/roles") or ["student"])[0],
        "placementResults": None,
        "level": None,
        "progress": {
            "reading": [],
            "writing": [],
            "speaking": []
        },
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
