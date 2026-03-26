import time
import json
import random
import os
import tempfile
import fitz  # PyMuPDF
from celery_app import celery_app
from app.core.database import SessionLocal
from app.models.document import Document, DocumentStatus, Job, JobStatus
from app.core.config import redis_client
from app.services.s3_service import S3Service

def update_job_progress(db, job, status, progress, stage, message=None):
    job.status = status
    job.progress_pct = progress
    job.current_stage = stage
    if message:
        job.error_message = message
    db.commit()

    # Publish to Redis Pub/Sub
    event = {
        "job_id": job.id,
        "document_id": job.document_id,
        "status": status,
        "progress": progress,
        "stage": stage,
        "message": message
    }
    redis_client.publish(f"job_progress:{job.id}", json.dumps(event))

@celery_app.task(bind=True, name="process_document")
def process_document(self, job_id):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return

        doc = job.document
        if not doc:
            return
        
        # job_started
        update_job_progress(db, job, JobStatus.STARTED, 0, "job_started")
        time.sleep(1)

        # document_parsing_started
        update_job_progress(db, job, JobStatus.PARSING, 10, "document_download_started")
        
        # Download from S3 to temp file
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = os.path.join(tmp_dir, doc.filename)
            s3_success = S3Service.download_file(doc.file_path, tmp_path)
            
            if not s3_success:
                raise Exception("Failed to download file from S3")

            update_job_progress(db, job, JobStatus.PARSING, 20, "document_parsing_started")
            
            extracted_text = ""
            metadata = {}
            
            if doc.filename.lower().endswith(".pdf"):
                try:
                    with fitz.open(tmp_path) as pdf:
                        metadata = pdf.metadata
                        # Extract first 5 pages or so
                        for i in range(min(5, len(pdf))):
                            extracted_text += pdf[i].get_text()
                    
                    update_job_progress(db, job, JobStatus.PARSING, 40, "document_parsing_completed")
                except Exception as e:
                    print(f"Error parsing PDF: {e}")
                    extracted_text = "Error extracting text from PDF."
            else:
                # For non-PDFs, just use a placeholder or read as text if applicable
                extracted_text = f"Non-PDF file: {doc.filename}. Text extraction skipped."
                update_job_progress(db, job, JobStatus.PARSING, 40, "document_parsing_completed")

            time.sleep(1)

            # field_extraction_started
            update_job_progress(db, job, JobStatus.EXTRACTING, 50, "field_extraction_started")
            
            # Real-ish extraction logic
            title = metadata.get("title") or doc.filename.split(".")[0].replace("_", " ").title()
            author = metadata.get("author") or "Unknown"
            
            # Create a summary from the first 300 chars
            summary_base = extracted_text[:300].strip() or "No text content found."
            summary = f"{summary_base}..." if len(extracted_text) > 300 else summary_base

            result_json = {
                "title": title,
                "author": author,
                "category": random.choice(["Invoice", "Report", "Legal", "General"]), # Still random for now
                "summary": summary,
                "page_count": metadata.get("pageCount", 0),
                "keywords": metadata.get("keywords", "").split(",") if metadata.get("keywords") else ["extracted"],
                "status": "extracted"
            }
            
            # field_extraction_completed
            job.result_json = result_json
            update_job_progress(db, job, JobStatus.EXTRACTING, 90, "field_extraction_completed")
            time.sleep(1)

        # job_completed
        doc.status = DocumentStatus.COMPLETED
        update_job_progress(db, job, JobStatus.COMPLETED, 100, "job_completed")
        db.commit()

    except Exception as e:
        db.rollback()
        update_job_progress(db, job, JobStatus.FAILED, 0, "job_failed", str(e))
        # Ensure we can still access doc if possible
        try:
            doc = db.query(Document).filter(Document.id == job.document_id).first()
            if doc:
                doc.status = DocumentStatus.FAILED
                db.commit()
        except:
            pass
    finally:
        db.close()
