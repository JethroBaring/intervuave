from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from services.job_service import submit_processing_job
from processor.logger import get_logger
from processor.processor import process_interview

logger = get_logger("interview-api")

app = FastAPI(
    title="Interview Processing API",
    description="API for processing video interviews and extracting metrics",
    version="1.0.0"
)

class InterviewRequest(BaseModel):
    video_url: str
    timestamps: List[Dict[str, Any]]
    questions: Dict[str, str]
    callback_url: Optional[str] = None

class InterviewResponse(BaseModel):
    job_id: str
    status: str
    submitted_at: str

@app.post("/process-interview", response_model=InterviewResponse)
# @app.post("/process-interview")
async def create_processing_job(request: InterviewRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    submitted_at = datetime.now().isoformat()

    background_tasks.add_task(
        submit_processing_job,
        job_id,
        request.video_url,
        request.timestamps,
        request.questions,
        request.callback_url
    )
    
    # result = process_interview(job_id, {
    #     "videoUrl": request.video_url,
    #     "timestamps": request.timestamps,
    #     "questions": request.questions
    # })

    # return {
    #     "jobId": job_id,
    #     "status": "completed",
    #     "submittedAt": submitted_at,
    #     "result": result
    # }
    
    logger.info(f"Created job {job_id} for video {request.video_url}")
    return InterviewResponse(
        job_id=job_id,
        status="submitted",
        submitted_at=submitted_at,
    )
