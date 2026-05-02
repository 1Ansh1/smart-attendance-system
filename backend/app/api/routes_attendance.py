from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceOut
from app.core.deps import get_current_user
from app.models.teacher import Teacher

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.get("", response_model=list[AttendanceOut])
async def list_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: Teacher = Depends(get_current_user),
):
    q = await db.execute(select(Attendance).order_by(Attendance.time_in.desc()))
    return list(q.scalars().all())