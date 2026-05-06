import os
import json
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.student_face import StudentFace
from app.services.face_service import get_face_embedding

router = APIRouter(prefix="/faces", tags=["faces"])

UPLOAD_DIR = "uploads/students"


@router.post("/{student_id}")
async def upload_face(
    student_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
   
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

   
    embedding = get_face_embedding(file_path)

    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected")

   
    face = StudentFace(
        student_id=student_id,
        image_path=file_path,
        embedding=json.dumps(embedding),
    )

    db.add(face)
    await db.commit()

    return {"message": "Face stored successfully"}