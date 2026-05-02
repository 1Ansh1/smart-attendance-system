from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, String, Text
from app.db.base import Base

class StudentFace(Base):
    __tablename__ = "student_faces"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    image_path: Mapped[str] = mapped_column(String(255))
    embedding: Mapped[str] = mapped_column(Text)  