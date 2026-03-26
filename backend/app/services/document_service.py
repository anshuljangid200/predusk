import os
import shutil
import uuid
from typing import List
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentStatus, Job, JobStatus
from app.schemas.document import DocumentCreate, JobCreate
from app.services.s3_service import S3Service
from app.workers.tasks import process_document

class DocumentService:
    @staticmethod
    def upload_documents(db: Session, files) -> List[Document]:
        documents = []
        for file in files:
            file_id = str(uuid.uuid4())
            file_ext = os.path.splitext(file.filename)[1]
            object_name = f"{file_id}{file_ext}"

            # Get file size before uploading
            file.file.seek(0, os.SEEK_END)
            file_size = file.file.tell()
            file.file.seek(0)

            # Upload to S3 instead of local disk
            s3_success = S3Service.upload_file(file.file, object_name)
            if not s3_success:
                continue

            doc = Document(
                filename=file.filename,
                file_type=file.content_type,
                file_size=file_size,
                file_path=object_name, # Store S3 object name here
                status=DocumentStatus.QUEUED
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            # Create an initial job
            job = Job(
                document_id=doc.id,
                status=JobStatus.PENDING,
                progress_pct=0,
                current_stage="job_queued"
            )
            db.add(job)
            db.commit()
            db.refresh(job)

            # Trigger Celery task
            process_document.delay(job.id)
            
            documents.append(doc)
        
        return documents

    @staticmethod
    def get_documents(db: Session, search: str = None, status: DocumentStatus = None):
        query = db.query(Document)
        if search:
            query = query.filter(Document.filename.ilike(f"%{search}%"))
        if status:
            query = query.filter(Document.status == status)
        return query.order_by(Document.uploaded_at.desc()).all()

    @staticmethod
    def get_document(db: Session, doc_id: int):
        return db.query(Document).filter(Document.id == doc_id).first()

    @staticmethod
    def retry_job(db: Session, doc_id: int):
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        
        # If already completed, do nothing (idempotency)
        if doc.status == DocumentStatus.COMPLETED or doc.status == DocumentStatus.FINALIZED:
            return doc

        doc.status = DocumentStatus.QUEUED
        job = Job(
            document_id=doc.id,
            status=JobStatus.PENDING,
            progress_pct=0,
            current_stage="job_requeued"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        process_document.delay(job.id)
        return doc

    @staticmethod
    def review_document(db: Session, doc_id: int, extracted_fields: dict):
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        
        # Update the result_json of the latest successful job
        latest_job = db.query(Job).filter(Job.document_id == doc_id, Job.status == JobStatus.COMPLETED).order_by(Job.created_at.desc()).first()
        if latest_job:
            latest_job.result_json = extracted_fields
            doc.status = DocumentStatus.REVIEWED
            db.commit()
        return doc

    @staticmethod
    def finalize_document(db: Session, doc_id: int):
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        doc.status = DocumentStatus.FINALIZED
        db.commit()
        return doc
