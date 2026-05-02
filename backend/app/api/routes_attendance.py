import os
import json
import uuid
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

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