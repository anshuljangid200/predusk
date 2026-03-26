# Async Document Processing Workflow

A production-style asynchronous document processing system built with FastAPI, Celery, Redis, PostgreSQL, and Next.js.

## Architecture Overview

- **Frontend**: Next.js 14 (App Router) with TypeScript, Tailwind CSS, and React Query.
- **Backend API**: FastAPI with SQLAlchemy ORM and Pydantic.
- **Background Worker**: Celery for asynchronous processing stages.
- **Broker/PubSub**: Redis for message queueing and real-time status updates (SSE).
- **Database**: PostgreSQL for persistent storage of document metadata and job results.
- **Orchestration**: Docker Compose for easy deployment of all 5 services.

## Features

- **Multi-file Upload**: Drag-and-drop support with progress tracking.
- **Asynchronous Workflow**: Background workers handle parsing and extraction outside the request cycle.
- **Live Progress Updates**: Real-time status badges and progress bars powered by Redis Pub/Sub and SSE.
- **Document Review**: Edit extracted fields before finalization.
- **Export Capabilities**: Download processed data as JSON or CSV.
- **Robust Error Handling**: Automatic job failure capture and retry mechanism.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed.

### Quick Start
1. Clone the repository.
2. Run `docker-compose up --build`.
3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

- `POST /api/documents/upload`: Upload files.
- `GET /api/documents`: List documents with filters.
- `GET /api/documents/{id}/progress`: SSE stream for live updates.
- `PATCH /api/documents/{id}/review`: Update extracted fields.
- `POST /api/documents/{id}/finalize`: Mark as finalized.
- `GET /api/documents/{id}/export`: Export as JSON/CSV.

## Tradeoffs and Limitations

- **Mock Parsing**: The current worker uses mock logic to simulate parsing and extraction durations. For production use, integrate tools like Tesseract OCR, AWS Textract, or specialized LLM parsers.
- **SSE Connection Limits**: Browsers limit concurrent SSE connections. For high-scale use, consider WebSockets or polling with longer intervals.
- **File Storage**: Uploads are stored in a Docker volume. In a production cloud environment, use S3-compatible storage.
# predusk
