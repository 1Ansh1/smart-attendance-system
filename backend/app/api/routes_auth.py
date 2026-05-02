from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.teacher import Teacher
from app.schemas.auth import TeacherRegister, TeacherLogin, TokenOut
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(data: TeacherRegister, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Teacher).where(Teacher.email == data.email))
    if q.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    t = Teacher(name=data.name, email=data.email, password_hash=hash_password(data.password))
    db.add(t)
    await db.commit()
    return {"message": "Teacher registered"}

@router.post("/login", response_model=TokenOut)
async def login(data: TeacherLogin, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Teacher).where(Teacher.email == data.email))
    teacher = q.scalar_one_or_none()
    if not teacher or not verify_password(data.password, teacher.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=str(teacher.id))
    return TokenOut(access_token=token)