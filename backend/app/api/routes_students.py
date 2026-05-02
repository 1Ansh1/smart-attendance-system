from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentOut
from app.core.deps import get_current_user
from app.models.teacher import Teacher

router = APIRouter(prefix="/students", tags=["students"])

@router.post("", response_model=StudentOut)
async def create_student(
    data: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Teacher = Depends(get_current_user),
):
    s = Student(**data.model_dump())
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s

@router.get("", response_model=list[StudentOut])
async def list_students(
    db: AsyncSession = Depends(get_db),
    current_user: Teacher = Depends(get_current_user),
):
    q = await db.execute(select(Student).order_by(Student.id.desc()))
    return list(q.scalars().all())