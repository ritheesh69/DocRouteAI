

import uuid
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import JobStatus, UploadResponse, StatusResponse
from processor import process_document
from store import job_store

app = FastAPI(
    title="Intelligent Document Processing API",
    description="Multi-LLM routing with explainability for PDF processing",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload", response_model=UploadResponse, summary="Upload a PDF for processing")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    job_id = str(uuid.uuid4())
    file_bytes = await file.read()

    # Initialise job record in the in-memory store
    job_store[job_id] = {
        "job_id": job_id,
        "filename": file.filename,
        "status": JobStatus.QUEUED,
        "llm": None,
        "routing_reason": [],
        "output_preview": None,
        "page_count": None,
        "error": None,
        "progress": 0,
    }

    background_tasks.add_task(process_document, job_id, file_bytes, file.filename)

    return UploadResponse(job_id=job_id, filename=file.filename, status=JobStatus.QUEUED)


@app.get("/status/{job_id}", response_model=StatusResponse, summary="Poll job status")
async def get_status(job_id: str):

    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return StatusResponse(**job)


@app.get("/jobs", summary="List all jobs (dev convenience)")
async def list_jobs():
    """Return all jobs — useful for debugging and the dashboard initial load."""
    return JSONResponse(content=list(job_store.values()))


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
