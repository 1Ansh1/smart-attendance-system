from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    roll_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    student_class: Mapped[str] = mapped_column(String(50), index=True)
    section: Mapped[str] = mapped_column(String(20), index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())