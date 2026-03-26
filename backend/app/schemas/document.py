from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional, Any
from app.models.document import DocumentStatus, JobStatus

class JobBase(BaseModel):
    status: JobStatus
    progress_pct: float
    current_stage: Optional[str] = None

class JobCreate(JobBase):
    document_id: int

class JobResponse(JobBase):
    id: int
    document_id: int
    result_json: Optional[dict] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    file_size: int

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentResponse(DocumentBase):
    id: int
    uploaded_at: datetime
    status: DocumentStatus
    jobs: List[JobResponse] = []

    model_config = ConfigDict(from_attributes=True)

class DocumentUpdate(BaseModel):
    status: Optional[DocumentStatus] = None

class DocumentReviewUpdate(BaseModel):
    extracted_fields: dict

class ProgressEvent(BaseModel):
    job_id: int
    status: str
    progress: float
    stage: str
    message: Optional[str] = None
