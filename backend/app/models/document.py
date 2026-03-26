import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class DocumentStatus(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REVIEWED = "reviewed"
    FINALIZED = "finalized"

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(DocumentStatus), default=DocumentStatus.QUEUED)

    jobs = relationship("Job", back_populates="document", cascade="all, delete-orphan")

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    STARTED = "started"
    PARSING = "parsing"
    EXTRACTING = "extracting"
    COMPLETED = "completed"
    FAILED = "failed"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    status = Column(Enum(JobStatus), default=JobStatus.PENDING)
    progress_pct = Column(Float, default=0.0)
    current_stage = Column(String)
    result_json = Column(JSON)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    document = relationship("Document", back_populates="jobs")
