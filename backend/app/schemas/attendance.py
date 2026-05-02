from pydantic import BaseModel
from datetime import date, datetime

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    date: date
    time_in: datetime
    confidence: float
    method: str

    class Config:
        from_attributes = True