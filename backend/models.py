

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class JobStatus(str, Enum):
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class LLMChoice(str, Enum):
    GPT4 = "GPT-4"
    CLAUDE = "Claude 3 Opus"
    GEMINI = "Gemini Pro Vision"
    FALLBACK = "Claude 3 Haiku (Fallback)"


class UploadResponse(BaseModel):
    job_id: str
    filename: str
    status: JobStatus


class StatusResponse(BaseModel):
    job_id: str
    filename: str
    status: JobStatus
    llm: Optional[str] = None
    routing_reason: List[str] = []
    output_preview: Optional[str] = None
    page_count: Optional[int] = None
    error: Optional[str] = None
    progress: int = 0  # 0-100
