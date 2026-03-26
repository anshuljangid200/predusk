import asyncio
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, Request
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import redis_client
from app.schemas.document import DocumentResponse, DocumentReviewUpdate, DocumentStatus
from app.services.document_service import DocumentService
from app.services.export_service import ExportService

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=List[DocumentResponse])
async def upload_documents(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    return DocumentService.upload_documents(db, files)

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    search: Optional[str] = None,
    status: Optional[DocumentStatus] = None,
    db: Session = Depends(get_db)
):
    return DocumentService.get_documents(db, search, status)

@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = DocumentService.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/{doc_id}/retry", response_model=DocumentResponse)
async def retry_job(doc_id: int, db: Session = Depends(get_db)):
    doc = DocumentService.retry_job(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.patch("/{doc_id}/review", response_model=DocumentResponse)
async def review_document(doc_id: int, req: DocumentReviewUpdate, db: Session = Depends(get_db)):
    doc = DocumentService.review_document(db, doc_id, req.extracted_fields)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/{doc_id}/finalize", response_model=DocumentResponse)
async def finalize_document(doc_id: int, db: Session = Depends(get_db)):
    doc = DocumentService.finalize_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{doc_id}/export")
async def export_document(doc_id: int, format: str = "json", db: Session = Depends(get_db)):
    doc = DocumentService.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if format == "csv":
        content = ExportService.export_as_csv(doc)
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=document_{doc_id}.csv"})
    else:
        content = ExportService.export_as_json(doc)
        return Response(content=content, media_type="application/json", headers={"Content-Disposition": f"attachment; filename=document_{doc_id}.json"})

@router.get("/{doc_id}/progress")
async def get_progress(doc_id: int, db: Session = Depends(get_db)):
    doc = DocumentService.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get latest job id
    latest_job = sorted(doc.jobs, key=lambda x: x.created_at, reverse=True)[0] if doc.jobs else None
    if not latest_job:
        raise HTTPException(status_code=404, detail="No jobs found for this document")

    async def event_generator():
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f"job_progress:{latest_job.id}")
        
        # Send initial state
        initial_event = {
            "job_id": latest_job.id,
            "status": latest_job.status,
            "progress": latest_job.progress_pct,
            "stage": latest_job.current_stage,
            "message": latest_job.error_message
        }
        yield f"data: {json.dumps(initial_event)}\n\n"

        while True:
            message = pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                yield f"data: {message['data']}\n\n"
            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
