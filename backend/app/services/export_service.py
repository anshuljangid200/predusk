import io
import json
import csv
from typing import List, Dict, Any
from app.models.document import Document

class ExportService:
    @staticmethod
    def export_as_json(document: Document) -> str:
        # Find the latest completed job
        latest_job = next((j for j in sorted(document.jobs, key=lambda x: x.created_at, reverse=True) if j.status == "completed"), None)
        if not latest_job:
            return json.dumps({"error": "No completed job results found"})
        
        data = {
            "id": document.id,
            "filename": document.filename,
            "uploaded_at": document.uploaded_at.isoformat(),
            "extracted_fields": latest_job.result_json
        }
        return json.dumps(data, indent=2)

    @staticmethod
    def export_as_csv(document: Document) -> str:
        latest_job = next((j for j in sorted(document.jobs, key=lambda x: x.created_at, reverse=True) if j.status == "completed"), None)
        if not latest_job or not latest_job.result_json:
            return "error,No completed job results found"
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        fields = latest_job.result_json
        headers = ["document_id", "filename"] + list(fields.keys())
        writer.writerow(headers)
        
        # Write values
        values = [document.id, document.filename] + list(fields.values())
        # Convert lists to strings for CSV
        values = [str(v) if not isinstance(v, (list, dict)) else json.dumps(v) for v in values]
        writer.writerow(values)
        
        return output.getvalue()
