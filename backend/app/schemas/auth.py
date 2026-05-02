from pydantic import BaseModel, EmailStr

class TeacherRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class TeacherLogin(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"