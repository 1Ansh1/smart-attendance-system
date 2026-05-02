import os
import json
import uuid
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.student_face import StudentFace
from app.models.attendance import Attendance
from app.services.face_service import get_face_embedding, find_best_match

router = APIRouter(prefix="/attendance", tags=["attendance"])

UPLOAD_DIR = "uploads/temp"


@router.post("/mark")
async def mark_attendance(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    # 1. Save temp image
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 2. Extract embedding
    test_embedding = get_face_embedding(file_path)

    if test_embedding is None:
        raise HTTPException(status_code=400, detail="No face detected")

    # 3. Get all stored faces
    result = await db.execute(select(StudentFace))
    faces = result.scalars().all()

    if not faces:
        raise HTTPException(status_code=404, detail="No registered faces")

    embeddings = [json.loads(f.embedding) for f in faces]

    # 4. Find match
    match_index = find_best_match(embeddings, test_embedding)

    if match_index is None:
        return {"message": "No match found"}

    matched_face = faces[match_index]

    from datetime import date

    today = date.today()

    existing = await db.execute(
        select(Attendance).where(
            Attendance.student_id == matched_face.student_id,
            Attendance.date == today
        )
    )

    if existing.scalar_one_or_none():
        return {
            "message": "Attendance already marked today",
            "student_id": matched_face.student_id
        }

    # 5. Save attendance
    attendance = Attendance(
        student_id=matched_face.student_id,
        date=datetime.now(),
        status="present"
    )

    db.add(attendance)
    await db.commit()

    return {
        "message": "Attendance marked",
        "student_id": matched_face.student_id
    }

@router.get("")
async def get_attendance(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Attendance))
    records = result.scalars().all()

    return records

from fastapi import Query
from datetime import date

@router.get("/by-date")
async def get_by_date(
    date_param: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Attendance).where(Attendance.date == date_param)
    )
    records = result.scalars().all()

    return records


@router.get("/by-student/{student_id}")
async def get_by_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Attendance).where(Attendance.student_id == student_id)
    )
    records = result.scalars().all()

    return records

from sqlalchemy import func

@router.get("/report/{student_id}")
async def student_report(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(func.count()).where(Attendance.student_id == student_id)
    )
    total_present = result.scalar()

    return {
        "student_id": student_id,
        "total_present": total_present
    }