from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

class Feedback(BaseModel):
    user_id: str
    type: str  # "speaking" or "writing"
    question_or_prompt: str
    goal: Optional[str]
    student_response: Optional[str]
    feedback: Union[Dict[str, Any], str]
    created_at: datetime = Field(default_factory=datetime.utcnow)