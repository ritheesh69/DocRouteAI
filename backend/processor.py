
import asyncio
import io
import traceback
from typing import Any, Dict

import PyPDF2

from models import JobStatus
from router import route_document
from llm_service import mock_llm_call
from store import job_store


def _extract_pdf(file_bytes: bytes) -> tuple[str, int]:

    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    page_count = len(reader.pages)
    pages_text = []
    for page in reader.pages:
        try:
            pages_text.append(page.extract_text() or "")
        except Exception:
            pages_text.append("")
    return "\n".join(pages_text), page_count


def _update_job(job_id: str, **kwargs: Any) -> None:
    if job_id in job_store:
        job_store[job_id].update(kwargs)


async def process_document(job_id: str, file_bytes: bytes, filename: str) -> None:

    try:
        _update_job(job_id, status=JobStatus.IN_PROGRESS, progress=10)

        await asyncio.sleep(0.5)  # Simulate I/O warm-up
        text, page_count = _extract_pdf(file_bytes)
        _update_job(job_id, page_count=page_count, progress=35)

        decision = route_document(text, page_count, filename)
        _update_job(
            job_id,
            llm=decision.llm,
            routing_reason=decision.reasons,
            progress=55,
        )

        output = await mock_llm_call(decision.llm, text, filename)
        _update_job(job_id, output_preview=output, progress=90)

        await asyncio.sleep(0.3)
        _update_job(job_id, status=JobStatus.COMPLETED, progress=100)

    except Exception as exc:
        error_detail = f"{type(exc).__name__}: {exc}"
        _update_job(
            job_id,
            status=JobStatus.FAILED,
            error=error_detail,
            progress=0,
        )
        traceback.print_exc()
