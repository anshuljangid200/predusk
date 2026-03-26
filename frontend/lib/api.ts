const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchDocuments(search?: string, status?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  
  const res = await fetch(`${API_URL}/documents/?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function fetchDocument(id: string) {
  const res = await fetch(`${API_URL}/documents/${id}`);
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function uploadFiles(files: FileList) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  
  const res = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload files");
  return res.json();
}

export async function retryDocument(id: string) {
  const res = await fetch(`${API_URL}/documents/${id}/retry`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to retry document");
  return res.json();
}

export async function reviewDocument(id: string, extractedFields: any) {
  const res = await fetch(`${API_URL}/documents/${id}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_fields: extractedFields }),
  });
  if (!res.ok) throw new Error("Failed to review document");
  return res.json();
}

export async function finalizeDocument(id: string) {
  const res = await fetch(`${API_URL}/documents/${id}/finalize`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to finalize document");
  return res.json();
}

export function getExportUrl(id: string, format: "json" | "csv") {
  return `${API_URL}/documents/${id}/export?format=${format}`;
}

export function getProgressEventSource(id: string) {
  return new EventSource(`${API_URL}/documents/${id}/progress`);
}
