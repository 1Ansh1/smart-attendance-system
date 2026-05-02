from pydantic import BaseModel

class StudentCreate(BaseModel):
    name: str
    roll_number: str
    student_class: str
    section: str

class StudentOut(BaseModel):
    id: int
    name: str
    roll_number: str
    student_class: str
    section: str

    class Config:
        from_attributes = True