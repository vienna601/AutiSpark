from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv() 

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=False)
db = client["autispark"]
users_collection = db["users"]
feedback_collection = db["feedback"]