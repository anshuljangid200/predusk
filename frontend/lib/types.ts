export enum DocumentStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REVIEWED = "reviewed",
  FINALIZED = "finalized",
}

export enum JobStatus {
  PENDING = "pending",
  STARTED = "started",
  PARSING = "parsing",
  EXTRACTING = "extracting",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Job {
  id: number;
  document_id: number;
  status: JobStatus;
  progress_pct: number;
  current_stage: string;
  result_json: any;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  status: DocumentStatus;
  jobs: Job[];
}

export interface ProgressEvent {
  job_id: number;
  document_id: number;
  status: string;
  progress: number;
  stage: string;
  message?: string;
}
